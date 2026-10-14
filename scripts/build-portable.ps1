param(
    [ValidatePattern('^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-zA-Z0-9.-]+)?$')][string]$Version = '1.0.0',
    [string]$PhpArchive
)

try {
    . (Join-Path $PSScriptRoot 'common.ps1')
    Initialize-Project
    $php = Find-Php
    $composer = Find-Command 'composer.cmd' 'Install Composer 2 to build a release.'
    $npm = Find-Command 'npm.cmd' 'Install Node.js to build a release.'
    $node = Find-Command 'node.exe' 'Install Node.js to build a release.'
    $releaseName = "Stockroom-$Version-windows-x64"
    $dist = Join-Path $ProjectRoot 'dist'
    $stage = Join-Path $dist $releaseName
    $archive = Join-Path $dist "$releaseName.zip"
    if ((Test-Path -LiteralPath $stage) -or (Test-Path -LiteralPath $archive)) {
        throw "Release $Version already exists in dist/. Use a new version or move the old output before rebuilding."
    }
    $bundle = Join-Path $stage 'Stockroom'
    $app = Join-Path $bundle 'app'
    $runtime = Join-Path $bundle 'runtime/php'
    foreach ($directory in @($app, $runtime, "$bundle/licenses", "$runtime/conf.d")) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $manifest = Get-Content -LiteralPath 'packaging/php-runtime.json' -Raw | ConvertFrom-Json
    if (-not $PhpArchive) {
        $cache = Join-Path $dist 'downloads'
        New-Item -ItemType Directory -Path $cache -Force | Out-Null
        $PhpArchive = Join-Path $cache $manifest.filename
        if (-not (Test-Path -LiteralPath $PhpArchive)) {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            try {
                Invoke-WebRequest "https://windows.php.net/downloads/releases/$($manifest.filename)" -OutFile $PhpArchive -UseBasicParsing
            } catch {
                Invoke-WebRequest "https://windows.php.net/downloads/releases/archives/$($manifest.filename)" -OutFile $PhpArchive -UseBasicParsing
            }
        }
    }
    $PhpArchive = (Resolve-Path -LiteralPath $PhpArchive).Path
    if ((Get-FileHash -LiteralPath $PhpArchive -Algorithm SHA256).Hash -ne $manifest.sha256) {
        throw 'PHP archive checksum mismatch. The release was not built.'
    }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [IO.Compression.ZipFile]::ExtractToDirectory($PhpArchive, $runtime)
    Copy-Item -LiteralPath 'packaging/php.ini' -Destination "$runtime/php.ini"
    Copy-Item -LiteralPath 'packaging/php-runtime.json' -Destination "$bundle/licenses/php-runtime.json"

    Write-Host 'Building the interface from locked dependencies...' -ForegroundColor Cyan
    Invoke-Checked $npm @('ci', '--no-audit', '--no-fund')
    Invoke-Checked $npm @('run', 'build')
    foreach ($directory in @('app', 'config', 'routes', 'resources', 'database/migrations', 'database/seeders', 'database/factories')) {
        $target = Join-Path $app $directory
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $directory) -Destination $target -Recurse
    }
    foreach ($directory in @('bootstrap/cache', 'public', 'scripts', 'storage/app/private', 'storage/app/public', 'storage/framework/cache/data', 'storage/framework/cache/locks', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs')) {
        New-Item -ItemType Directory -Path (Join-Path $app $directory) -Force | Out-Null
    }
    foreach ($file in @('artisan', '.env.example', 'composer.json', 'composer.lock', 'bootstrap/app.php', 'bootstrap/providers.php', 'scripts/portable.ps1', 'scripts/portable-common.ps1', 'scripts/portable-router.php')) {
        Copy-Item -LiteralPath (Join-Path $ProjectRoot $file) -Destination (Join-Path $app $file)
    }
    Get-ChildItem -LiteralPath 'public' -File | Where-Object { $_.Name -notin @('hot', 'fonts-manifest.dev.json') } | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination "$app/public"
    }
    Copy-Item -LiteralPath 'public/build' -Destination "$app/public/build" -Recurse
    Copy-Item -LiteralPath 'packaging/Open Stockroom.cmd' -Destination "$bundle/Open Stockroom.cmd"
    Copy-Item -LiteralPath 'packaging/README.txt' -Destination "$bundle/README.txt"

    Write-Host 'Installing production PHP dependencies in the release folder...'
    Invoke-Checked $composer @('--working-dir', $app, 'install', '--no-dev', '--no-scripts', '--no-interaction', '--prefer-dist', '--optimize-autoloader')
    $composerLicenses = & $composer --working-dir $app licenses --format=json --no-dev
    if ($LASTEXITCODE -ne 0) { throw 'Could not produce the Composer license inventory.' }
    [IO.File]::WriteAllText("$bundle/licenses/composer.json", ($composerLicenses -join "`n"), [Text.UTF8Encoding]::new($false))

    Invoke-Checked $node @('scripts/collect-licenses.mjs', "$bundle/licenses")
    $metadata = @{ version = $Version; php = $manifest.version; owner = 'Basty Mirafelix'; github = 'mrflxbast1'; builtAt = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json
    [IO.File]::WriteAllText("$bundle/release.json", $metadata, [Text.UTF8Encoding]::new($false))

    foreach ($privateFile in @('.env', 'database/database.sqlite', 'public/hot', 'bootstrap/cache/config.php')) {
        if (Test-Path -LiteralPath (Join-Path $app $privateFile)) { throw "Private or machine-specific file found in release: $privateFile" }
    }
    [IO.Compression.ZipFile]::CreateFromDirectory($stage, $archive, [IO.Compression.CompressionLevel]::Optimal, $false)
    $checksum = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    [IO.File]::WriteAllText("$archive.sha256", "$checksum  $releaseName.zip`n", [Text.UTF8Encoding]::new($false))
    Write-Host "Ready: $archive" -ForegroundColor Green
    Write-Host 'Run tests/portable-smoke.ps1 against this ZIP before publishing.'
    exit 0
} catch {
    Write-Host "Release build stopped: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
