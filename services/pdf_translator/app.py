#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF翻译后台服务
基于FastAPI的HTTP服务，支持PDF文件保留排版翻译
"""

import os
import tempfile
import shutil
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional, Dict, Any
import uuid
from datetime import datetime
import yaml

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
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

# 创建临时目录
TEMP_DIR = Path(tempfile.gettempdir()) / "pdf_translator_service"
TEMP_DIR.mkdir(exist_ok=True)

# 任务状态管理
task_status: Dict[str, Dict[str, Any]] = {}

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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="要翻译的PDF文件"),
    sourceLanguage: str = Form("en", description="源语言代码"),
    targetLanguage: str = Form("zh", description="目标语言代码"),
    sideBySide: bool = Form(False, description="是否并排显示原文和译文")
):
    """
    翻译PDF文件，保留原始排版 - 异步处理
    
    Args:
        file: 上传的PDF文件
        sourceLanguage: 源语言代码，默认为en（英语）
        targetLanguage: 目标语言代码，默认为zh（中文）
        sideBySide: 是否并排显示原文和译文，默认为False
    
    Returns:
        任务ID和状态
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
        
        # 如果源语言和目标语言相同，直接返回成功状态
        if source_lang == target_lang:
            task_id = str(uuid.uuid4())
            
            # 创建任务专用目录
            task_dir = TEMP_DIR / task_id
            task_dir.mkdir(exist_ok=True)
            
            # 直接保存原文件
            output_file = task_dir / "result.pdf"
            with open(output_file, 'wb') as f:
                f.write(content)
            
            # 初始化任务状态
            task_status[task_id] = {
                "status": "completed",
                "progress": 100,
                "message": "源语言和目标语言相同，无需翻译",
                "created_at": datetime.now().isoformat(),
                "filename": file.filename,
                "file_size": len(content),
                "result_file": str(output_file),
                "error": None,
                "processing_options": {
                    "source_language": sourceLanguage,
                    "target_language": targetLanguage,
                    "side_by_side": sideBySide
                }
            }
            
            return {
                "task_id": task_id,
                "status": "completed",
                "message": "源语言和目标语言相同，无需翻译"
            }
        
        # 生成任务ID
        task_id = str(uuid.uuid4())
        
        # 创建任务专用目录
        task_dir = TEMP_DIR / task_id
        task_dir.mkdir(exist_ok=True)
        
        # 保存上传的文件
        input_file = task_dir / "input.pdf"
        with open(input_file, "wb") as buffer:
            buffer.write(content)
        
        # 初始化任务状态
        task_status[task_id] = {
            "status": "processing",
            "progress": 0,
            "message": "开始处理PDF翻译",
            "created_at": datetime.now().isoformat(),
            "filename": file.filename,
            "file_size": len(content),
            "output_dir": str(task_dir),
            "result_file": None,
            "error": None,
            "processing_options": {
                "source_language": sourceLanguage,
                "target_language": targetLanguage,
                "side_by_side": sideBySide
            }
        }
        
        # 启动后台任务
        background_tasks.add_task(
            process_pdf_translation_task,
            task_id,
            str(input_file),
            source_lang,
            target_lang,
            sideBySide
        )
        
        return {
            "task_id": task_id,
            "status": "processing",
            "message": "PDF翻译任务已启动"
        }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"服务器内部错误: {str(e)}"
        )


@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return task_status[task_id]


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
        
        # 检查任务是否存在
        if task_id not in task_status:
            raise HTTPException(status_code=404, detail="任务不存在")
        
        task_info = task_status[task_id]
        
        # 检查任务是否完成
        if task_info["status"] != "completed":
            raise HTTPException(status_code=400, detail="任务尚未完成")
        
        # 检查结果文件是否存在
        if not task_info["result_file"] or not os.path.exists(task_info["result_file"]):
            raise HTTPException(status_code=404, detail="结果文件不存在或已过期")
        
        # 生成下载文件名
        original_name = task_info["filename"]
        processing_options = task_info["processing_options"]
        target_language = processing_options["target_language"]
        
        name_parts = original_name.rsplit('.', 1)
        if len(name_parts) == 2:
            download_filename = f"{name_parts[0]}_{target_language}.{name_parts[1]}"
        else:
            download_filename = f"{original_name}_{target_language}"
        
        # 返回文件
        return FileResponse(
            path=task_info["result_file"],
            filename=download_filename,
            media_type="application/pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载文件错误: {str(e)}")


async def process_pdf_translation_task(
    task_id: str,
    pdf_path: str,
    source_lang: str,
    target_lang: str,
    side_by_side: bool
):
    """
    异步处理PDF翻译任务 - 使用线程池避免阻塞事件循环
    """
    # 使用线程池执行同步的CPU密集型任务
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        await loop.run_in_executor(
            executor, 
            _process_pdf_translation_task_sync,
            task_id, pdf_path, source_lang, target_lang, side_by_side
        )


def _process_pdf_translation_task_sync(
    task_id: str,
    pdf_path: str,
    source_lang: str,
    target_lang: str,
    side_by_side: bool
):
    """
    同步处理PDF翻译的后台任务
    """
    try:
        # 更新任务状态
        task_status[task_id]["message"] = "初始化翻译器"
        task_status[task_id]["progress"] = 10
        
        # 检查配置文件是否存在
        if not CONFIG_PATH.exists():
            raise Exception("配置文件不存在，请检查服务配置")
        
        # 初始化PDF翻译器
        task_status[task_id]["message"] = "加载翻译模型"
        task_status[task_id]["progress"] = 20
        
        translator = PDFTranslator(str(CONFIG_PATH))
        
        # 准备输出文件路径
        task_dir = Path(task_status[task_id]["output_dir"])
        output_pdf_path = task_dir / "result.pdf"
        
        # 执行翻译
        task_status[task_id]["message"] = "正在翻译PDF文件"
        task_status[task_id]["progress"] = 30
        
        translator.translate_pdf(
            pdf_path=Path(pdf_path),
            output_path=output_pdf_path,
            from_lang=source_lang,
            to_lang=target_lang,
            side_by_side=side_by_side
        )
        
        # 检查输出文件是否存在
        if not output_pdf_path.exists():
            raise Exception("翻译完成，但未能生成输出文件")
        
        # 更新任务状态为完成
        task_status[task_id]["status"] = "completed"
        task_status[task_id]["progress"] = 100
        task_status[task_id]["message"] = "翻译完成"
        task_status[task_id]["result_file"] = str(output_pdf_path)
        task_status[task_id]["file_size"] = output_pdf_path.stat().st_size
        
        print(f"PDF翻译任务 {task_id} 完成")
        
    except Exception as e:
        # 处理失败
        error_message = f"PDF翻译处理失败: {str(e)}"
        task_status[task_id]["status"] = "failed"
        task_status[task_id]["error"] = error_message
        task_status[task_id]["message"] = error_message
        print(f"PDF翻译任务 {task_id} 失败: {error_message}")


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