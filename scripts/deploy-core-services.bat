@echo off
chcp 65001 > nul
cls

echo ========================================
echo      智译平台 - 核心服务部署脚本
echo ========================================
echo.

cd /d "%~dp0.."

echo 正在检查源文件...
if not exist "core_module\pdf_to_markdown" (
    echo 错误: 找不到 core_module\pdf_to_markdown
    goto ERROR
)

if not exist "core_module\image-to-markdown" (
    echo 错误: 找不到 core_module\image-to-markdown
    goto ERROR
)

if not exist "core_module\md_translate" (
    echo 错误: 找不到 core_module\md_translate
    goto ERROR
)

if not exist "core_module\pdf_translator" (
    echo 错误: 找不到 core_module\pdf_translator
    goto ERROR
)

if not exist "core_module\format-conversion" (
    echo 错误: 找不到 core_module\format-conversion
    goto ERROR
)

echo ✅ 源文件检查完成
echo.

echo 正在创建services目录...
if not exist "services" mkdir services
echo ✅ services目录已创建
echo.

echo 正在复制核心服务...
echo [1/5] 复制 PDF转Markdown 服务...
xcopy /E /I /Y "core_module\pdf_to_markdown" "services\pdf_to_markdown" > nul
if errorlevel 1 goto ERROR
echo ✅ PDF转Markdown 服务复制完成

echo [2/5] 复制 图片转Markdown 服务...
xcopy /E /I /Y "core_module\image-to-markdown" "services\image-to-markdown" > nul
if errorlevel 1 goto ERROR
echo ✅ 图片转Markdown 服务复制完成

echo [3/5] 复制 Markdown翻译 服务...
xcopy /E /I /Y "core_module\md_translate" "services\md_translate" > nul
if errorlevel 1 goto ERROR
echo ✅ Markdown翻译 服务复制完成

echo [4/5] 复制 PDF翻译 服务...
xcopy /E /I /Y "core_module\pdf_translator" "services\pdf_translator" > nul
if errorlevel 1 goto ERROR
echo ✅ PDF翻译 服务复制完成

echo [5/5] 复制 格式转换 服务...
xcopy /E /I /Y "core_module\format-conversion" "services\format-conversion" > nul
if errorlevel 1 goto ERROR
echo ✅ 格式转换 服务复制完成

echo.
echo ========================================
echo          🎉 部署完成！🎉
echo ========================================
echo.
echo 核心服务已复制到以下位置：
echo   📁 services\pdf_to_markdown      (端口8002, docling环境)
echo   📁 services\image-to-markdown    (端口8004, docling环境)
echo   📁 services\md_translate         (端口8003, docling环境)
echo   📁 services\pdf_translator       (端口8005, test环境)
echo   📁 services\format-conversion    (端口8001, docling环境)
echo.
echo 📋 下一步操作：
echo   1. 运行 scripts\services\service-manager.bat 启动所有服务
echo   2. 或者单独启动需要的服务
echo   3. 运行 npm run dev 启动前端服务
echo.
echo 🔧 服务管理：
echo   启动所有服务: scripts\services\service-manager.bat
echo   检查服务状态: 在服务管理器中选择 [S]
echo.
goto END

:ERROR
echo.
echo ❌ 部署失败！
echo 请检查错误信息并重试。
echo.
goto END

:END
echo 按任意键退出...
pause > nul 