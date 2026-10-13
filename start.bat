@echo off
title TheMinaker Ecosystem Launcher
color 0B
cls

echo ===================================================
echo             THE MINAKER ECOSYSTEM                     
echo ===================================================
echo.
echo [*] Cleaning stale Next.js cache...
if exist apps\web\.next rmdir /s /q apps\web\.next
echo.
echo  TO RESTART ANY TERMINAL INDIVIDUALLY:
echo.
echo    start-1-docker.bat    ^<-- Docker (DB, Redis, MQTT)
echo    start-2-agents.bat    ^<-- Agent Supervisor
echo    start-3-api.bat       ^<-- Backend API
echo    start-4-web.bat       ^<-- Web Dashboard
echo    start-5-mobile.bat    ^<-- Mobile App (Expo)
echo.
echo  Just double-click the file OR open a cmd in this
echo  folder and type the filename.
echo.
echo ===================================================
echo.

echo [*] Starting Docker Infrastructure (Terminal 1)...
start "TheMinaker [1] Docker" cmd /k "cd /d %~dp0 && start-1-docker.bat"

timeout /t 8 /nobreak >nul

echo [*] Starting Agent Supervisor (Terminal 2)...
start "TheMinaker [2] Agents" cmd /k "cd /d %~dp0 && start-2-agents.bat"

echo [*] Starting Backend API (Terminal 3)...
start "TheMinaker [3] API" cmd /k "cd /d %~dp0 && start-3-api.bat"

echo [*] Starting Web Dashboard (Terminal 4)...
start "TheMinaker [4] Web" cmd /k "cd /d %~dp0 && start-4-web.bat"

echo [*] Starting Mobile App (Terminal 5)...
start "TheMinaker [5] Mobile" cmd /k "cd /d %~dp0 && start-5-mobile.bat"

echo.
echo ===================================================
echo    All 5 services launched in separate windows!
echo.
echo    Startup order (wait ~15s for Docker first):
echo    1. Docker   (DB, Redis, MQTT, etc.)
echo    2. Agents   (Supervisor)
echo    3. API      -> http://localhost:3000/api/docs
echo    4. Web      -> http://localhost:3001
echo    5. Mobile   -> Scan QR with Expo Go
echo.
echo    TO RESTART ANY WINDOW: run its .bat file above
echo ===================================================
echo.
pause
