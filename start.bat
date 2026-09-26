@echo off
title TheMinaker Ecosystem Launcher
color 0B
cls

echo ===================================================
echo             THE MINAKER ECOSYSTEM                     
echo ===================================================
echo.
echo [*] Cleaning stale caches...
if exist apps\web\.next rmdir /s /q apps\web\.next
echo.

echo [*] Starting Docker Infrastructure (Terminal 1)...
start "TheMinaker Docker Services" cmd /k "title TheMinaker Docker Services && color 09 && cls && echo ================================== && echo      MINAKER INFRASTRUCTURE      && echo ================================== && echo. && echo Database Credentials for Adminer: && echo   System:   PostgreSQL && echo   Server:   postgres && echo   Username: minaker && echo   Password: minaker_secret && echo   Database: minaker_dev && echo. && echo Postgres Port:  5432 (Direct) / 6432 (PgBouncer) && echo Redis Port:     6379 && echo MQTT Port:      1883 (TCP) / 9001 (WS) && echo Adminer UI:     http://localhost:8080 && echo. && echo ======================================== && echo TO RESTART THIS SERVICE MANUALLY: && echo (Run from project root directory) && echo docker compose up -d && echo ======================================== && echo. && docker compose up"

echo [*] Starting Agent Supervisor (Terminal 2)...
start "TheMinaker Agent Supervisor" cmd /k "title TheMinaker Agent Supervisor && color 0C && cls && echo ================================== && echo     MINAKER AGENT SUPERVISOR     && echo ================================== && echo. && echo Watching AgentDirectory for changes... && echo. && echo ======================================== && echo TO RESTART THIS SERVICE MANUALLY: && echo node AgentDirectory/supervisor.js && echo ======================================== && echo. && node AgentDirectory/supervisor.js"

echo [*] Starting Backend API (Terminal 3)...
start "TheMinaker API [Backend]" cmd /k "title TheMinaker API [Backend] && color 0A && cls && echo ================================== && echo     MINAKER API (BACKEND)        && echo ================================== && echo. && echo Local URL: http://localhost:3000/api/v1 && echo Swagger:   http://localhost:3000/api/docs && echo. && echo ======================================== && echo TO RESTART THIS SERVICE MANUALLY: && echo pnpm --filter @minaker/api dev && echo ======================================== && echo. && Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -ErrorAction SilentlyContinue & pnpm --filter @minaker/api dev"

echo [*] Starting Web Dashboard (Terminal 4)...
start "TheMinaker Web [Frontend]" cmd /k "title TheMinaker Web [Frontend] && color 0D && cls && echo ================================== && echo     MINAKER WEB (FRONTEND)       && echo ================================== && echo. && echo Local URL: http://localhost:3001 && echo. && echo ======================================== && echo TO RESTART THIS SERVICE MANUALLY: && echo pnpm --filter @minaker/web dev --port 3001 && echo ======================================== && echo. && Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -ErrorAction SilentlyContinue & pnpm --filter @minaker/web dev --port 3001"

echo [*] Starting Mobile App (Terminal 5)...
start "TheMinaker App [Mobile]" cmd /k "title TheMinaker App [Mobile] && color 0E && cls && echo ================================== && echo       MINAKER APP (MOBILE)       && echo ================================== && echo. && echo Local URL: Uses Expo Go (Scan QR Code) && echo. && echo ======================================== && echo TO RESTART THIS SERVICE MANUALLY: && echo pnpm --filter @minaker/mobile start -c && echo ======================================== && echo. && Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -ErrorAction SilentlyContinue & pnpm --filter @minaker/mobile start -c"

echo.
echo ===================================================
echo   All 5 components have been launched successfully! 
echo   Check the 5 new terminal windows.
echo ===================================================
echo.
pause
