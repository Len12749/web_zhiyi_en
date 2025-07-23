#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF翻译后台服务
基于FastAPI的HTTP服务，支持PDF文件保留排版翻译
"""

import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional
import uuid
from datetime import datetime
import yaml

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 导入PDF翻译器
from cli import PDFTranslator
from utils import load_config

# 创建FastAPI应用
app = FastAPI(title="PDF翻译服务", description="PDF文件保留排版翻译API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 支持的语言映射
LANGUAGE_MAPPING = {
    'zh': '中文',
    'en': '英语',
    'ja': '日语',
    'ko': '韩语',
    'fr': '法语',
    'de': '德语',
    'es': '西班牙语',
    'ru': '俄语'
}

# 配置文件路径
CONFIG_PATH = Path(__file__).parent / "config.yaml"

@app.get("/")
async def root():
    """服务健康检查"""
    return {
        "service": "PDF翻译服务",
        "version": "1.0.0",
        "status": "running",
        "supported_languages": list(LANGUAGE_MAPPING.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/translate-pdf")
async def translate_pdf(
    file: UploadFile = File(..., description="要翻译的PDF文件"),
    sourceLanguage: str = Form("en", description="源语言代码"),
    targetLanguage: str = Form("zh", description="目标语言代码"),
    sideBySide: bool = Form(False, description="是否并排显示原文和译文")
):
    """
    翻译PDF文件，保留原始排版
    
    Args:
        file: 上传的PDF文件
        sourceLanguage: 源语言代码，默认为en（英语）
        targetLanguage: 目标语言代码，默认为zh（中文）
        sideBySide: 是否并排显示原文和译文，默认为False
    
    Returns:
        翻译后的PDF文件
    """
    try:
        # 检查文件类型
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="只支持PDF格式文件"
            )
        
        # 验证语言代码
        if sourceLanguage not in LANGUAGE_MAPPING:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的源语言代码: {sourceLanguage}"
            )
        
        if targetLanguage not in LANGUAGE_MAPPING:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的目标语言代码: {targetLanguage}"
            )
        
        # 读取文件内容
        content = await file.read()
        
        # 检查文件大小（限制为50MB）
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="文件大小超过限制（最大50MB）"
            )
        
        # 检查文件是否为空
        if not content:
            raise HTTPException(
                status_code=400,
                detail="上传的PDF文件为空"
            )
        
        # 映射语言代码
        source_lang = LANGUAGE_MAPPING[sourceLanguage]
        target_lang = LANGUAGE_MAPPING[targetLanguage]
        
        # 如果源语言和目标语言相同，直接返回原文
        if source_lang == target_lang:
            return FileResponse(
                path=None,
                filename=file.filename,
                media_type="application/pdf",
                headers={
                    "X-Translation-Status": "skipped-same-language"
                }
            )
        
        # 创建临时目录
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # 保存输入PDF文件
            input_pdf_path = temp_path / f"input_{uuid.uuid4().hex}.pdf"
            with open(input_pdf_path, 'wb') as f:
                f.write(content)
            
            # 生成输出PDF文件名
            output_pdf_path = temp_path / f"translated_{uuid.uuid4().hex}.pdf"
            
            # 检查配置文件是否存在
            if not CONFIG_PATH.exists():
                raise HTTPException(
                    status_code=500,
                    detail="配置文件不存在，请检查服务配置"
                )
            
            try:
                # 初始化PDF翻译器
                translator = PDFTranslator(str(CONFIG_PATH))
                
                # 执行翻译
                translator.translate_pdf(
                    pdf_path=input_pdf_path,
                    output_path=output_pdf_path,
                    from_lang=source_lang,
                    to_lang=target_lang,
                    side_by_side=sideBySide
                )
                
                # 检查输出文件是否存在
                if not output_pdf_path.exists():
                    raise HTTPException(
                        status_code=500,
                        detail="翻译完成，但未能生成输出文件"
                    )
                
                # 生成翻译后的文件名
                original_name = file.filename
                name_parts = original_name.rsplit('.', 1)
                if len(name_parts) == 2:
                    translated_filename = f"{name_parts[0]}_{targetLanguage}.{name_parts[1]}"
                else:
                    translated_filename = f"{original_name}_{targetLanguage}"
                
                # 生成任务ID并存储文件
                task_id = str(uuid.uuid4())
                
                # 创建存储目录
                storage_dir = Path("File")
                storage_dir.mkdir(exist_ok=True)
                
                                # 存储翻译结果
                stored_file = storage_dir / f"{task_id}.pdf"
                shutil.copy2(output_pdf_path, stored_file)
                
                # 获取文件大小
                file_size = stored_file.stat().st_size
                
                # 返回任务ID和文件信息
                return {
                    "task_id": task_id,
                    "filename": translated_filename,
                    "original_filename": original_name,
                    "source_language": sourceLanguage,
                    "target_language": targetLanguage,
                    "file_size": file_size,
                    "timestamp": datetime.now().isoformat(),
                    "status": "completed",
                    "side_by_side": sideBySide
                }
                
            except Exception as e:
                # 翻译过程中出错
                raise HTTPException(
                    status_code=500,
                    detail=f"PDF翻译处理失败: {str(e)}"
                )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"服务器内部错误: {str(e)}"
        )


@app.get("/download/{task_id}")
async def download_result(task_id: str):
    """
    下载翻译结果文件
    
    Args:
        task_id: 任务ID
    
    Returns:
        翻译后的PDF文件
    """
    try:
        # 验证任务ID格式
        try:
            uuid.UUID(task_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的任务ID")
        
        # 查找文件
        storage_dir = Path("File")
        output_file = storage_dir / f"{task_id}.pdf"
        
        if not output_file.exists():
            raise HTTPException(status_code=404, detail="文件不存在或已过期")
        
        # 返回文件
        return FileResponse(
            path=output_file,
            filename=f"translated_{task_id}.pdf",
            media_type="application/pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载文件错误: {str(e)}")


if __name__ == "__main__":
    # 运行服务器
    print("🚀 启动PDF翻译服务...")
    print("📍 服务地址: http://localhost:8005")
    print("📚 API文档: http://localhost:8005/docs")
    print("🔧 用于前端PDF保留排版翻译功能")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8005,
        log_level="info"
    ) 