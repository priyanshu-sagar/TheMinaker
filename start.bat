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

echo [*] Starting Docker Infrastructure (Terminal 1)...
start "TheMinaker [1] Docker" cmd /k "title TheMinaker [1] Docker && color 09 && cls && echo. && echo  +-------------------------------------+ && echo  ^|  RESTART:  docker compose up        ^| && echo  +-------------------------------------+ && echo. && docker compose up"

timeout /t 8 /nobreak >nul

echo [*] Starting Agent Supervisor (Terminal 2)...
start "TheMinaker [2] Agents" cmd /k "title TheMinaker [2] Agent Supervisor && color 0C && cls && echo. && echo  +--------------------------------------------------+ && echo  ^|  RESTART:  node AgentDirectory/supervisor.js     ^| && echo  +--------------------------------------------------+ && echo. && node AgentDirectory/supervisor.js"

echo [*] Starting Backend API (Terminal 3)...
start "TheMinaker [3] API" cmd /k "title TheMinaker [3] API && color 0A && cd /d %~dp0apps\api && cls && echo. && echo  +-------------------------+ && echo  ^|  RESTART:  pnpm dev     ^| && echo  +-------------------------+ && echo. && echo  API:     http://localhost:3000/api/v1 && echo  Swagger: http://localhost:3000/api/docs && echo. && pnpm dev"

echo [*] Starting Web Dashboard (Terminal 4)...
start "TheMinaker [4] Web" cmd /k "title TheMinaker [4] Web Dashboard && color 0D && cd /d %~dp0apps\web && cls && echo. && echo  +-------------------------+ && echo  ^|  RESTART:  pnpm dev     ^| && echo  +-------------------------+ && echo. && echo  Web: http://localhost:3001 && echo. && pnpm dev"

echo [*] Starting Mobile App (Terminal 5)...
start "TheMinaker [5] Mobile" cmd /k "title TheMinaker [5] Mobile App && color 0E && cd /d %~dp0apps\mobile && cls && echo. && echo  +----------------------------------+ && echo  ^|  RESTART:  npx expo start -c     ^| && echo  +----------------------------------+ && echo. && echo  Scan the QR with Expo Go (iOS / Android) && echo. && npx expo start -c"

echo.
echo ===================================================
echo    All 5 services launched!
echo    1. Docker   (DB, Redis, MQTT)
echo    2. Agents   (Supervisor)
echo    3. API      -> http://localhost:3000/api/docs
echo    4. Web      -> http://localhost:3001
echo    5. Mobile   -> Scan QR with Expo Go
echo ===================================================
echo.
pause
