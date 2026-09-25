@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (node server.cjs) else ("C:\Users\MateusBruchdeAraujo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs)
pause
