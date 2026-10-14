@echo off
setlocal
title Stockroom
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0app\scripts\portable.ps1" %*
set "result=%errorlevel%"
if not "%result%"=="0" if not "%STOCKROOM_NO_PAUSE%"=="1" pause
exit /b %result%
