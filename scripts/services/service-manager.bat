@echo off
title ZhiYi Platform Service Manager
chcp 65001 > nul
cls

:MENU
echo ========================================
echo     ZhiYi Platform - Service Manager
echo ========================================
echo.
echo Please select service to start:
echo.
echo [1] PDF to Markdown (Port 8002, docling env)
echo [2] Image to Markdown (Port 8004, docling env)  
echo [3] Markdown Translation (Port 8003, docling env)
echo [4] PDF Translation (Port 8005, test env)
echo [5] Format Conversion (Port 8001, docling env)
echo.
echo [A] Start All Services (Multi-terminal)
echo [S] Check Service Status
echo [Q] Exit
echo.
echo ========================================

set /p choice="Please enter your choice (1-5/A/S/Q): "

if /i "%choice%"=="1" goto START_PDF_MD
if /i "%choice%"=="2" goto START_IMG_MD  
if /i "%choice%"=="3" goto START_MD_TRANS
if /i "%choice%"=="4" goto START_PDF_TRANS
if /i "%choice%"=="5" goto START_FORMAT_CONV
if /i "%choice%"=="A" goto START_ALL
if /i "%choice%"=="S" goto CHECK_STATUS
if /i "%choice%"=="Q" goto EXIT

echo Invalid choice, please try again...
timeout /t 2 > nul
goto MENU

:START_PDF_MD
echo Starting PDF to Markdown Service...
start "PDF to Markdown" "%~dp0start-pdf-to-markdown.bat"
goto MENU

:START_IMG_MD
echo Starting Handwritten Image Recognition Service...
start "Handwritten Image Recognition" "%~dp0start-image-to-markdown.bat"
goto MENU

:START_MD_TRANS
echo Starting Markdown Translation Service...
start "Markdown Translation" "%~dp0start-markdown-translation.bat"
goto MENU

:START_PDF_TRANS
echo Starting PDF Layout-Preserving Translation Service...
start "PDF Layout-Preserving Translation" "%~dp0start-pdf-translation.bat"
goto MENU

:START_FORMAT_CONV
echo Starting Format Conversion Service...
start "Format Conversion" "%~dp0start-format-conversion.bat"
goto MENU

:START_ALL
echo Starting all services...
echo This will open 5 terminal windows, one for each service
echo.
timeout /t 3
start "PDF to Markdown" "%~dp0start-pdf-to-markdown.bat"
timeout /t 1
start "Handwritten Image Recognition" "%~dp0start-image-to-markdown.bat"  
timeout /t 1
start "Markdown Translation" "%~dp0start-markdown-translation.bat"
timeout /t 1
start "PDF Layout-Preserving Translation" "%~dp0start-pdf-translation.bat"
timeout /t 1
start "Format Conversion" "%~dp0start-format-conversion.bat"

echo All services started!
echo Please wait for all services to fully start before using the frontend.
timeout /t 5
goto MENU

:CHECK_STATUS
echo Checking service status...
echo.

curl -s http://localhost:8002/health >nul 2>&1
if errorlevel 1 (
    echo [X] PDF to Markdown (Port 8002): Not running
) else (
    echo [OK] PDF to Markdown (Port 8002): Running
)

curl -s http://localhost:8004/health >nul 2>&1
if errorlevel 1 (
    echo [X] Handwritten Image Recognition (Port 8004): Not running
) else (
    echo [OK] Handwritten Image Recognition (Port 8004): Running
)

curl -s http://localhost:8003/health >nul 2>&1  
if errorlevel 1 (
    echo [X] Markdown Translation (Port 8003): Not running
) else (
    echo [OK] Markdown Translation (Port 8003): Running
)

curl -s http://localhost:8005/health >nul 2>&1
if errorlevel 1 (
    echo [X] PDF Layout-Preserving Translation (Port 8005): Not running  
) else (
    echo [OK] PDF Layout-Preserving Translation (Port 8005): Running
)

curl -s http://localhost:8001/ >nul 2>&1
if errorlevel 1 (
    echo [X] Format Conversion (Port 8001): Not running
) else (
    echo [OK] Format Conversion (Port 8001): Running
)

echo.
echo Status check completed!
timeout /t 3
goto MENU

:EXIT
echo Exiting service manager...
exit /b 0 