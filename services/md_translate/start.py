#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MD翻译服务启动脚本
"""

import uvicorn
import os
import sys
from app import app

# 设置编码环境
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')

if __name__ == "__main__":
    print("Starting Markdown Translation Service...")
    print("Service URL: http://localhost:8003")
    print("API Docs: http://localhost:8003/docs")
    print("For frontend Markdown translation functionality")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8003,
        log_level="info",
        reload=False
    ) 