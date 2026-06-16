$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResultsDir = Join-Path $ScriptDir "results"
$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:5037/api" }
$HealthUrl = $BaseUrl -replace "/api$", "/api/categories"
$StreamPath = Join-Path $ResultsDir "k6-stream.json"
$SummaryPath = Join-Path $ResultsDir "k6-summary.json"
$ReportPath = Join-Path $ResultsDir "sla-breach-report.json"

$SLA_P95_MS = 500
$SLA_P99_MS = 1000
$SLA_ERROR_RATE = 0.01

function Get-K6Path {
    $k6Cmd = Get-Command k6 -ErrorAction SilentlyContinue
    if ($k6Cmd) { return $k6Cmd.Source }

    $k6Paths = @(
        "$env:ProgramFiles\k6\k6.exe",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Links\k6.exe"
    )
    foreach ($path in $k6Paths) {
        if (Test-Path $path) { return $path }
    }

    return $null
}

function Build-BreachReport {
    param(
        [string]$StreamFile,
        [string]$SummaryFile,
        [string]$OutputFile
    )

    $durations = @()
    $failedCount = 0
    $totalRequests = 0
    $breaches = @()
    $endpointBreakdown = @{}

    if (Test-Path $StreamFile) {
        Get-Content $StreamFile | ForEach-Object {
            $line = $_ | ConvertFrom-Json
            if ($line.type -ne "Point") { return }

            if ($line.metric -eq "http_req_failed") {
                $totalRequests++
                if ($line.data.value -eq 1) { $failedCount++ }
            }

            if ($line.metric -ne "http_req_duration") { return }

            $durationMs = [math]::Round($line.data.value, 2)
            $durations += $durationMs

            $transaction = $line.data.tags.transaction
            $status = [int]$line.data.tags.status
            $method = $line.data.tags.method
            $url = $line.data.tags.url
            $vu = $line.data.tags.vu
            $iteration = $line.data.tags.iter

            $breachTypes = @()
            if ($durationMs -ge $SLA_P99_MS) { $breachTypes += "p99_breach" }
            elseif ($durationMs -ge $SLA_P95_MS) { $breachTypes += "p95_breach" }
            if ($status -ge 400) { $breachTypes += "error_breach" }

            foreach ($breachType in $breachTypes) {
                $breaches += [ordered]@{
                    vu          = [int]$vu
                    iteration   = [int]$iteration
                    transaction = $transaction
                    method      = $method
                    url         = $url
                    status      = $status
                    durationMs  = $durationMs
                    breachType  = $breachType
                }

                if (-not $endpointBreakdown.ContainsKey($transaction)) {
                    $endpointBreakdown[$transaction] = @{
                        count        = 0
                        p95_breach   = 0
                        p99_breach   = 0
                        error_breach = 0
                    }
                }
                $endpointBreakdown[$transaction].count++
                $endpointBreakdown[$transaction][$breachType]++
            }
        }
    }

    $p95 = $null
    $p99 = $null
    if ($durations.Count -gt 0) {
        $sorted = $durations | Sort-Object
        $p95Index = [math]::Ceiling($sorted.Count * 0.95) - 1
        $p99Index = [math]::Ceiling($sorted.Count * 0.99) - 1
        $p95 = $sorted[[math]::Max(0, $p95Index)]
        $p99 = $sorted[[math]::Max(0, $p99Index)]
    }

    if (Test-Path $SummaryFile) {
        $summary = Get-Content $SummaryFile -Raw | ConvertFrom-Json
        if ($summary.metrics.http_req_duration.values.'p(95)') {
            $p95 = [math]::Round($summary.metrics.http_req_duration.values.'p(95)', 2)
        }
        if ($summary.metrics.http_req_duration.values.'p(99)') {
            $p99 = [math]::Round($summary.metrics.http_req_duration.values.'p(99)', 2)
        }
        if ($summary.metrics.http_reqs.values.count) {
            $totalRequests = [int]$summary.metrics.http_reqs.values.count
        }
        if ($summary.metrics.http_req_failed.values.rate -ne $null) {
            $errorRate = [math]::Round($summary.metrics.http_req_failed.values.rate, 4)
        } else {
            $errorRate = if ($totalRequests -gt 0) { [math]::Round($failedCount / $totalRequests, 4) } else { 0 }
        }
    } else {
        $errorRate = if ($totalRequests -gt 0) { [math]::Round($failedCount / $totalRequests, 4) } else { 0 }
    }

    $report = [ordered]@{
        generatedAt = (Get-Date).ToUniversalTime().ToString("o")
        config      = @{
            vus      = 5
            duration = "2m"
            baseUrl  = $BaseUrl
        }
        sla         = @{
            p95ThresholdMs     = $SLA_P95_MS
            p99ThresholdMs     = $SLA_P99_MS
            errorRateThreshold = $SLA_ERROR_RATE
        }
        summary     = @{
            totalRequests  = $totalRequests
            p95Ms          = $p95
            p99Ms          = $p99
            errorRate      = $errorRate
            p95Pass        = ($null -ne $p95) -and ($p95 -lt $SLA_P95_MS)
            p99Pass        = ($null -ne $p99) -and ($p99 -lt $SLA_P99_MS)
            errorRatePass  = $errorRate -lt $SLA_ERROR_RATE
            totalBreaches  = $breaches.Count
        }
        endpointBreakdown = $endpointBreakdown
        breaches          = $breaches
    }

    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $OutputFile -Encoding UTF8
    return $report
}

