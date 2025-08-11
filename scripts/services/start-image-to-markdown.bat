@echo off
echo ========================================
echo Starting Image to Markdown Service
echo ========================================
echo Virtual Environment: docling
echo Port: 8004
echo ========================================

cd /d "%~dp0..\..\..\image-to-markdown"

call conda activate docling

if errorlevel 1 (
    echo Error: Cannot activate docling virtual environment
    echo Please ensure anaconda is installed and docling environment is created
    pause
    exit /b 1
)

echo Virtual environment activated successfully, starting service...
set PYTHONIOENCODING=utf-8
python start.py

pause 