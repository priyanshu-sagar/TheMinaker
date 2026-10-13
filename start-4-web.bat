@echo off
title TheMinaker [4] Web Dashboard (Next.js)
color 0D
cls
echo =============================================
echo      MINAKER WEB DASHBOARD  (Next.js 14)
echo =============================================
echo.
echo  TO RESTART THIS TERMINAL:
echo  Double-click  start-4-web.bat
echo  OR run in cmd: start-4-web.bat
echo.
echo =============================================
echo.
echo  Super Admin:  http://localhost:3001/super-admin
echo  School Admin: http://localhost:3001/school-admin
echo  Login:        http://localhost:3001/login
echo.
echo =============================================
echo.
pnpm.cmd --filter @minaker/web dev --port 3001
