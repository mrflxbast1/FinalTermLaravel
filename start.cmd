@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1" %*
set "result=%errorlevel%"
if not "%STOCKROOM_NO_PAUSE%"=="1" pause
exit /b %result%
