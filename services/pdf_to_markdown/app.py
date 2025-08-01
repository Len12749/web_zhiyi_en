#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF转Markdown后台服务
基于FastAPI的HTTP服务，支持PDF文件解析为Markdown
"""

import os
import tempfile
import asyncio
import uuid
import zipfile
import shutil
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
import json
import logging

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 导入PDF转换模块
from src.core.data_structures import ProcessingState, OutputConfiguration
from src.config.model_config import ModelConfig, load_model_config_from_file
from src.modules import (
    PDFPreprocessor, LayoutDetector, OrderAnalyzer, ContentParser,
    HeadingLevelAnalyzer, DocumentAssembler, OutputManager, Translator
)
from src.utils.logger import setup_logger

# 创建临时目录
TEMP_DIR = Path("File") / "pdf_to_markdown_temp"
TEMP_DIR.mkdir(exist_ok=True)

# 创建FastAPI应用
app = FastAPI(title="PDF转Markdown服务", description="PDF文件解析为Markdown的API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 设置日志
logger = setup_logger(__name__)

# 任务状态存储
task_status: Dict[str, Dict[str, Any]] = {}

# 支持的语言映射
LANGUAGE_MAPPING = {
    'zh': 'zh-CN',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'ru': 'ru',
}

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "PDF转Markdown服务",
        "version": "1.0.0",
        "endpoints": {
            "parse": "POST /parse - 解析PDF文件",
            "status": "GET /status/{task_id} - 查询任务状态",
            "download": "GET /download/{task_id} - 下载解析结果"
        }
    }

@app.post("/parse")
async def parse_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    table_mode: str = Form("markdown"),
    enable_translation: str = Form("false"),
    target_language: str = Form("zh"),
    output_options: str = Form("original")
):
    """
    解析PDF文件
    
    Args:
        file: PDF文件
        table_mode: 表格格式 ("markdown" 或 "image")
        enable_translation: 是否启用翻译 ("true" 或 "false")
        target_language: 目标语言
        output_options: 输出选项，逗号分隔 ("original,translated,bilingual")
    
    Returns:
        任务ID和状态
    """
    # 解析翻译参数
    include_translation = enable_translation.lower() == "true"
    
    # 解析输出选项
    output_opts = [opt.strip() for opt in output_options.split(',') if opt.strip()]
    # 保留原始选项列表，用于精确控制输出
    original_output_options = output_opts.copy()
    # 为了向后兼容，保留原有的布尔标志
    translated_only = "translated" in output_opts and "original" not in output_opts
    bilingual_output = "bilingual" in output_opts
    include_original = "original" in output_opts
    # 验证文件类型
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="只支持PDF格式文件")
    
    # 生成任务ID
    task_id = str(uuid.uuid4())
    
    # 创建任务专用目录
    task_dir = TEMP_DIR / task_id
    task_dir.mkdir(exist_ok=True)
    
    # 保存上传的文件
    input_file = task_dir / "input.pdf"
    with open(input_file, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # 初始化任务状态
    task_status[task_id] = {
        "status": "processing",
        "progress": 0,
        "message": "开始处理PDF文件",
        "created_at": datetime.now().isoformat(),
        "filename": file.filename,
        "file_size": len(content),
        "output_dir": str(task_dir / "output"),
        "result_file": None,
        "error": None,
        "processing_options": {
            "table_mode": table_mode,
            "include_translation": include_translation,
            "target_language": target_language,
            "translated_only": translated_only,
            "bilingual_output": bilingual_output,
            "include_original": include_original,
            "original_output_options": original_output_options
        }
    }
    
    # 启动后台任务
    background_tasks.add_task(
        process_pdf_task,
        task_id,
        str(input_file),
        table_mode,
        include_translation,
        target_language,
        translated_only,
        bilingual_output,
        include_original,
        original_output_options
    )
    
    return {
        "task_id": task_id,
        "status": "processing",
        "message": "PDF处理任务已启动"
    }

@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return task_status[task_id]

@app.get("/download/{task_id}")
async def download_result(task_id: str):
    """下载解析结果"""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task_info = task_status[task_id]
    
    if task_info["status"] != "completed":
        raise HTTPException(status_code=400, detail="任务尚未完成")
    
    if not task_info["result_file"] or not os.path.exists(task_info["result_file"]):
        raise HTTPException(status_code=404, detail="结果文件不存在")
    
    # 使用实际的ZIP文件名
    actual_filename = os.path.basename(task_info["result_file"])
    
    return FileResponse(
        task_info["result_file"],
        filename=actual_filename,
        media_type="application/zip"
    )

async def process_pdf_task(
    task_id: str,
    pdf_path: str,
    table_format: str,
    include_translation: bool,
    target_language: str,
    translated_only: bool,
    bilingual_output: bool,
    include_original: bool,
    original_output_options: list[str]
):
    """
    处理PDF的后台任务
    """
    try:
        # 更新任务状态
        task_status[task_id]["message"] = "加载模型配置"
        task_status[task_id]["progress"] = 5
        
        # 加载模型配置
        model_config_path = "src/config/model_config.json"
        if os.path.exists(model_config_path):
            model_config = load_model_config_from_file(model_config_path)
        else:
            model_config = ModelConfig()
        
        # 设置输出目录
        output_dir = task_status[task_id]["output_dir"]
        os.makedirs(output_dir, exist_ok=True)
        
        # 创建输出配置，使用原始文件名
        original_filename = task_status[task_id]["filename"]
        base_filename = os.path.splitext(original_filename)[0]
        
        # 记录用户选择的输出选项
        logger.info(f"任务 {task_id} 输出配置: include_translation={include_translation}, "
                   f"translated_only={translated_only}, bilingual_output={bilingual_output}, "
                   f"include_original={include_original}, table_format={table_format}")
        
        output_config = OutputConfiguration(
            output_dir=output_dir,
            base_filename=base_filename,
            include_translation=include_translation,
            target_language=LANGUAGE_MAPPING.get(target_language, target_language),
            translated_only=translated_only,
            bilingual_output=bilingual_output,
            table_as_image=(table_format == "image"),
            debug_mode=False,
            original_output_options=original_output_options
        )
        
        # 初始化处理状态
        state = ProcessingState(
            pdf_path=pdf_path,
            current_stage="preprocessing",
            debug_enabled=False
        )
        
        # 步骤1: 预处理
        task_status[task_id]["message"] = "预处理PDF文件"
        task_status[task_id]["progress"] = 10
        
        preprocessor = PDFPreprocessor(model_config, debug_mode=False)
        pdf_pages, state = preprocessor.process_pdf(pdf_path)
        
        # 步骤2: 版面检测
        task_status[task_id]["message"] = "版面检测"
        task_status[task_id]["progress"] = 25
        
        layout_detector = LayoutDetector(debug_mode=False)
        if not layout_detector.load_model():
            raise Exception("版面检测模型加载失败")
        layout_results, state = layout_detector.detect_layout(pdf_pages, state)
        
        # 步骤3: 阅读顺序分析
        task_status[task_id]["message"] = "阅读顺序分析"
        task_status[task_id]["progress"] = 40
        
        order_analyzer = OrderAnalyzer(debug_mode=False)
        if not order_analyzer.load_model():
            raise Exception("阅读顺序分析模型加载失败")
        order_results, state = order_analyzer.analyze_document_order(layout_results, state)
        
        # 步骤4: 内容解析
        task_status[task_id]["message"] = "内容解析"
        task_status[task_id]["progress"] = 55
        
        content_parser = ContentParser(model_config, debug_mode=False, table_as_image=(table_format == "image"))
        content_results, state = content_parser.parse_document(pdf_pages, layout_results, order_results, output_dir, state)
        
        # 步骤5: 标题分级
        task_status[task_id]["message"] = "标题分级"
        task_status[task_id]["progress"] = 70
        
        heading_analyzer = HeadingLevelAnalyzer(model_config, debug_mode=False)
        heading_result, state = heading_analyzer.analyze(content_results, state)
        
        # 步骤6: 翻译（如果需要）
        if include_translation:
            task_status[task_id]["message"] = f"翻译文档至{target_language}"
            task_status[task_id]["progress"] = 80
            
            # 获取目标语言的完整名称
            target_lang_full = LANGUAGE_MAPPING.get(target_language, target_language)
            logger.info(f"任务 {task_id} 开始翻译，目标语言: {target_language} -> {target_lang_full}")
            
            translator = Translator(model_config, debug_mode=False)
            # 提取所有内容块进行翻译
            all_content_blocks = []
            for result in content_results:
                all_content_blocks.extend(result.content_blocks)
            
            # 根据目标语言进行翻译
            if target_language == 'zh':
                # 翻译为中文
                translated_blocks = translator.translate(all_content_blocks, "English", "中文")
            else:
                # 翻译为其他语言（默认从中文翻译）
                translated_blocks = translator.translate(all_content_blocks, "中文", target_lang_full)
            
            # 将翻译结果更新回content_results
            block_index = 0
            for result in content_results:
                for i, block in enumerate(result.content_blocks):
                    if block_index < len(translated_blocks):
                        result.content_blocks[i] = translated_blocks[block_index]
                        block_index += 1
                        
            logger.info(f"任务 {task_id} 翻译完成，共翻译 {len(all_content_blocks)} 个内容块")
        
        # 步骤7: 文档组装
        task_status[task_id]["message"] = "组装文档"
        task_status[task_id]["progress"] = 90
        
        assembler = DocumentAssembler(debug_mode=False)
        assembled_doc = assembler.assemble(content_results, heading_result, state, include_translation, target_language, model_config)
        
        # 步骤8: 输出管理
        task_status[task_id]["message"] = "生成输出文件"
        task_status[task_id]["progress"] = 95
        
        output_manager = OutputManager(debug_mode=False)
        output_result, state = output_manager.generate_output(assembled_doc, output_config, state)
        
        # 记录生成的文件
        logger.info(f"任务 {task_id} 输出文件生成完成，输出目录: {output_dir}")
        output_files = list(Path(output_dir).rglob('*'))
        logger.info(f"任务 {task_id} 生成的文件: {[str(f) for f in output_files if f.is_file()]}")
        
        # 创建ZIP文件
        task_status[task_id]["message"] = "打包结果文件"
        task_status[task_id]["progress"] = 98
        
        # 生成ZIP文件名，反映用户选择
        original_filename = task_status[task_id]["filename"]
        base_name = os.path.splitext(original_filename)[0]
        
        # 根据翻译和输出选项添加后缀
        suffix_parts = []
        if include_translation:
            suffix_parts.append(f"translated_{target_language}")
        if table_format == "image":
            suffix_parts.append("tables_as_images")
        
        suffix = "_" + "_".join(suffix_parts) if suffix_parts else ""
        zip_filename = f"{base_name}_parsed{suffix}.zip"
        
        zip_path = create_result_zip(output_dir, task_id, zip_filename)
        
        # 完成任务
        task_status[task_id].update({
            "status": "completed",
            "progress": 100,
            "message": "PDF解析完成",
            "result_file": zip_path,
            "completed_at": datetime.now().isoformat()
        })
        
        logger.info(f"任务 {task_id} 完成")
        
    except Exception as e:
        # 任务失败
        error_msg = str(e)
        logger.error(f"任务 {task_id} 失败: {error_msg}")
        
        task_status[task_id].update({
            "status": "failed",
            "message": f"处理失败: {error_msg}",
            "error": error_msg,
            "failed_at": datetime.now().isoformat()
        })

def create_result_zip(output_dir: str, task_id: str, zip_filename: str = None) -> str:
    """创建结果ZIP文件"""
    if zip_filename is None:
        zip_filename = f"{task_id}_result.zip"
    zip_path = str(TEMP_DIR / zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        output_path = Path(output_dir)
        
        # 添加所有文件到ZIP
        for file_path in output_path.rglob('*'):
            if file_path.is_file():
                # 计算相对路径
                arcname = file_path.relative_to(output_path)
                zipf.write(file_path, arcname)
    
    return zip_path

@app.on_event("startup")
async def startup_event():
    """启动事件"""
    logger.info("PDF转Markdown服务启动")

@app.on_event("shutdown")
async def shutdown_event():
    """关闭事件"""
    logger.info("PDF转Markdown服务关闭")
    
    # 清理临时文件
    try:
        shutil.rmtree(TEMP_DIR)
    except Exception as e:
        logger.error(f"清理临时文件失败: {e}")

if __name__ == "__main__":
    print("🚀 启动PDF转Markdown服务...")
    print("📍 服务地址: http://localhost:8002")
    print("📚 API文档: http://localhost:8002/docs")
    print("🔧 用于前端PDF解析功能")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info",
        reload=False
    ) 