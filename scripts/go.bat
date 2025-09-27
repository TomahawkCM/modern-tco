@echo off
setlocal
REM go.bat  policy-proof launcher for a Codex session
set "SCRIPT_DIR=%~dp0"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%go.ps1" %*
exit /b %ERRORLEVEL%
