param(
    [string]$JsonPath = $null,
    [string]$HtmlPath = $null
)

$ErrorActionPreference = "Stop"

if (-not $JsonPath) {
    $localResults = Join-Path $PSScriptRoot "results\sla-breach-report.json"
    $adoResults = Join-Path (Split-Path $PSScriptRoot -Parent) "load-test-results\sla-breach-report.json"
    $JsonPath = if (Test-Path $localResults) { $localResults } else { $adoResults }
}

if (-not $HtmlPath) {
    $HtmlPath = [System.IO.Path]::ChangeExtension($JsonPath, ".html")
}

if (-not (Test-Path $JsonPath)) {
    Write-Error "Report not found: $JsonPath"
}

$report = Get-Content $JsonPath -Raw | ConvertFrom-Json

function Get-StatusBadge {
    param([bool]$Pass, [string]$Label)
    $class = if ($Pass) { "pass" } else { "fail" }
    $text = if ($Pass) { "PASS" } else { "FAIL" }
    return "<span class=""badge $class"">$text</span> <span class=""badge-label"">$Label</span>"
}

function Escape-Html([string]$text) {
    if ($null -eq $text) { return "" }
    return [System.Net.WebUtility]::HtmlEncode($text)
}

function Get-SlaBreachedCell {
    param([bool]$Breached)
    if ($Breached) {
        return '<span class="sla-status fail">Yes</span>'
    }
    return '<span class="sla-status pass">No</span>'
}

function Get-FailureDetail {
    param(
        $Report,
        [string]$Transaction,
        [string]$Metric,
        [bool]$Breached,
        [int]$ErrorCount = 0,
        [int]$LatencyBreachCount = 0,
        [double]$ActualErrorRate = 0,
        [double]$ActualLatencyMs = 0
    )

    if (-not $Breached) {
        return "All requests met the defined $Metric SLA."
    }

    switch -Wildcard ($Transaction) {
        "POST /auth/register" {
            if ($Metric -like "*p95*" -or $Metric -like "*p99*") {
                return "Registration exceeded latency SLA ($ActualLatencyMs ms). BCrypt password hashing adds overhead, especially on the first request per virtual user."
            }
        }
        "POST /cart" {
            return "HTTP 400 returned on $ErrorCount request(s). Product stock was depleted under sustained load, so add-to-cart failed with insufficient stock."
        }
        "POST /orders" {
            return "HTTP 400 returned on $ErrorCount request(s). Cart was empty when placing order (prior add-to-cart failed or cart already cleared after checkout)."
        }
        default {
            if ($Metric -like "*Error*") {
                return "HTTP error rate was $([math]::Round($ActualErrorRate * 100, 2))% ($ErrorCount failed request(s)) against a $([math]::Round($Report.sla.errorRateThreshold * 100, 1))% SLA."
            }
            if ($Metric -like "*p95*") {
                return "Observed p95 latency was $ActualLatencyMs ms, above the $($Report.sla.p95ThresholdMs) ms threshold."
            }
            if ($Metric -like "*p99*") {
                return "Observed p99 latency was $ActualLatencyMs ms, above the $($Report.sla.p99ThresholdMs) ms threshold."
            }
        }
    }

    return "SLA threshold was exceeded during load test execution."
}

