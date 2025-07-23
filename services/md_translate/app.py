#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MD翻译后台服务
基于FastAPI的HTTP服务，支持Markdown文件翻译
"""

import os
import tempfile
import asyncio
from pathlib import Path
from typing import Optional
import uuid
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 导入翻译模块
from markdown_translator.translator import translate_document
from markdown_translator.chunk_splitter import optimize_text
from markdown_translator.content_optimizer import optimize_content

# 创建临时目录
TEMP_DIR = Path(tempfile.gettempdir()) / "md_translate_service"
TEMP_DIR.mkdir(exist_ok=True)

# 创建FastAPI应用
app = FastAPI(title="MD翻译服务", description="Markdown文件翻译API", version="1.0.0")

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
    'zh': 'zh',
    'en': 'en', 
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'ru': 'ru',
    'auto': 'auto'
}

@app.get("/")
async def root():
    """服务健康检查"""
    return {
        "service": "MD翻译服务",
        "version": "1.0.0",
        "status": "running",
        "supported_languages": list(LANGUAGE_MAPPING.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/translate")
async def translate_markdown(
    file: UploadFile = File(..., description="要翻译的Markdown文件"),
    sourceLanguage: str = Form("auto", description="源语言代码"),
    targetLanguage: str = Form("zh", description="目标语言代码")
):
    """
    翻译Markdown文件
    
    Args:
        file: 上传的Markdown文件
        sourceLanguage: 源语言代码，默认为auto（自动检测）
        targetLanguage: 目标语言代码，默认为zh（中文）
    
    Returns:
        翻译后的Markdown文件内容
    """
    try:
        # 检查文件类型
        if not file.filename or not (file.filename.lower().endswith('.md') or file.filename.lower().endswith('.markdown')):
            raise HTTPException(
                status_code=400,
                detail="只支持Markdown格式文件（.md, .markdown）"
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
        
        # 检查文件大小（限制为5MB）
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="文件大小超过限制（最大5MB）"
            )
        
        # 解码文件内容
        try:
            file_content = content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="文件编码错误，请确保使用UTF-8编码"
            )
        
        # 检查文件是否为空
        if not file_content.strip():
            raise HTTPException(
                status_code=400,
                detail="文件内容为空"
            )
        
        # 映射语言代码
        source_lang = LANGUAGE_MAPPING[sourceLanguage]
        target_lang = LANGUAGE_MAPPING[targetLanguage]
        
        # 如果源语言和目标语言相同，直接返回原文
        if source_lang == target_lang and source_lang != 'auto':
            return PlainTextResponse(
                content=file_content,
                media_type="text/markdown",
                headers={
                    "Content-Disposition": f'attachment; filename="{file.filename}"',
                    "X-Translation-Status": "skipped-same-language"
                }
            )
        
        # 执行翻译流程
        try:
            # 1. 智能分块
            chunks = await optimize_text(file_content)
            
            # 2. 内容优化
            optimized_chunks = await optimize_content(chunks)
            
            # 3. 翻译
            translated_content = await translate_document(optimized_chunks, source_lang, target_lang)
            
            # 生成翻译后的文件名
            original_name = file.filename
            name_parts = original_name.rsplit('.', 1)
            if len(name_parts) == 2:
                translated_filename = f"{name_parts[0]}_{target_lang}.{name_parts[1]}"
            else:
                translated_filename = f"{original_name}_{target_lang}"
            
            # 生成任务ID并存储文件
            task_id = str(uuid.uuid4())
            
                        # 存储翻译结果
            output_file = TEMP_DIR / f"{task_id}.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(translated_content)
            
            # 获取文件大小
            file_size = output_file.stat().st_size
            
            # 返回任务ID和文件信息
            return {
                "task_id": task_id,
                "filename": translated_filename,
                "original_filename": original_name,
                "source_language": source_lang,
                "target_language": target_lang,
                "file_size": file_size,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            # 翻译过程中出错
            raise HTTPException(
                status_code=500,
                detail=f"翻译处理失败: {str(e)}"
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
        翻译后的Markdown文件
    """
    try:
        # 验证任务ID格式
        try:
            uuid.UUID(task_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="无效的任务ID")
        
        # 查找文件
        output_file = TEMP_DIR / f"{task_id}.md"
        
        if not output_file.exists():
            raise HTTPException(status_code=404, detail="文件不存在或已过期")
        
        # 读取文件内容
        with open(output_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 返回文件
        return PlainTextResponse(
            content=content,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="translated_{task_id}.md"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载文件错误: {str(e)}")


if __name__ == "__main__":
    # 运行服务器
    print("🚀 启动MD翻译服务...")
    print("📍 服务地址: http://localhost:8003")
    print("📚 API文档: http://localhost:8003/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8003,
        log_level="info"
    ) 