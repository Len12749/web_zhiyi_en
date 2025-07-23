@echo off
echo ========================================
echo Starting PDF to Markdown Service
echo ========================================
echo Virtual Environment: docling
echo Port: 8002
echo ========================================

cd /d "%~dp0..\..\services\pdf_to_markdown"

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