@echo off
echo =======================================================
echo   Deploying HydroSentinel AI Platform
echo   Powered by Team Quantum Minds
echo =======================================================
echo.
echo [1/3] Verifying Python Test Suite...
pytest tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Test suite failed! Deployment aborted.
    pause
    exit /b 1
)

echo.
echo [2/3] Launching Production WSGI Server on port 5000...
start "" http://localhost:5000
python app.py
