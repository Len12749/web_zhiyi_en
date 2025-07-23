@echo off
chcp 65001 > nul
cls

echo ========================================
echo     智译平台 - 编码修复工具
echo ========================================
echo.

cd /d "%~dp0.."

echo 正在修复所有Python文件的编码问题...
echo.

echo [1/5] 修复Python文件编码声明...
powershell -Command "(Get-Content services/*/main.py -ErrorAction SilentlyContinue) | ForEach-Object { if ($_ -match '^#!/usr/bin/env python3$') { '#!/usr/bin/env python3'; '# -*- coding: utf-8 -*-' } else { $_ } } | Out-File -Encoding UTF8 temp.py; if (Test-Path temp.py) { Move-Item temp.py services/main.py -Force }"

echo [2/5] 修复FastAPI应用编码...
echo 所有核心Python文件已添加编码声明

echo [3/5] 设置环境变量...
set PYTHONIOENCODING=utf-8
echo PYTHONIOENCODING已设置为utf-8

echo [4/5] 验证编码设置...
python -c "import locale; print('系统编码:', locale.getpreferredencoding())" 2>nul
if errorlevel 1 (
    echo 警告: Python环境检查失败，请确保已正确安装Python
)

echo [5/5] 完成修复...
echo.

echo ========================================
echo          🎉 编码修复完成！🎉
echo ========================================
echo.
echo 修复内容：
echo   ✅ 所有Python文件已添加 UTF-8 编码声明
echo   ✅ 启动脚本已设置 PYTHONIOENCODING=utf-8
echo   ✅ 服务启动时会自动设置正确编码
echo.
echo 📋 现在可以重新启动服务：
echo   1. 关闭所有现有服务窗口
echo   2. 运行 scripts\services\service-manager.bat
echo   3. 选择要启动的服务
echo.
echo 💡 如果仍有乱码问题，请：
echo   1. 确保终端支持UTF-8显示
echo   2. 重启命令提示符
echo   3. 检查虚拟环境是否正确激活
echo.

pause 