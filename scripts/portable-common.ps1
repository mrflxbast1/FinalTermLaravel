Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Utf8([string]$Path, [string]$Content) {
    [IO.File]::WriteAllText($Path, $Content, [Text.UTF8Encoding]::new($false))
}

function Invoke-PortablePhp([string[]]$Arguments) {
    & $script:Php @script:PhpOptions @Arguments
    if ($LASTEXITCODE -ne 0) { throw "PHP could not complete '$($Arguments -join ' ')'. See the message above." }
}

function Open-StockroomBrowser([string]$Url) {
    if ($script:NoBrowser) { return }
    try { Start-Process -FilePath $Url } catch {
        Write-Host "Open this address in your browser: $Url" -ForegroundColor Yellow
    }
}

function Get-RunningStockroom {
    if (-not (Test-Path -LiteralPath $script:StatePath)) { return $null }
    try {
        $state = Get-Content -LiteralPath $script:StatePath -Raw | ConvertFrom-Json
        $port = [int]$state.port
        if ($port -lt 1024 -or $port -gt 65535) { return $null }
        $health = Invoke-RestMethod "http://127.0.0.1:$port/__stockroom/health" -TimeoutSec 1
        if ($state.instance -and $health.instance -eq $state.instance) { return $state }
    } catch { }
    return $null
}

function Find-PortablePort([int]$Preferred) {
    for ($candidate = $Preferred; $candidate -le [Math]::Min($Preferred + 99, 65535); $candidate++) {
        $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $candidate)
        try { $listener.Start(); return $candidate } catch { } finally { $listener.Stop() }
    }
    throw 'No free local port was found. Close an older Stockroom window and try again.'
}

function Initialize-PortableData {
    $database = Join-Path $script:AppRoot 'database/database.sqlite'
    $hasData = (Test-Path -LiteralPath $database) -and (Get-Item -LiteralPath $database).Length -gt 0
    if (-not (Test-Path -LiteralPath '.env')) {
        if ($hasData) { throw 'The database exists but .env is missing. Restore .env from your backup so the application key is preserved.' }
        $configuration = Get-Content -LiteralPath '.env.example' -Raw
        $configuration = $configuration -replace '(?m)^APP_DEBUG=.*$', 'APP_DEBUG=false'
        $configuration += "`nSESSION_COOKIE=stockroom_$([guid]::NewGuid().ToString('N'))`n"
        Write-Utf8 (Join-Path $script:AppRoot '.env') $configuration
    }
    $key = Get-Content -LiteralPath '.env' | Where-Object { $_ -match '^APP_KEY=.+$' }
    if (-not $key) {
        if ($hasData) { throw 'APP_KEY is missing for an existing database. Restore the original .env from your backup.' }
        Invoke-PortablePhp -Arguments @('artisan', 'key:generate', '--force', '--no-interaction')
    }
    if (-not (Test-Path -LiteralPath $database)) { [IO.File]::WriteAllBytes($database, [byte[]]@()) }
    Invoke-PortablePhp -Arguments @('artisan', 'config:clear', '--no-interaction')
    Invoke-PortablePhp -Arguments @('artisan', 'package:discover', '--no-interaction')
    Invoke-PortablePhp -Arguments @('artisan', 'migrate', '--force', '--no-interaction')
    Invoke-PortablePhp -Arguments @('artisan', 'db:seed', '--force', '--no-interaction')
}

function Test-PortablePhp {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = $script:Php
    $info.Arguments = '-n -v'
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $probe = [Diagnostics.Process]::Start($info)
    $null = $probe.StandardOutput.ReadToEnd()
    $errorText = $probe.StandardError.ReadToEnd()
    $probe.WaitForExit()
    $exitCode = $probe.ExitCode
    $probe.Dispose()
    if ($exitCode -eq 0) { return }
    if ($exitCode -ne -1073741515) { throw "The bundled PHP runtime could not start (exit $exitCode). $errorText" }
    if ($script:NoBrowser -or $script:InitializeOnly) {
        throw 'Install Microsoft Visual C++ v14 x64: https://aka.ms/vc14/vc_redist.x64.exe, then run Stockroom again.'
    }
    Write-Host 'Windows needs the Microsoft Visual C++ runtime before PHP can run.' -ForegroundColor Yellow
    $answer = Read-Host 'Download and open the official Microsoft installer now? [Y/N]'
    if ($answer -notmatch '^(y|yes)$') { throw 'Install the Microsoft Visual C++ v14 x64 runtime, then open Stockroom again.' }
    $installer = Join-Path ([IO.Path]::GetTempPath()) ('stockroom-vc-' + [guid]::NewGuid().ToString('N') + '.exe')
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest 'https://aka.ms/vc14/vc_redist.x64.exe' -OutFile $installer -UseBasicParsing
    $signature = Get-AuthenticodeSignature -LiteralPath $installer
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'O=Microsoft Corporation') {
        throw 'The runtime installer did not have a valid Microsoft signature. Nothing was installed.'
    }
    # The installer is interactive so the user can review Microsoft's license and Windows prompt.
    $setup = Start-Process -FilePath $installer -ArgumentList '/install', '/norestart' -PassThru -Wait
    if ($setup.ExitCode -notin @(0, 1638, 3010)) { throw "Microsoft runtime setup did not complete (exit $($setup.ExitCode))." }
    if ($setup.ExitCode -eq 3010) { throw 'Microsoft runtime setup requires a Windows restart. Restart the PC, then open Stockroom again.' }
    $script:NoBrowser = $true
    try { Test-PortablePhp } finally { $script:NoBrowser = $false }
}

function Register-PortableProcessGuard {
    # A Windows job owns the server. Closing the terminal also closes this handle,
    # so Windows stops the server even when PowerShell cannot run its finally block.
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public sealed class StockroomProcessGuard : IDisposable {
    [StructLayout(LayoutKind.Sequential)] struct BasicLimit {
        public long ProcessTime, JobTime; public uint Flags;
        public UIntPtr MinWorkingSet, MaxWorkingSet; public uint ActiveProcesses;
        public UIntPtr Affinity; public uint Priority, Scheduling;
    }
    [StructLayout(LayoutKind.Sequential)] struct IoCounters { public ulong A, B, C, D, E, F; }
    [StructLayout(LayoutKind.Sequential)] struct ExtendedLimit {
        public BasicLimit Basic; public IoCounters Io;
        public UIntPtr ProcessMemory, JobMemory, PeakProcessMemory, PeakJobMemory;
    }
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job, int kind, ref ExtendedLimit info, uint size);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
    [DllImport("kernel32.dll")] public static extern uint SetErrorMode(uint mode);
    IntPtr job;
    public StockroomProcessGuard() {
        job = CreateJobObject(IntPtr.Zero, null);
        if (job == IntPtr.Zero) throw new Win32Exception();
        var limit = new ExtendedLimit(); limit.Basic.Flags = 0x2000;
        if (!SetInformationJobObject(job, 9, ref limit, (uint)Marshal.SizeOf(limit))) { Dispose(); throw new Win32Exception(); }
    }
    public void Add(IntPtr process) { if (!AssignProcessToJobObject(job, process)) throw new Win32Exception(); }
    public void Dispose() { if (job != IntPtr.Zero) { CloseHandle(job); job = IntPtr.Zero; } }
}
'@
}
