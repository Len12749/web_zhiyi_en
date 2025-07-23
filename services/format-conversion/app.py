#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
格式转换后台服务
基于FastAPI的HTTP服务，支持Markdown文件格式转换
"""

import os
import tempfile
import subprocess
from pathlib import Path
from typing import Optional
from enum import Enum
import uuid
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 创建FastAPI应用
app = FastAPI(title="格式转换服务", description="Markdown文件格式转换API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OutputFormat(str, Enum):
    WORD = "docx"
    HTML = "html" 
    PDF = "pdf"
    LATEX = "tex"

class PDFTheme(str, Enum):
    EISVOGEL = "eisvogel"
    ELEGANT = "elegant"
    ACADEMIC = "academic"

# 获取项目根目录
PROJECT_ROOT = Path(__file__).parent

def ensure_pandoc():
    """确保Pandoc可用"""
    try:
        result = subprocess.run(['pandoc', '--version'], 
                              capture_output=True, text=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def convert_file(input_path: Path, output_format: OutputFormat, 
                pdf_theme: Optional[PDFTheme] = None) -> Path:
    """执行文件格式转换"""
    
    if not ensure_pandoc():
        raise HTTPException(status_code=500, detail="Pandoc未安装或不可用")
    
    # 生成输出文件路径
    output_path = input_path.with_suffix(f".{output_format.value}")
    
    # 构建pandoc命令
    cmd = ['pandoc', str(input_path), '-o', str(output_path)]
    
    # 根据输出格式添加特定参数
    if output_format == OutputFormat.WORD:
        # Word格式转换
        lua_filter = PROJECT_ROOT / "tools" / "fix_images_word.lua"
        if lua_filter.exists():
            cmd.extend(['--lua-filter', str(lua_filter)])
        cmd.extend([
            '--toc'  # 添加目录
        ])
        # 如果有参考文档模板，可以添加：
        # reference_doc = PROJECT_ROOT / "templates" / "reference.docx"
        # if reference_doc.exists():
        #     cmd.extend(['--reference-doc', str(reference_doc)])
        
    elif output_format == OutputFormat.HTML:
        # HTML格式转换
        lua_filter = PROJECT_ROOT / "tools" / "fix_images.lua"
        if lua_filter.exists():
            cmd.extend(['--lua-filter', str(lua_filter)])
        cmd.extend([
            '--standalone',
            '--toc'
        ])
        # 如果有CSS文件，可以添加：
        # css_file = PROJECT_ROOT / "templates" / "style.css"
        # if css_file.exists():
        #     cmd.extend(['--css', str(css_file)])
        
    elif output_format == OutputFormat.PDF:
        # PDF格式转换
        lua_filter = PROJECT_ROOT / "tools" / "fix_images.lua"
        if lua_filter.exists():
            cmd.extend(['--lua-filter', str(lua_filter)])
        
        # 设置PDF引擎和主题
        cmd.extend([
            '--pdf-engine', 'xelatex',
            '--toc'
        ])
        
        # 如果指定了主题
        if pdf_theme:
            template_path = PROJECT_ROOT / "templates" / f"{pdf_theme.value}.tex"
            if template_path.exists():
                cmd.extend(['--template', str(template_path)])
                
    elif output_format == OutputFormat.LATEX:
        # LaTeX格式转换
        lua_filter = PROJECT_ROOT / "tools" / "fix_tables.lua"
        if lua_filter.exists():
            cmd.extend(['--lua-filter', str(lua_filter)])
        cmd.extend([
            '--standalone',
            '--toc'
        ])
    
    # 执行转换
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, 
                              cwd=PROJECT_ROOT, timeout=3600)
        return output_path
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"格式转换失败: {e.stderr or e.stdout}"
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="转换超时")

@app.get("/")
async def root():
    """服务状态检查"""
    return {
        "service": "格式转换服务",
        "status": "运行中",
        "pandoc_available": ensure_pandoc()
    }

@app.post("/convert")
async def convert_markdown(
    file: UploadFile = File(...),
    format: OutputFormat = Form(...),
    pdf_theme: Optional[PDFTheme] = Form(None)
):
    """
    转换Markdown文件到指定格式
    
    Args:
        file: 上传的Markdown文件
        format: 目标格式 (docx, html, pdf, tex)
        pdf_theme: PDF主题 (仅当format为pdf时使用)
    
    Returns:
        转换后的文件
    """
    
    # 验证文件类型
    if not file.filename.lower().endswith(('.md', '.markdown')):
        raise HTTPException(status_code=400, detail="只支持Markdown文件")
    
    # 验证PDF主题参数
    if format == OutputFormat.PDF and pdf_theme is None:
        pdf_theme = PDFTheme.EISVOGEL  # 设置默认主题
    
    # 创建临时目录
    temp_dir = Path(tempfile.mkdtemp())
    
    try:
        # 保存上传的文件
        input_path = temp_dir / file.filename
        with open(input_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        # 执行转换
        output_path = convert_file(input_path, format, pdf_theme)
        
        # 检查输出文件是否存在
        if not output_path.exists():
            raise HTTPException(status_code=500, detail="转换失败：输出文件未生成")
        
        # 生成下载文件名
        original_name = Path(file.filename).stem
        download_filename = f"{original_name}.{format.value}"
        
        # 返回文件
        return FileResponse(
            path=str(output_path),
            filename=download_filename,
            media_type='application/octet-stream'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # 清理临时文件（延迟删除，确保文件传输完成）
        # 在生产环境中，可以考虑使用后台任务来清理
        pass

@app.get("/formats")
async def get_supported_formats():
    """获取支持的格式列表"""
    return {
        "formats": [
            {"value": "docx", "label": "Word文档", "description": "Microsoft Word格式"},
            {"value": "html", "label": "HTML网页", "description": "网页格式"},
            {"value": "pdf", "label": "PDF文档", "description": "PDF格式"},
            {"value": "tex", "label": "LaTeX", "description": "LaTeX源文件"}
        ],
        "pdf_themes": [
            {"value": "eisvogel", "label": "Eisvogel", "description": "现代简洁主题"},
            {"value": "elegant", "label": "Elegant", "description": "优雅主题"},
            {"value": "academic", "label": "Academic", "description": "学术主题"}
        ]
    }

if __name__ == "__main__":
    print("启动格式转换服务...")
    print("服务地址: http://localhost:8001")
    print("API文档: http://localhost:8001/docs")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 