@echo off
chcp 65001 >nul
title AndradeStudio AI - Servidor Desktop
cd /d "%~dp0"

echo ========================================================
echo   🚀 Iniciando Aplicativo Desktop AndradeStudio AI...
echo ========================================================

:: Verifica se a porta 3000 ja esta rodando
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo ✅ Servidor ja esta ativo em http://localhost:3000
) else (
    echo ⚡ Iniciando motor local Next.js + WhatsApp Baileys...
    start "AndradeStudio AI Server" /min node scripts/dev.mjs
    timeout /t 4 /nobreak >nul
)

:: Abre como Aplicativo Desktop Nativo (sem barra de enderecos) no Chrome ou Edge
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

exit
