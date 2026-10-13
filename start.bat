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
start "TheMinaker [1] Docker" cmd /k "title TheMinaker [1] Docker && color 09 && cls && echo ============================================= && echo         MINAKER INFRASTRUCTURE               && echo ============================================= && echo. && echo  Restart command (open cmd in project folder): && echo     docker compose up && echo. && echo  Ports: && echo    PostgreSQL   ^| 5433 ^(direct^) / 6432 ^(pgbouncer^) && echo    Redis        ^| 6379 && echo    MQTT TCP     ^| 1883 && echo    MQTT WS      ^| 9001 && echo    LocalStack   ^| 4566 ^(S3^) && echo    Adminer UI   ^| http://localhost:8080 && echo. && echo  Adminer: Server=postgres  User=minaker  Pass=minaker_secret  DB=minaker_dev && echo. && echo ============================================= && echo. && docker compose up"

timeout /t 8 /nobreak >nul

echo [*] Starting Agent Supervisor (Terminal 2)...
start "TheMinaker [2] Agents" cmd /k "title TheMinaker [2] Agent Supervisor && color 0C && cls && echo ============================================= && echo          MINAKER AGENT SUPERVISOR            && echo ============================================= && echo. && echo  Restart command (open cmd in project folder): && echo     node AgentDirectory/supervisor.js && echo. && echo ============================================= && echo. && node AgentDirectory/supervisor.js"

echo [*] Starting Backend API (Terminal 3)...
start "TheMinaker [3] API" cmd /k "title TheMinaker [3] API ^(Backend^) && color 0A && cls && echo ============================================= && echo        MINAKER API  ^(NestJS + Fastify^)        && echo ============================================= && echo. && echo  Restart command (open cmd in project folder): && echo     pnpm --filter @minaker/api dev && echo. && echo  REST API: http://localhost:3000/api/v1 && echo  Swagger:  http://localhost:3000/api/docs && echo  Health:   http://localhost:3000/api/v1/health && echo. && echo ============================================= && echo. && pnpm.cmd --filter @minaker/api dev"

echo [*] Starting Web Dashboard (Terminal 4)...
start "TheMinaker [4] Web" cmd /k "title TheMinaker [4] Web Dashboard ^(Next.js^) && color 0D && cls && echo ============================================= && echo      MINAKER WEB DASHBOARD  ^(Next.js 14^)     && echo ============================================= && echo. && echo  Restart command (open cmd in project folder): && echo     pnpm --filter @minaker/web dev --port 3001 && echo. && echo  Super Admin:  http://localhost:3001/super-admin && echo  School Admin: http://localhost:3001/school-admin && echo  Login:        http://localhost:3001/login && echo. && echo ============================================= && echo. && pnpm.cmd --filter @minaker/web dev --port 3001"

echo [*] Starting Mobile App (Terminal 5)...
start "TheMinaker [5] Mobile" cmd /k "title TheMinaker [5] Mobile App ^(Expo^) && color 0E && cls && echo ============================================= && echo        MINAKER MOBILE APP  ^(Expo SDK 57^)     && echo ============================================= && echo. && echo  Restart command (open cmd in project folder): && echo     pnpm --filter @minaker/mobile start -c && echo. && echo  Scan the QR code with Expo Go app && echo  iOS: App Store -^> Expo Go && echo  Android: Play Store -^> Expo Go && echo. && echo ============================================= && echo. && pnpm.cmd --filter @minaker/mobile start -c"

echo.
echo ===================================================
echo    All 5 services launched in separate windows!
echo.
echo    Startup order ^(wait ~15s for Docker first^):
echo    1. Docker   ^(DB, Redis, MQTT, etc.^)
echo    2. Agents   ^(Supervisor^)
echo    3. API      -^> http://localhost:3000/api/docs
echo    4. Web      -^> http://localhost:3001
echo    5. Mobile   -^> Scan QR with Expo Go
echo ===================================================
echo.
pause
