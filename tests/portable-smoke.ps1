param([Parameter(Mandatory = $true)][string]$Archive)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $project 'packaging/Open Stockroom.cmd'))) {
    throw 'FAIL: the portable launcher has not been implemented.'
}
if (-not (Test-Path -LiteralPath $Archive)) { throw "Release archive not found: $Archive" }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archivePath = (Resolve-Path -LiteralPath $Archive).Path
$testRoot = Join-Path $project ('dist/Portable Test ' + [char]0x00e9 + ' ' + [guid]::NewGuid().ToString('N'))
[System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $testRoot)
$bundle = Join-Path $testRoot 'Stockroom'
$app = Join-Path $bundle 'app'
$launcher = Join-Path $app 'scripts/portable.ps1'
$php = Join-Path $bundle 'runtime/php/php.exe'
$shell = Join-Path $PSHOME 'powershell.exe'
$originalPath = $env:PATH
$env:PATH = "$env:SystemRoot\System32;$PSHOME"
$server = $null
$busy = $null

function Assert($Condition, [string]$Message) {
    if (-not $Condition) { throw "FAIL: $Message" }
    Write-Host "PASS: $Message" -ForegroundColor Green
}

function Initialize-Copy {
    & $shell -NoLogo -NoProfile -ExecutionPolicy Bypass -File $launcher -InitializeOnly
    Assert ($LASTEXITCODE -eq 0) 'initialization succeeds with no development tools on PATH'
}

function Read-Fixture([string]$Action = 'inspect') {
    $runtime = Split-Path -Parent $php
    $json = & $php -c "$runtime/php.ini" -d "extension_dir=$runtime/ext" (Join-Path $PSScriptRoot 'portable-fixture.php') $app $Action
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the isolated fixture.' }
    return ($json | ConvertFrom-Json)
}

function Start-Copy([int]$Port) {
    return Start-Process -FilePath $shell -ArgumentList @('-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $launcher + '"'), '-NoBrowser', '-Port', $Port) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $testRoot 'launcher-output.log') -RedirectStandardError (Join-Path $testRoot 'launcher-error.log')
}

function Wait-ForCopy {
    $deadline = [DateTime]::UtcNow.AddSeconds(30)
    do {
        if ($server.HasExited) { throw "Launcher exited early. See $testRoot/launcher-error.log" }
        $statePath = Join-Path $app 'storage/portable.json'
        if (Test-Path -LiteralPath $statePath) {
            $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
            try {
                $health = Invoke-RestMethod "http://127.0.0.1:$($state.port)/__stockroom/health" -TimeoutSec 2
                if ($health.instance -eq $state.instance) { return $state }
            } catch { }
        }
        Start-Sleep -Milliseconds 200
    } while ([DateTime]::UtcNow -lt $deadline)
    throw 'Launcher did not become ready.'
}

try {
    Assert (-not (Test-Path -LiteralPath "$app/.env")) 'archive contains no private environment'
    Assert (-not (Test-Path -LiteralPath "$app/database/database.sqlite")) 'archive contains no user database'
    Assert (-not (Test-Path -LiteralPath "$app/node_modules")) 'Node dependencies are not needed in the release'
    Initialize-Copy
    $fresh = Read-Fixture
    Assert ($fresh.users -eq 3 -and $fresh.products -eq 24 -and $fresh.categories -eq 6) 'first launch creates the expected demo data'
    Assert $fresh.adminLogin 'the documented Admin password works'
    $keyHash = (Get-FileHash -LiteralPath "$app/.env").Hash
    $null = Read-Fixture 'mutate'
    Initialize-Copy
    $saved = Read-Fixture
    Assert ($saved.quantity -eq 317 -and $saved.changedPassword -and $saved.users -eq 4) 'repeat launch preserves edited inventory, password, and new accounts'
    Assert ((Get-FileHash -LiteralPath "$app/.env").Hash -eq $keyHash) 'repeat launch preserves the application key and configuration'

    $busy = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $busy.Start()
    $busyPort = $busy.LocalEndpoint.Port
    $server = Start-Copy $busyPort
    $state = Wait-ForCopy
    Assert ($state.port -ne $busyPort) 'a busy port is skipped without stopping its owner'
    $page = Invoke-WebRequest "http://127.0.0.1:$($state.port)/login" -UseBasicParsing -TimeoutSec 10
    Assert ($page.StatusCode -eq 200 -and $page.Content.Contains('data-page=')) 'the real login page is served'
    & $shell -NoProfile -ExecutionPolicy Bypass -File $launcher -NoBrowser -Port $busyPort
    Assert ($LASTEXITCODE -eq 0) 'a second launch reuses the running instance'
    $again = Get-Content -LiteralPath "$app/storage/portable.json" -Raw | ConvertFrom-Json
    Assert ($again.pid -eq $state.pid) 'a second launch does not create another server'
    Stop-Process -Id $server.Id -Force
    $server.WaitForExit()
    Start-Sleep -Milliseconds 500
    Assert (-not (Get-Process -Id $state.pid -ErrorAction SilentlyContinue)) 'closing the launcher stops its server'
    $server = $null
    $busy.Stop()
    $busy = $null

    $moved = Join-Path $testRoot 'Moved Stockroom'
    foreach ($target in @($bundle, $moved)) {
        if (-not ([IO.Path]::GetFullPath($target).StartsWith([IO.Path]::GetFullPath($testRoot) + [IO.Path]::DirectorySeparatorChar))) { throw 'Unsafe test move.' }
    }
    Move-Item -LiteralPath $bundle -Destination $moved
    $bundle = $moved
    $app = Join-Path $bundle 'app'
    $launcher = Join-Path $app 'scripts/portable.ps1'
    $php = Join-Path $bundle 'runtime/php/php.exe'
    Initialize-Copy
    $movedData = Read-Fixture
    Assert ($movedData.quantity -eq 317 -and $movedData.changedPassword) 'moving the folder preserves working data and runtime paths'
    Rename-Item -LiteralPath $php -NewName 'php-disabled.exe'
    try {
        & $shell -NoProfile -ExecutionPolicy Bypass -File $launcher -InitializeOnly
        Assert ($LASTEXITCODE -ne 0) 'a missing bundled runtime fails clearly'
    } finally {
        Rename-Item -LiteralPath (Join-Path (Split-Path $php -Parent) 'php-disabled.exe') -NewName 'php.exe'
    }
    Write-Host "Portable integration checks passed. Test copy: $bundle"
} finally {
    if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id -Force }
    if ($busy) { $busy.Stop() }
    $env:PATH = $originalPath
}
