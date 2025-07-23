@echo off
echo ========================================
echo Starting PDF Translation Service
echo ========================================
echo Virtual Environment: test
echo Port: 8005
echo ========================================

cd /d "%~dp0..\..\services\pdf_translator"

call conda activate test

if errorlevel 1 (
    echo Error: Cannot activate test virtual environment
    echo Please ensure anaconda is installed and test environment is created
    pause
    exit /b 1
)

echo Virtual environment activated successfully, starting service...
set PYTHONIOENCODING=utf-8
python start.py

pause 