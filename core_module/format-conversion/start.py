#!/usr/bin/env python3
"""
格式转换服务启动脚本
"""

import uvicorn
import sys
from pathlib import Path

def main():
    print("=" * 50)
    print("格式转换后台服务")
    print("=" * 50)
    print("服务地址: http://localhost:8001")
    print("API文档: http://localhost:8001/docs")
    print("Swagger UI: http://localhost:8001/redoc")
    print("-" * 50)
    print("按 Ctrl+C 停止服务")
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
        print("\n服务已停止")
        sys.exit(0)

if __name__ == "__main__":
    main() 