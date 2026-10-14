@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup.ps1" %*
set "result=%errorlevel%"
if not "%STOCKROOM_NO_PAUSE%"=="1" pause
exit /b %result%
