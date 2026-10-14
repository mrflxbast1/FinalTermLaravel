param([ValidateRange(1024, 65535)][int]$Port = 8000)

try {
    . (Join-Path $PSScriptRoot 'common.ps1')
    Initialize-Project
    $php = Find-Php

    foreach ($path in @('.env', 'vendor/autoload.php', 'public/build/manifest.json')) {
        if (-not (Test-Path -LiteralPath $path)) { throw "Missing $path. Run setup.cmd first." }
    }
    if (-not (Read-EnvValue 'APP_KEY')) { throw 'APP_KEY is empty. Run setup.cmd first.' }
    $database = Get-SqlitePath
    if ($database -and -not (Test-Path -LiteralPath $database)) { throw 'The SQLite database is missing. Run setup.cmd first.' }
    if (Test-Path -LiteralPath 'public/hot') {
        throw 'Development mode is still enabled (public/hot exists). Stop npm run dev. If it crashed, delete public/hot, then run start.cmd again.'
    }

    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try { $listener.Start() } catch {
        throw "Port $Port is already in use. Open http://127.0.0.1:$Port if Stockroom is already running, or choose another port: start.cmd -Port 8001."
    } finally { $listener.Stop() }

    $env:APP_URL = "http://127.0.0.1:$Port"
    Write-Host "Stockroom is starting at $env:APP_URL" -ForegroundColor Green
    Write-Host 'Keep this window open. Press Ctrl+C to stop.'
    Invoke-Checked $php @('artisan', 'serve', '--host=127.0.0.1', "--port=$Port", '--tries=1')
    exit 0
} catch {
    Write-Host "Could not start Stockroom: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
