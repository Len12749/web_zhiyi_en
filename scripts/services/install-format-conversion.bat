@echo off
echo 正在安装 format-conversion 板块的Python环境...
echo.

echo 使用清华镜像源安装基础依赖...
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple uvicorn
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple python-multipart

echo.
echo format-conversion 环境安装完成！
pause 