#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
格式转换服务启动脚本
"""

import uvicorn
import sys
import os
from pathlib import Path

# 设置编码环境
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')

def main():
    print("=" * 50)
    print("Format Conversion Service")
    print("=" * 50)
    print("Service URL: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("Swagger UI: http://localhost:8001/redoc")
    print("-" * 50)
    print("Press Ctrl+C to stop service")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "app:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\nService stopped")
        sys.exit(0)

if __name__ == "__main__":
    main() 