function Build-PeResultsRows {
    param($Report)

    $transactions = @(
        "POST /auth/register",
        "GET /categories",
        "GET /products (top-rated)",
        "GET /products (listing)",
        "GET /products/{id}",
        "POST /cart",
        "GET /cart",
        "PUT /cart/{id}",
        "POST /orders",
        "GET /orders"
    )

    $requestsPerTransaction = if ($Report.summary.totalRequests -gt 0) {
        [math]::Max(1, [math]::Round($Report.summary.totalRequests / $transactions.Count))
    } else { 1 }

    $rows = @()
    foreach ($txn in $transactions) {
        $txnBreaches = @($Report.breaches | Where-Object { $_.transaction -eq $txn })
        $durations = @($txnBreaches | ForEach-Object { [double]$_.durationMs } | Sort-Object)
        $p95Actual = if ($durations.Count -gt 0) {
            $idx = [math]::Max(0, [math]::Ceiling($durations.Count * 0.95) - 1)
            [math]::Round($durations[$idx], 2)
        } else { 0 }
        $p99Actual = if ($durations.Count -gt 0) {
            $idx = [math]::Max(0, [math]::Ceiling($durations.Count * 0.99) - 1)
            [math]::Round($durations[$idx], 2)
        } else { 0 }

        $p95BreachCount = @($txnBreaches | Where-Object { $_.breachType -eq "p95_breach" }).Count
        $p99BreachCount = @($txnBreaches | Where-Object { $_.breachType -eq "p99_breach" }).Count
        $errorCount = @($txnBreaches | Where-Object { $_.breachType -eq "error_breach" }).Count
        $errorRateActual = [math]::Round($errorCount / $requestsPerTransaction, 4)

        $p95Breached = $p95BreachCount -gt 0
        $p99Breached = $p99BreachCount -gt 0
        $errorBreached = $errorRateActual -ge $Report.sla.errorRateThreshold

        $p95ActualDisplay = if ($p95Breached) { "$p95Actual ms" } else { "< $($Report.sla.p95ThresholdMs) ms" }
        $p99ActualDisplay = if ($p99Breached) { "$p99Actual ms" } else { "< $($Report.sla.p99ThresholdMs) ms" }
        $errorActualDisplay = "$([math]::Round($errorRateActual * 100, 2))% ($errorCount errors)"

        $rows += [pscustomobject]@{
            Transaction = $txn
            Metric      = "p95 Response Time"
            Defined     = "< $($Report.sla.p95ThresholdMs) ms"
            Actual      = $p95ActualDisplay
            Breached    = $p95Breached
            Details     = Get-FailureDetail -Report $Report -Transaction $txn -Metric "p95 Response Time" -Breached $p95Breached -LatencyBreachCount $p95BreachCount -ActualLatencyMs $p95Actual
        }
        $rows += [pscustomobject]@{
            Transaction = $txn
            Metric      = "p99 Response Time"
            Defined     = "< $($Report.sla.p99ThresholdMs) ms"
            Actual      = $p99ActualDisplay
            Breached    = $p99Breached
            Details     = Get-FailureDetail -Report $Report -Transaction $txn -Metric "p99 Response Time" -Breached $p99Breached -LatencyBreachCount $p99BreachCount -ActualLatencyMs $p99Actual
        }
        $rows += [pscustomobject]@{
            Transaction = $txn
            Metric      = "Error Rate"
            Defined     = "< $([math]::Round($Report.sla.errorRateThreshold * 100, 1))%"
            Actual      = $errorActualDisplay
            Breached    = $errorBreached
            Details     = Get-FailureDetail -Report $Report -Transaction $txn -Metric "Error Rate" -Breached $errorBreached -ErrorCount $errorCount -ActualErrorRate $errorRateActual
        }
    }

    return $rows
}

$peResults = Build-PeResultsRows -Report $report
$peRows = ""
foreach ($row in $peResults) {
    $rowClass = if ($row.Breached) { "row-fail" } else { "row-pass" }
    $peRows += @"
            <tr class="$rowClass">
                <td>$(Escape-Html $row.Transaction)</td>
                <td>$(Escape-Html $row.Metric)</td>
                <td>$(Escape-Html $row.Actual)</td>
                <td>$(Escape-Html $row.Defined)</td>
                <td>$(Get-SlaBreachedCell -Breached $row.Breached)</td>
                <td class="details-cell">$(Escape-Html $row.Details)</td>
            </tr>
"@
}

$endpointRows = ""
if ($report.endpointBreakdown) {
    $report.endpointBreakdown.PSObject.Properties |
        Sort-Object { $_.Value.count } -Descending |
        ForEach-Object {
            $name = Escape-Html $_.Name
            $v = $_.Value
            $endpointRows += @"
            <tr>
                <td>$name</td>
                <td>$($v.count)</td>
                <td>$($v.p95_breach)</td>
                <td>$($v.p99_breach)</td>
                <td>$($v.error_breach)</td>
            </tr>
"@
        }
}

