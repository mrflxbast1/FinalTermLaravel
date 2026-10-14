param(
    [ValidateRange(1024, 65535)][int]$Port = 8000,
    [switch]$NoBrowser,
    [switch]$InitializeOnly
)

$lock = $null
$server = $null
$guard = $null
$result = 0
try {
    . (Join-Path $PSScriptRoot 'portable-common.ps1')
    if (-not [Environment]::Is64BitOperatingSystem) { throw 'This portable release needs 64-bit Windows 10 or 11.' }
    $script:AppRoot = Split-Path -Parent $PSScriptRoot
    $runtime = Join-Path (Split-Path -Parent $script:AppRoot) 'runtime/php'
    $script:Php = Join-Path $runtime 'php.exe'
    $script:StatePath = Join-Path $script:AppRoot 'storage/portable.json'
    $script:PhpOptions = @('-c', "$runtime/php.ini", '-d', "extension_dir=$runtime/ext")
    Set-Location -LiteralPath $script:AppRoot
    if (-not (Test-Path -LiteralPath $script:Php)) { throw 'The bundled PHP runtime is missing. Extract the entire portable ZIP, then open Open Stockroom.cmd.' }
    foreach ($required in @('vendor/autoload.php', 'public/build/manifest.json', '.env.example')) {
        if (-not (Test-Path -LiteralPath $required)) { throw "The release is incomplete ($required is missing). Extract the entire ZIP again." }
    }
    if (Test-Path -LiteralPath 'public/hot') { throw 'This copy has development mode enabled. Use a fresh portable release ZIP.' }
    try {
        $lock = [IO.File]::Open((Join-Path $script:AppRoot 'storage/portable.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    } catch [IO.IOException] {
        for ($attempt = 0; $attempt -lt 30; $attempt++) {
            $running = Get-RunningStockroom
            if ($running) {
                $url = "http://127.0.0.1:$($running.port)"
                Write-Host "Stockroom is already running at $url" -ForegroundColor Green
                Open-StockroomBrowser $url
                exit 0
            }
            Start-Sleep -Milliseconds 300
        }
        throw 'This copy is already starting, or its folder is not writable. Check the other Stockroom window and extract to Documents if needed.'
    }
    Register-PortableProcessGuard
    $null = [StockroomProcessGuard]::SetErrorMode(0x8003)
    Test-PortablePhp
    $env:PHP_INI_SCAN_DIR = Join-Path $runtime 'conf.d'
    $env:DB_CONNECTION = 'sqlite'
    $env:DB_DATABASE = Join-Path $script:AppRoot 'database/database.sqlite'
    $env:APP_DEBUG = 'false'
    $env:MAIL_MAILER = 'log'
    Write-Host 'Preparing Stockroom...' -ForegroundColor Cyan
    Initialize-PortableData
    if ($InitializeOnly) { Write-Host 'Stockroom is ready.' -ForegroundColor Green; exit 0 }

    $port = Find-PortablePort $Port
    $url = "http://127.0.0.1:$port"
    $env:APP_URL = $url
    $env:STOCKROOM_INSTANCE = [guid]::NewGuid().ToString('N')
    $arguments = @($script:PhpOptions) + @('-S', "127.0.0.1:$port", '-t', "$script:AppRoot/public", "$PSScriptRoot/portable-router.php")
    $quoted = ($arguments | ForEach-Object { '"' + $_ + '"' }) -join ' '
    $guard = [StockroomProcessGuard]::new()
    $server = Start-Process -FilePath $script:Php -ArgumentList $quoted -WorkingDirectory $script:AppRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput 'storage/logs/portable-server-output.log' -RedirectStandardError 'storage/logs/portable-server-error.log'
    $guard.Add($server.Handle)
    Write-Utf8 $script:StatePath (@{ port = $port; pid = $server.Id; instance = $env:STOCKROOM_INSTANCE } | ConvertTo-Json)

    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if ($server.HasExited) { throw 'The local server stopped. Read app/storage/logs/portable-server-error.log for details.' }
        if (Get-RunningStockroom) {
            try {
                $page = Invoke-WebRequest "$url/login" -UseBasicParsing -TimeoutSec 3
                if ($page.StatusCode -eq 200) { $ready = $true; break }
            } catch { }
        }
        Start-Sleep -Milliseconds 200
    }
    if (-not $ready) { throw 'The app did not become ready. Read app/storage/logs/laravel.log for details.' }
    Write-Host "`nStockroom is running at $url" -ForegroundColor Green
    Write-Host 'Keep this window open. Press Q here, or close this window, to stop.'
    Open-StockroomBrowser $url
    while (-not $server.WaitForExit(300)) {
        if (-not [Console]::IsInputRedirected -and [Console]::KeyAvailable) {
            if ([Console]::ReadKey($true).Key -eq [ConsoleKey]::Q) { break }
        }
    }
    if ($server.HasExited -and $server.ExitCode -ne 0) { throw "The local server stopped (exit $($server.ExitCode))." }
} catch {
    Write-Host "`nCould not open Stockroom: $($_.Exception.Message)" -ForegroundColor Red
    $result = 1
} finally {
    if ($guard) { $guard.Dispose() }
    if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
    if ($lock) { $lock.Dispose() }
}
exit $result
