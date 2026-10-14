param([string]$Output = 'dist/FinalTermLaravel-source.zip')

try {
    . (Join-Path $PSScriptRoot 'common.ps1')
    Initialize-Project
    $git = Find-Command 'git.exe' 'Install Git to export the source archive.'
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $destination = [IO.Path]::GetFullPath((Join-Path $ProjectRoot $Output))
    if (Test-Path -LiteralPath $destination) { throw "Output already exists: $destination" }
    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    $files = & $git -c core.quotepath=false ls-files --cached --others --exclude-standard
    if ($LASTEXITCODE -ne 0) { throw 'Could not list project source files.' }
    $archive = [IO.Compression.ZipFile]::Open($destination, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in ($files | Sort-Object -Unique)) {
            # Planning records are local working notes, not application source.
            if ($file.StartsWith('docs/superpowers/')) { continue }
            $path = Join-Path $ProjectRoot $file
            if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $path, "FinalTermLaravel/$file", [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $archive.Dispose() }
    Write-Host "Ready: $destination" -ForegroundColor Green
} catch {
    Write-Host "Source export stopped: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
