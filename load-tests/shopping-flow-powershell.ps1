param(
    [string]$BaseUrl = "http://localhost:5037/api",
    [int]$ConcurrentUsers = 5,
    [int]$DurationSeconds = 120,
    [string]$ResultsDir = (Join-Path $PSScriptRoot "results")
)

$ErrorActionPreference = "Stop"

if ($env:BASE_URL) { $BaseUrl = $env:BASE_URL }

$SLA_P95_MS = 500
$SLA_P99_MS = 1000
$SLA_ERROR_RATE = 0.01

function Invoke-ShoppingFlowWorker {
    param(
        [int]$UserId,
        [string]$BaseUrl,
        [int]$DurationSeconds,
        [int]$P95Ms,
        [int]$P99Ms
    )

    function Invoke-TrackedRequest {
        param(
            [int]$UserId,
            [int]$Iteration,
            [string]$Transaction,
            [string]$Method,
            [string]$Url,
            [hashtable]$Headers = @{},
            [string]$Body = $null
        )

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $status = 0
        $response = $null

        try {
            $params = @{
                Uri             = $Url
                Method          = $Method
                UseBasicParsing = $true
                TimeoutSec      = 30
            }
            if ($Headers.Count -gt 0) { $params.Headers = $Headers }
            if ($Body) {
                $params.Body = $Body
                $params.ContentType = "application/json"
            }
            $response = Invoke-WebRequest @params
            $status = [int]$response.StatusCode
        } catch {
            if ($_.Exception.Response) {
                $status = [int]$_.Exception.Response.StatusCode.value__
            }
        }

        $sw.Stop()
        $durationMs = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)

        $record = [ordered]@{
            vu          = $UserId
            iteration   = $Iteration
            transaction = $Transaction
            method      = $Method
            url         = $Url
            status      = $status
            durationMs  = $durationMs
            failed      = ($status -ge 400 -or $status -eq 0)
        }

        $breaches = @()
        if ($durationMs -ge $P99Ms) { $breaches += "p99_breach" }
        elseif ($durationMs -ge $P95Ms) { $breaches += "p95_breach" }
        if ($record.failed) { $breaches += "error_breach" }

        return [ordered]@{
            record   = $record
            breaches = $breaches
            response = $response
        }
    }

    $results = @()
    $productId = (($UserId - 1) % 5) + 1
    $iteration = 0
    $endTime = (Get-Date).AddSeconds($DurationSeconds)

    while ((Get-Date) -lt $endTime) {
        $iteration++
        $uniqueId = "$UserId-$iteration-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
        $email = "loadtest-vu$uniqueId@test.local"

        $register = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
            -Transaction "POST /auth/register" -Method POST -Url "$BaseUrl/auth/register" `
            -Body (@{
                firstName = "Load"
                lastName  = "User$UserId"
                email     = $email
                password  = "TestPass123!"
                phone     = "9876543210"
                address   = "123 Test Street"
                city      = "Hyderabad"
                state     = "Telangana"
                pincode   = "500001"
            } | ConvertTo-Json)

        $results += $register.record
        if ($register.record.failed) { continue }

        $token = ($register.response.Content | ConvertFrom-Json).token
        $authHeaders = @{ Authorization = "Bearer $token" }

        foreach ($step in @(
            @{ tx = "GET /categories"; url = "$BaseUrl/categories" },
            @{ tx = "GET /products (top-rated)"; url = "$BaseUrl/products?sort=rating&pageSize=8" },
            @{ tx = "GET /products (listing)"; url = "$BaseUrl/products?page=1&pageSize=12&sort=price_asc" },
            @{ tx = "GET /products/{id}"; url = "$BaseUrl/products/$productId" }
        )) {
            $r = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
                -Transaction $step.tx -Method GET -Url $step.url
            $results += $r.record
        }

        $addCart = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
            -Transaction "POST /cart" -Method POST -Url "$BaseUrl/cart" -Headers $authHeaders `
            -Body (@{ productId = $productId; quantity = 1 } | ConvertTo-Json)
        $results += $addCart.record

        $cart = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
            -Transaction "GET /cart" -Method GET -Url "$BaseUrl/cart" -Headers $authHeaders
        $results += $cart.record

        $cartItemId = $null
        if (-not $cart.record.failed -and $cart.response) {
            $items = $cart.response.Content | ConvertFrom-Json
            if ($items -and @($items).Count -gt 0) { $cartItemId = @($items)[0].id }
        }

        if ($cartItemId) {
            $updateCart = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
                -Transaction "PUT /cart/{id}" -Method PUT -Url "$BaseUrl/cart/$cartItemId" `
                -Headers $authHeaders -Body (@{ quantity = 2 } | ConvertTo-Json)
            $results += $updateCart.record
        }

        $order = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
            -Transaction "POST /orders" -Method POST -Url "$BaseUrl/orders" -Headers $authHeaders `
            -Body (@{
                shippingAddress = "123 Test Street, Hyderabad, Telangana 500001"
                paymentMethod   = "COD"
            } | ConvertTo-Json)
        $results += $order.record

        $orders = Invoke-TrackedRequest -UserId $UserId -Iteration $iteration `
            -Transaction "GET /orders" -Method GET -Url "$BaseUrl/orders" -Headers $authHeaders
        $results += $orders.record

        Start-Sleep -Seconds 1
    }

    return $results
}

if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}

$ReportPath = Join-Path $ResultsDir "sla-breach-report.json"

Write-Host "PowerShell load test: $ConcurrentUsers users for $DurationSeconds seconds"
Write-Host "Target: $BaseUrl"
Write-Host ""

$jobs = 1..$ConcurrentUsers | ForEach-Object {
    Start-Job -ScriptBlock ${function:Invoke-ShoppingFlowWorker} -ArgumentList $_, $BaseUrl, $DurationSeconds, $SLA_P95_MS, $SLA_P99_MS
}

Wait-Job -Job $jobs | Out-Null
$allRecords = @()
foreach ($job in $jobs) {
    $allRecords += Receive-Job -Job $job
}
$jobs | Remove-Job

$breaches = @()
$endpointBreakdown = @{}

foreach ($record in $allRecords) {
    $breachTypes = @()
    if ($record.durationMs -ge $SLA_P99_MS) { $breachTypes += "p99_breach" }
    elseif ($record.durationMs -ge $SLA_P95_MS) { $breachTypes += "p95_breach" }
    if ($record.failed) { $breachTypes += "error_breach" }

    foreach ($breachType in $breachTypes) {
        $breaches += [ordered]@{
            vu          = $record.vu
            iteration   = $record.iteration
            transaction = $record.transaction
            method      = $record.method
            url         = $record.url
            status      = $record.status
            durationMs  = $record.durationMs
            breachType  = $breachType
        }

        $key = $record.transaction
        if (-not $endpointBreakdown.ContainsKey($key)) {
            $endpointBreakdown[$key] = @{ count = 0; p95_breach = 0; p99_breach = 0; error_breach = 0 }
        }
        $endpointBreakdown[$key].count++
        $endpointBreakdown[$key][$breachType]++
    }
}

$durations = @($allRecords | ForEach-Object { [double]$_.durationMs } | Sort-Object)
$p95 = $null
$p99 = $null
if ($durations.Count -gt 0) {
    $p95 = $durations[[math]::Max(0, [math]::Ceiling($durations.Count * 0.95) - 1)]
    $p99 = $durations[[math]::Max(0, [math]::Ceiling($durations.Count * 0.99) - 1)]
}

$totalRequests = $allRecords.Count
$failedRequests = @($allRecords | Where-Object { $_.failed }).Count
$errorRate = if ($totalRequests -gt 0) { [math]::Round($failedRequests / $totalRequests, 4) } else { 0 }

$report = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    engine      = "powershell"
    config      = @{
        vus      = $ConcurrentUsers
        duration = "${DurationSeconds}s"
        baseUrl  = $BaseUrl
    }
    sla         = @{
        p95ThresholdMs     = $SLA_P95_MS
        p99ThresholdMs     = $SLA_P99_MS
        errorRateThreshold = $SLA_ERROR_RATE
    }
    summary     = @{
        totalRequests = $totalRequests
        p95Ms         = $p95
        p99Ms         = $p99
        errorRate     = $errorRate
        p95Pass       = ($null -ne $p95) -and ($p95 -lt $SLA_P95_MS)
        p99Pass       = ($null -ne $p99) -and ($p99 -lt $SLA_P99_MS)
        errorRatePass = $errorRate -lt $SLA_ERROR_RATE
        totalBreaches = $breaches.Count
    }
    endpointBreakdown = $endpointBreakdown
    breaches          = $breaches
}

$report | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportPath -Encoding UTF8

Write-Host "=== SLA Breach Report ==="
Write-Host "Total requests: $($report.summary.totalRequests)"
Write-Host "Total breaches: $($report.summary.totalBreaches)"
Write-Host "p95: $($report.summary.p95Ms) ms - $(if ($report.summary.p95Pass) { 'PASS' } else { 'FAIL' })"
Write-Host "p99: $($report.summary.p99Ms) ms - $(if ($report.summary.p99Pass) { 'PASS' } else { 'FAIL' })"
Write-Host "Error rate: $([math]::Round($report.summary.errorRate * 100, 2))% - $(if ($report.summary.errorRatePass) { 'PASS' } else { 'FAIL' })"
Write-Host ""
Write-Host "Report saved to: $ReportPath"
& (Join-Path $PSScriptRoot "Convert-LoadTestReportToHtml.ps1") -JsonPath $ReportPath -HtmlPath ([System.IO.Path]::ChangeExtension($ReportPath, ".html"))
