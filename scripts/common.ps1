Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Initialize-Project {
    Set-Location -LiteralPath $ProjectRoot
    # Portable tools are optional; ordinary installations use the system PATH.
    $localTools = Join-Path $ProjectRoot '.tools'
    if (Test-Path -LiteralPath (Join-Path $localTools 'php/php.exe')) {
        $env:PATH = "$(Join-Path $localTools 'php');$localTools;$env:PATH"
    }
}

function Find-Command([string]$Name, [string]$HelpText) {
    $command = Get-Command $Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $command) { throw "$Name was not found. $HelpText Then reopen your terminal." }
    return $command.Source
}

function Invoke-Checked {
    param([string]$Executable, [string[]]$Arguments)
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$(Split-Path -Leaf $Executable) $($Arguments -join ' ') failed (exit $LASTEXITCODE). Fix the error above and run the script again."
    }
}

function Find-Php {
    $php = Find-Command 'php.exe' 'Install PHP 8.3 or newer and add its folder to PATH (see README.md).'
    $version = & $php -r 'echo PHP_VERSION;'
    if ($LASTEXITCODE -ne 0 -or [version]($version -replace '-.*$', '') -lt [version]'8.3') {
        throw 'PHP 8.3 or newer is required. Check php --version and your PATH.'
    }
    $missing = & $php (Join-Path $PSScriptRoot 'check-extensions.php')
    if ($LASTEXITCODE -ne 0) { throw 'Could not check PHP extensions.' }
    if ($missing) { throw "Enable these PHP extensions in php.ini: $missing. Run php --ini to find the loaded configuration." }
    return $php
}

function Read-EnvValue([string]$Name, [string]$Fallback = '') {
    $line = Get-Content -LiteralPath '.env' | Where-Object { $_ -match "^\s*$Name\s*=" } | Select-Object -Last 1
    if (-not $line) { return $Fallback }
    return ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
}

function Get-SqlitePath {
    if ((Read-EnvValue 'DB_CONNECTION' 'sqlite') -ne 'sqlite') { return $null }
    $database = Read-EnvValue 'DB_DATABASE'
    if (-not $database) { return Join-Path $ProjectRoot 'database/database.sqlite' }
    if ($database -eq ':memory:') { throw 'Use a SQLite file for the app. An in-memory database cannot keep your work.' }
    if ([System.IO.Path]::IsPathRooted($database)) { return $database }
    return Join-Path $ProjectRoot $database
}
