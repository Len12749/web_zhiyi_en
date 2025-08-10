@echo off
echo 正在安装 pdf_to_markdown 板块的Python环境...
echo.

echo 安装PaddlePaddle (使用官方镜像源)...
python -m pip install --pre paddlepaddle -i https://www.paddlepaddle.org.cn/packages/nightly/cpu/

echo.
echo 安装PyTorch (使用官方镜像源)...
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu

echo.
echo 使用清华镜像源安装其他依赖...
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple paddlex
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple uvicorn
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple requests
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pymupdf
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple psutil
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple langdetect
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple matplotlib
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple transformers
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple python-multipart

echo.
echo pdf_to_markdown 环境安装完成！
pause 