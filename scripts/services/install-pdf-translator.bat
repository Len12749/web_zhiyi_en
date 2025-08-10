@echo off
echo 正在安装 pdf_translator 板块的Python环境...
echo.

echo 安装PyTorch (使用官方镜像源)...
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu

echo.
echo 使用清华镜像源安装其他依赖...
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple PyPDF2
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple uvicorn
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pyyaml
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple matplotlib
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple tqdm
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple shapely
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pyclipper
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple scikit-image
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple timm

echo.
echo 安装detectron2 (使用清华镜像源)...
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple 'git+https://github.com/facebookresearch/detectron2.git'

echo.
echo pdf_translator 环境安装完成！
pause 