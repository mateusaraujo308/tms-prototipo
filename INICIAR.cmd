@echo off
setlocal
cd /d "%~dp0"
set "ROTA_NODE=node"
where node >nul 2>nul
if %errorlevel%==0 goto iniciar
set "ROTA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%ROTA_NODE%" goto iniciar
echo Node.js nao encontrado. Voce tambem pode abrir index.html diretamente.
echo Para o servidor local, instale o Node.js e execute este arquivo novamente.
pause
exit /b 1
:iniciar
echo Rota TMS - http://127.0.0.1:4173
echo Mantenha esta janela aberta enquanto usa o prototipo.
"%ROTA_NODE%" server.cjs --open
pause
