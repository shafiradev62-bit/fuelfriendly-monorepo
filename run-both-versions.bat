@echo off
echo ========================================
echo Starting BOTH VERSIONS
echo ========================================
echo User Version (Strict): http://localhost:3000
echo FuelFriendly Version (Global): http://localhost:3001
echo ========================================
echo.
echo Press Ctrl+C to stop both servers
echo.

start "User Version - Port 3000" cmd /k "cd /d %~dp0 && run-user-version.bat"
start "FuelFriendly Version - Port 3001" cmd /k "cd /d %~dp0 && run-fuelfriendly-version.bat"

echo.
echo Both versions are starting in separate windows...
echo.
pause
