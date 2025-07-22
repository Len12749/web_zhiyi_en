#!/usr/bin/env python3
"""
图片转Markdown服务启动脚本
"""

import uvicorn
import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("图片转Markdown后台服务")
    print("=" * 60)
    print("服务地址: http://localhost:8004")
    print("API文档: http://localhost:8004/docs")
    print("Swagger UI: http://localhost:8004/redoc")
    print("-" * 60)
    print("支持的功能:")
    print("  • 手写文字识别")
    print("  • 印刷文字提取")
    print("  • 数学公式转换")
    print("  • 图表和表格识别")
    print("  • AI智能识别")
    print("  • Markdown格式输出")
    print("-" * 60)
    print("按 Ctrl+C 停止服务")
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
        print("\n服务已停止")
        sys.exit(0)

if __name__ == "__main__":
    main() 