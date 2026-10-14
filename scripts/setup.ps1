try {
    . (Join-Path $PSScriptRoot 'common.ps1')
    Initialize-Project

    Write-Host 'Stockroom - checking your computer...' -ForegroundColor Cyan
    $php = Find-Php
    $composer = Find-Command 'composer.cmd' 'Install Composer from https://getcomposer.org/download/.'
    $node = Find-Command 'node.exe' 'Install Node.js 24 LTS from https://nodejs.org/.'
    $npm = Find-Command 'npm.cmd' 'Reinstall Node.js with npm included.'
    $nodeVersion = & $node -p 'process.versions.node'
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the Node.js version.' }
    $version = [version]$nodeVersion
    if (-not (($version.Major -eq 20 -and $version -ge [version]'20.19') -or $version -ge [version]'22.12')) {
        throw 'The frontend needs Node.js 20.19+ or 22.12+. Install Node.js 24 LTS.'
    }

    if (-not (Test-Path -LiteralPath '.env')) {
        Copy-Item -LiteralPath '.env.example' -Destination '.env'
    }
    Write-Host 'Installing PHP dependencies from composer.lock...'
    Invoke-Checked $composer @('install', '--no-interaction', '--prefer-dist')
    Invoke-Checked $php @('artisan', 'config:clear')

    if (-not (Read-EnvValue 'APP_KEY')) {
        Invoke-Checked $php @('artisan', 'key:generate', '--force')
    }
    $database = Get-SqlitePath
    if ($database -and -not (Test-Path -LiteralPath $database)) {
        $parent = Split-Path -Parent $database
        if (-not (Test-Path -LiteralPath $parent)) { throw "The database folder does not exist: $parent" }
        New-Item -ItemType File -Path $database | Out-Null
    }

    Invoke-Checked $php @('artisan', 'migrate', '--force')
    Invoke-Checked $php @('artisan', 'db:seed', '--force')
    Write-Host 'Installing and building the interface...'
    Invoke-Checked $npm @('ci', '--no-audit', '--no-fund')
    Invoke-Checked $npm @('run', 'build')

    Write-Host ''
    Write-Host 'Ready! Run start.cmd, then open http://127.0.0.1:8000.' -ForegroundColor Green
    Write-Host 'Fresh installation: admin@stockroom.test / Stockroom123!'
    Write-Host 'Existing data, passwords and APP_KEY have been kept.'
    exit 0
} catch {
    Write-Host ''
    Write-Host "Setup stopped: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
