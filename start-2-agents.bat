@echo off
title TheMinaker [2] Agent Supervisor
color 0C
cls
echo =============================================
echo          MINAKER AGENT SUPERVISOR
echo =============================================
echo.
echo  TO RESTART THIS TERMINAL:
echo  Double-click  start-2-agents.bat
echo  OR run in cmd: start-2-agents.bat
echo.
echo =============================================
echo.
echo Watching AgentDirectory/bus/wake for tickets...
echo.
echo Roles: orchestrator, backend-developer, database-manager,
echo        frontend-developer, cloud-engineer, quality-rater, ideas
echo.
echo =============================================
echo.
node AgentDirectory/supervisor.js
