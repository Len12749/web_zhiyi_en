#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片转Markdown服务启动脚本
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
    print("=" * 60)
    print("Image to Markdown Service")
    print("=" * 60)
    print("Service URL: http://localhost:8004")
    print("API Docs: http://localhost:8004/docs")
    print("Swagger UI: http://localhost:8004/redoc")
    print("-" * 60)
    print("Features:")
    print("  • Handwriting Recognition")
    print("  • Printed Text Extraction")
    print("  • Math Formula Conversion")
    print("  • Chart & Table Recognition")
    print("  • AI Smart Recognition")
    print("  • Markdown Format Output")
    print("-" * 60)
    print("Press Ctrl+C to stop service")
    print("=" * 60)
    
    try:
        uvicorn.run(
            "app:app",
            host="0.0.0.0",
            port=8004,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\nService stopped")
        sys.exit(0)

if __name__ == "__main__":
    main() 