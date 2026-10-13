@echo off
title TheMinaker [5] Mobile App (Expo)
color 0E
cls
echo =============================================
echo        MINAKER MOBILE APP  (Expo SDK 57)
echo =============================================
echo.
echo  TO RESTART THIS TERMINAL:
echo  Double-click  start-5-mobile.bat
echo  OR run in cmd: start-5-mobile.bat
echo.
echo =============================================
echo.
echo  Scan the QR code below with Expo Go app
echo.
echo  iOS:     App Store -^> Expo Go
echo  Android: Play Store -^> Expo Go
echo.
echo  Roles in app:
echo    Parent      -^> Live bus tracking + attendance
echo    Gatekeeper  -^> School gate attendance marking
echo    Conductor   -^> GPS telemetry + student manifest
echo    Teacher     -^> Classroom attendance
echo    SchoolAdmin -^> Dashboard + reports
echo.
echo =============================================
echo.
pnpm.cmd --filter @minaker/mobile start -c
