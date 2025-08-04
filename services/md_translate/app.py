#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MD翻译后台服务
基于FastAPI的HTTP服务，支持Markdown文件翻译
"""

import os
import tempfile
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
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

# 任务状态管理
task_status: Dict[str, Dict[str, Any]] = {}

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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="要翻译的Markdown文件"),
    sourceLanguage: str = Form("auto", description="源语言代码"),
    targetLanguage: str = Form("zh", description="目标语言代码"),
    callback_url: str | None = Form(None, description="任务完成回调地址，可选")
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
        
        # 如果源语言和目标语言相同，直接返回成功状态
        if source_lang == target_lang and source_lang != 'auto':
            task_id = str(uuid.uuid4())
            
            # 创建任务专用目录
            task_dir = TEMP_DIR / task_id
            task_dir.mkdir(exist_ok=True)
            
            # 直接保存原文件
            output_file = task_dir / "result.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            # 初始化任务状态
            task_status[task_id] = {
                "status": "completed",
                "callback_url": callback_url,
                "progress": 100,
                "message": "源语言和目标语言相同，无需翻译",
                "created_at": datetime.now().isoformat(),
                "filename": file.filename,
                "file_size": len(content),
                "result_file": str(output_file),
                "error": None,
                "processing_options": {
                    "source_language": sourceLanguage,
                    "target_language": targetLanguage
                }
            }
            
                    # 如果有回调地址，发送完成通知
            if callback_url:
                try:
                    import requests, json
                    requests.post(callback_url, json={
                        "externalTaskId": task_id,
                        "status": "completed",
                        "message": "源语言和目标语言相同，无需翻译"
                    }, timeout=10)
                    print(f"✅ 已向回调地址发送完成通知: {callback_url}")
                except Exception as cb_err:
                    print(f"⚠️ 回调通知失败: {cb_err}")
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
        input_file = task_dir / "input.md"
        with open(input_file, "w", encoding='utf-8') as buffer:
            buffer.write(file_content)
        
        # 初始化任务状态
        task_status[task_id] = {
            "status": "processing",
            "progress": 0,
            "message": "开始处理Markdown翻译",
            "created_at": datetime.now().isoformat(),
            "filename": file.filename,
            "file_size": len(content),
            "output_dir": str(task_dir),
            "callback_url": callback_url,
            "result_file": None,
            "error": None,
            "processing_options": {
                "source_language": sourceLanguage,
                "target_language": targetLanguage
            }
        }
        
        # 启动后台任务
        background_tasks.add_task(
            process_markdown_translation_task,
            task_id,
            str(input_file),
            source_lang,
            target_lang,
            callback_url
        )
        
        return {
            "task_id": task_id,
            "status": "processing",
            "message": "Markdown翻译任务已启动"
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
        翻译后的Markdown文件
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
        
        # 读取文件内容
        with open(task_info["result_file"], 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 返回文件
        return PlainTextResponse(
            content=content,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{download_filename}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载文件错误: {str(e)}")


async def process_markdown_translation_task(
    task_id: str,
    file_path: str,
    source_lang: str,
    target_lang: str,
    callback_url: str | None = None
):
    """
    异步处理Markdown翻译任务 - 使用线程池避免阻塞事件循环
    """
    # 使用线程池执行同步的CPU密集型任务
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        await loop.run_in_executor(
            executor, 
            _process_markdown_translation_task_sync,
            task_id, file_path, source_lang, target_lang, callback_url
        )


def _process_markdown_translation_task_sync(
    task_id: str,
    file_path: str,
    source_lang: str,
    target_lang: str,
    callback_url: str | None = None
):
    """
    同步处理Markdown翻译的后台任务
    """
    try:
        # 更新任务状态
        task_status[task_id]["message"] = "读取文件内容"
        task_status[task_id]["progress"] = 10
        
        # 读取输入文件
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
        
        # 准备输出文件路径
        task_dir = Path(task_status[task_id]["output_dir"])
        output_file_path = task_dir / "result.md"
        
        # 执行翻译流程
        task_status[task_id]["message"] = "智能分块处理"
        task_status[task_id]["progress"] = 30
        
        # 注意：这里需要在主线程中运行异步函数
        import asyncio
        
        # 创建新的事件循环来运行异步函数
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # 1. 智能分块
            chunks = loop.run_until_complete(optimize_text(file_content))
            
            task_status[task_id]["message"] = "内容优化"
            task_status[task_id]["progress"] = 50
            
            # 2. 内容优化
            optimized_chunks = loop.run_until_complete(optimize_content(chunks))
            
            task_status[task_id]["message"] = "正在翻译"
            task_status[task_id]["progress"] = 70
            
            # 3. 翻译
            translated_content = loop.run_until_complete(translate_document(optimized_chunks, source_lang, target_lang))
            
        finally:
            loop.close()
        
        # 保存翻译结果
        task_status[task_id]["message"] = "保存翻译结果"
        task_status[task_id]["progress"] = 90
        
        with open(output_file_path, 'w', encoding='utf-8') as f:
            f.write(translated_content)
        
        # 更新任务状态为完成
        task_status[task_id]["status"] = "completed"
        task_status[task_id]["progress"] = 100
        task_status[task_id]["message"] = "翻译完成"
        task_status[task_id]["result_file"] = str(output_file_path)
        task_status[task_id]["file_size"] = output_file_path.stat().st_size
        
        print(f"Markdown翻译任务 {task_id} 完成")
        # 任务完成后回调
        if callback_url:
            try:
                import requests, json
                requests.post(callback_url, json={
                    "externalTaskId": task_id,
                    "status": "completed",
                    "message": "翻译完成"
                }, timeout=10)
                print(f"✅ 已向回调地址发送完成通知: {callback_url}")
            except Exception as cb_err:
                print(f"⚠️ 回调通知失败: {cb_err}")
        
    except Exception as e:
        # 处理失败
        error_message = f"Markdown翻译处理失败: {str(e)}"
        task_status[task_id]["status"] = "failed"
        task_status[task_id]["error"] = error_message
        task_status[task_id]["message"] = error_message
        print(f"Markdown翻译任务 {task_id} 失败: {error_message}")
        # 回调失败通知
        if callback_url:
            try:
                import requests, json
                requests.post(callback_url, json={
                    "externalTaskId": task_id,
                    "status": "failed",
                    "message": error_message
                }, timeout=10)
                print(f"✅ 已向回调地址发送失败通知: {callback_url}")
            except Exception as cb_err:
                print(f"⚠️ 回调通知失败: {cb_err}")


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