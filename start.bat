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

echo [*] Starting Backend API (Terminal 2)...
start "TheMinaker [2] API" cmd /k "title TheMinaker [2] API && color 0A && cd /d %~dp0apps\api && cls && echo. && echo  +-------------------------+ && echo  ^|  RESTART:  pnpm dev     ^| && echo  +-------------------------+ && echo. && echo  API:     http://localhost:3000/api/v1 && echo  Swagger: http://localhost:3000/api/docs && echo. && pnpm dev"

echo [*] Starting Web Dashboard (Terminal 3)...
start "TheMinaker [3] Web" cmd /k "title TheMinaker [3] Web Dashboard && color 0D && cd /d %~dp0apps\web && cls && echo. && echo  +-------------------------+ && echo  ^|  RESTART:  pnpm dev     ^| && echo  +-------------------------+ && echo. && echo  Web: http://localhost:3001 && echo. && pnpm dev"

echo [*] Starting Mobile App (Terminal 4)...
start "TheMinaker [4] Mobile" cmd /k "title TheMinaker [4] Mobile App && color 0E && cd /d %~dp0apps\mobile && cls && echo. && echo  +----------------------------------+ && echo  ^|  RESTART:  npx expo start -c     ^| && echo  +----------------------------------+ && echo. && echo  Scan the QR with Expo Go (iOS / Android) && echo. && npx expo start -c"

echo.
echo ===================================================
echo    All 4 services launched!
echo    1. Docker   (DB, Redis, MQTT)
echo    2. API      -> http://localhost:3000/api/docs
echo    3. Web      -> http://localhost:3001
echo    4. Mobile   -> Scan QR with Expo Go
echo ===================================================
echo.
pause
