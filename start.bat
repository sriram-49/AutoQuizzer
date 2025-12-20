@echo off
echo Starting AutoQuizzer...
echo.
echo Starting Backend Server (Port 5000)...
start "AutoQuizzer Backend" cmd /k "cd /d "%~dp0" && npm run dev:server"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Dev Server (Port 3000)...
start "AutoQuizzer Frontend" cmd /k "cd /d "%~dp0" && npm run dev"
echo.
echo ===================================
echo AutoQuizzer is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ===================================
echo.
echo Press any key to exit this window...
pause > nul
