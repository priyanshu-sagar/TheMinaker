@echo off
if /I not "%~1"=="stay" (
  cmd /k "%~f0" stay
  exit /b
)
setlocal
set CI=
cd /d "%~dp0apps\mobile"
echo.
echo TheMinaker - phones outside this Wi-Fi
echo Keep this window open. Closing it, or letting the laptop sleep, stops the link.
echo Scan the QR code below with Expo Go.
echo.
call pnpm.cmd exec expo start --tunnel
echo.
echo Expo stopped. Error level %ERRORLEVEL%.
echo Read any red text above. This window will stay open.
pause
