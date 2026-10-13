@echo off
title TheMinaker [3] API (Backend)
color 0A
cls
echo =============================================
echo        MINAKER API  (NestJS + Fastify)
echo =============================================
echo.
echo  TO RESTART THIS TERMINAL:
echo  Double-click  start-3-api.bat
echo  OR run in cmd: start-3-api.bat
echo.
echo =============================================
echo.
echo  REST API: http://localhost:3000/api/v1
echo  Swagger:  http://localhost:3000/api/docs
echo  Health:   http://localhost:3000/api/v1/health
echo.
echo  Socket.io gateway on port 3000 (parent live tracking)
echo  MQTT subscriber on 1883 (conductor telemetry)
echo.
echo =============================================
echo.
pnpm.cmd --filter @minaker/api dev