Write-Host "Hyderabad Online Shopping - Load Test Runner"
Write-Host "============================================="
Write-Host "Target: $BaseUrl"
Write-Host ""

$k6Exe = Get-K6Path

Write-Host "Checking backend health at $HealthUrl ..."
try {
    $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 10
    Write-Host "Backend OK (HTTP $($response.StatusCode))"
} catch {
    Write-Error "Backend not reachable at $HealthUrl. Start it with: cd backend\HyderabadBazaar.API; dotnet run --launch-profile http"
    exit 1
}

if (-not $k6Exe) {
    Write-Warning "k6 not found. Falling back to PowerShell load test engine."
    & (Join-Path $ScriptDir "shopping-flow-powershell.ps1") -BaseUrl $BaseUrl -ConcurrentUsers 5 -DurationSeconds 120 -ResultsDir $ResultsDir
    exit $LASTEXITCODE
}

Write-Host "Using k6: $k6Exe"

if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}

if (Test-Path $StreamPath) { Remove-Item $StreamPath -Force }
if (Test-Path $SummaryPath) { Remove-Item $SummaryPath -Force }
if (Test-Path $ReportPath) { Remove-Item $ReportPath -Force }

Write-Host ""
Write-Host "Running load test: 5 VUs for 2 minutes ..."
Write-Host ""

Push-Location $ScriptDir
try {
    & $k6Exe run `
        --vus 5 `
        --duration 2m `
        -e "BASE_URL=$BaseUrl" `
        --out "json=$StreamPath" `
        (Join-Path $ScriptDir "shopping-flow.js")
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

$report = Build-BreachReport -StreamFile $StreamPath -SummaryFile $SummaryPath -OutputFile $ReportPath

Write-Host ""
Write-Host "=== SLA Breach Report ==="
Write-Host "Total requests: $($report.summary.totalRequests)"
Write-Host "Total breaches: $($report.summary.totalBreaches)"
Write-Host "p95: $($report.summary.p95Ms) ms - $(if ($report.summary.p95Pass) { 'PASS' } else { 'FAIL' })"
Write-Host "p99: $($report.summary.p99Ms) ms - $(if ($report.summary.p99Pass) { 'PASS' } else { 'FAIL' })"
Write-Host "Error rate: $([math]::Round($report.summary.errorRate * 100, 2))% - $(if ($report.summary.errorRatePass) { 'PASS' } else { 'FAIL' })"
Write-Host ""

if ($report.endpointBreakdown.PSObject.Properties.Count -gt 0) {
    Write-Host "Top breaching endpoints:"
    $report.endpointBreakdown.PSObject.Properties |
        Sort-Object { $_.Value.count } -Descending |
        Select-Object -First 5 |
        ForEach-Object { Write-Host "  $($_.Name): $($_.Value.count) breaches" }
    Write-Host ""
}

Write-Host "Report saved to: $ReportPath"
& (Join-Path $ScriptDir "Convert-LoadTestReportToHtml.ps1") -JsonPath $ReportPath -HtmlPath ([System.IO.Path]::ChangeExtension($ReportPath, ".html"))
exit $exitCode