$breachRows = ""
foreach ($b in $report.breaches) {
    $breachClass = Escape-Html $b.breachType
    $breachRows += @"
            <tr class="breach-$breachClass">
                <td>$($b.vu)</td>
                <td>$($b.iteration)</td>
                <td>$(Escape-Html $b.transaction)</td>
                <td>$(Escape-Html $b.method)</td>
                <td>$($b.status)</td>
                <td>$($b.durationMs)</td>
                <td><span class="chip $breachClass">$(Escape-Html $b.breachType)</span></td>
                <td class="url-cell">$(Escape-Html $b.url)</td>
            </tr>
"@
}

$p95Badge = Get-StatusBadge -Pass $report.summary.p95Pass -Label "p95 &lt; $($report.sla.p95ThresholdMs) ms"
$p99Badge = Get-StatusBadge -Pass $report.summary.p99Pass -Label "p99 &lt; $($report.sla.p99ThresholdMs) ms"
$errorBadge = Get-StatusBadge -Pass $report.summary.errorRatePass -Label "error rate &lt; $([math]::Round($report.sla.errorRateThreshold * 100, 1))%"

$errorPct = [math]::Round($report.summary.errorRate * 100, 2)
$generatedAt = Escape-Html $report.generatedAt
$engine = Escape-Html $report.engine
$baseUrl = Escape-Html $report.config.baseUrl
$duration = Escape-Html $report.config.duration
$vus = $report.config.vus

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test SLA Report</title>
    <style>
        :root {
            --bg: #f4f6f8;
            --card: #ffffff;
            --text: #1a1a2e;
            --muted: #5c6370;
            --border: #e2e8f0;
            --pass: #0f766e;
            --pass-bg: #ccfbf1;
            --fail: #b91c1c;
            --fail-bg: #fee2e2;
            --accent: #7c3aed;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Segoe UI", Tahoma, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
        h1 { margin: 0 0 0.25rem; font-size: 1.75rem; }
        .subtitle { color: var(--muted); margin-bottom: 2rem; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .card h2 {
            margin: 0 0 0.75rem;
            font-size: 0.95rem;
            color: var(--muted);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .metric { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
        .badge {
            display: inline-block;
            padding: 0.15rem 0.55rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.03em;
        }
        .badge.pass { background: var(--pass-bg); color: var(--pass); }
        .badge.fail { background: var(--fail-bg); color: var(--fail); }
        .badge-label { font-size: 0.85rem; color: var(--muted); margin-left: 0.35rem; }
        .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem 1.5rem; }
        .meta dt { font-size: 0.8rem; color: var(--muted); }
        .meta dd { margin: 0.15rem 0 0; font-weight: 600; }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        th, td {
            padding: 0.65rem 0.75rem;
            border-bottom: 1px solid var(--border);
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #f8fafc;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--muted);
            position: sticky;
            top: 0;
        }
        .table-wrap {
            overflow: auto;
            max-height: 520px;
            border: 1px solid var(--border);
            border-radius: 10px;
        }
        .chip {
            display: inline-block;
            padding: 0.1rem 0.45rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .chip.p95_breach { background: #fef3c7; color: #92400e; }
        .chip.p99_breach { background: #ffedd5; color: #c2410c; }
        .chip.error_breach { background: var(--fail-bg); color: var(--fail); }
        .url-cell { max-width: 280px; word-break: break-all; font-size: 0.82rem; color: var(--muted); }
        .sla-status {
            display: inline-block;
            min-width: 42px;
            text-align: center;
            padding: 0.2rem 0.55rem;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 700;
        }
        .sla-status.pass { background: var(--pass-bg); color: var(--pass); }
        .sla-status.fail { background: var(--fail-bg); color: var(--fail); }
        tr.row-pass { background: #f0fdf4; }
        tr.row-fail { background: #fef2f2; }
        tr.row-pass td, tr.row-fail td { border-bottom-color: #e5e7eb; }
        .details-cell { min-width: 280px; font-size: 0.86rem; color: var(--muted); }
        .toolbar {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 0.75rem;
            align-items: center;
        }
        .toolbar input, .toolbar select {
            padding: 0.45rem 0.65rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.9rem;
        }
        .toolbar input { min-width: 220px; flex: 1; }
        .section { margin-top: 1.5rem; }
        .section h2 { margin: 0 0 0.75rem; font-size: 1.15rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hyderabad Online Shopping - Load Test Report</h1>
        <p class="subtitle">Generated $generatedAt · Engine: $engine</p>

        <div class="grid">
            <div class="card">
                <h2>Total Requests</h2>
                <div class="metric">$($report.summary.totalRequests)</div>
            </div>
            <div class="card">
                <h2>p95 Latency</h2>
                <div class="metric">$($report.summary.p95Ms) ms</div>
                $p95Badge
            </div>
            <div class="card">
                <h2>p99 Latency</h2>
                <div class="metric">$($report.summary.p99Ms) ms</div>
                $p99Badge
            </div>
            <div class="card">
                <h2>Error Rate</h2>
                <div class="metric">$errorPct%</div>
                $errorBadge
            </div>
            <div class="card">
                <h2>SLA Breaches</h2>
                <div class="metric">$($report.summary.totalBreaches)</div>
            </div>
        </div>

        <div class="card">
            <h2>Run Configuration</h2>
            <dl class="meta">
                <div><dt>Concurrent users</dt><dd>$vus</dd></div>
                <div><dt>Duration</dt><dd>$duration</dd></div>
                <div><dt>Base URL</dt><dd>$baseUrl</dd></div>
                <div><dt>p95 threshold</dt><dd>$($report.sla.p95ThresholdMs) ms</dd></div>
                <div><dt>p99 threshold</dt><dd>$($report.sla.p99ThresholdMs) ms</dd></div>
                <div><dt>Error threshold</dt><dd>$([math]::Round($report.sla.errorRateThreshold * 100, 1))%</dd></div>
            </dl>
        </div>

        <div class="section card">
            <h2>PE Results</h2>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Transaction Name</th>
                            <th>SLA Metric</th>
                            <th>Actual SLA</th>
                            <th>Defined SLA</th>
                            <th>SLA Breached</th>
                            <th>Failure Details</th>
                        </tr>
                    </thead>
                    <tbody>$peRows</tbody>
                </table>
            </div>
        </div>

        <div class="section card">
            <h2>Endpoint Breakdown</h2>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Endpoint</th>
                            <th>Total breaches</th>
                            <th>p95</th>
                            <th>p99</th>
                            <th>Errors</th>
                        </tr>
                    </thead>
                    <tbody>$endpointRows</tbody>
                </table>
            </div>
        </div>

        <div class="section card">
            <h2>SLA Breaching Transactions ($($report.breaches.Count))</h2>
            <div class="toolbar">
                <input id="search" type="search" placeholder="Filter by endpoint, breach type, VU..." />
                <select id="breachFilter">
                    <option value="">All breach types</option>
                    <option value="p95_breach">p95_breach</option>
                    <option value="p99_breach">p99_breach</option>
                    <option value="error_breach">error_breach</option>
                </select>
            </div>
            <div class="table-wrap">
                <table id="breachTable">
                    <thead>
                        <tr>
                            <th>VU</th>
                            <th>Iter</th>
                            <th>Transaction</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Duration (ms)</th>
                            <th>Breach</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>$breachRows</tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        const search = document.getElementById('search');
        const breachFilter = document.getElementById('breachFilter');
        const rows = Array.from(document.querySelectorAll('#breachTable tbody tr'));

        function applyFilters() {
            const q = search.value.toLowerCase();
            const type = breachFilter.value;
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const matchType = !type || row.classList.contains('breach-' + type);
                const matchSearch = !q || text.includes(q);
                row.style.display = matchType && matchSearch ? '' : 'none';
            });
        }

        search.addEventListener('input', applyFilters);
        breachFilter.addEventListener('change', applyFilters);
    </script>
</body>
</html>
"@

$html | Set-Content -Path $HtmlPath -Encoding UTF8
Write-Host "HTML report written to: $HtmlPath"
