# Run after setup in an isolated copy; this script does not change inventory.
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$helper = Join-Path $project 'scripts/common.ps1'
. $helper
Initialize-Project
$php = Find-Php
foreach ($path in @('.env', 'vendor/autoload.php', 'public/build/manifest.json')) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing installed file: $path" }
}
if (-not (Read-EnvValue 'APP_KEY')) { throw 'Setup did not generate an application key.' }
$database = Get-SqlitePath
if ($database -and -not (Test-Path -LiteralPath $database)) { throw 'Database file is missing.' }
Invoke-Checked $php @('artisan', 'migrate:status')
Write-Host 'PASS: local installation files and migrations are available.'
