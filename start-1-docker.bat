@echo off
title TheMinaker [1] Docker
color 09
cls
echo =============================================
echo         MINAKER INFRASTRUCTURE
echo =============================================
echo.
echo  TO RESTART THIS TERMINAL:
echo  Double-click  start-1-docker.bat
echo  OR run in cmd: start-1-docker.bat
echo.
echo =============================================
echo.
echo Services: TimescaleDB, PgBouncer, Redis, MQTT, LocalStack, Adminer
echo.
echo  DB Credentials for Adminer:
echo    System:   PostgreSQL
echo    Server:   postgres
echo    Username: minaker
echo    Password: minaker_secret
echo    Database: minaker_dev
echo.
echo  Ports:
echo    PostgreSQL   ^| 5433 (direct) / 6432 (pgbouncer)
echo    Redis        ^| 6379
echo    MQTT TCP     ^| 1883
echo    MQTT WS      ^| 9001
echo    LocalStack   ^| 4566 (S3)
echo    Adminer UI   ^| http://localhost:8080
echo.
echo =============================================
echo.
docker compose up
