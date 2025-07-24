#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PDF到Markdown转换工具
主入口文件

本工具可将PDF文件转换为Markdown格式。
主要功能包括：
1. PDF预处理和页面提取
2. 版面检测和元素识别
3. 阅读顺序分析
4. 内容解析（使用AI模型）
5. 标题分级
6. 文档组装
7. 输出Markdown文件
"""

import os
import sys
import argparse
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

# 导入日志配置
from src.utils.logger import setup_logger

# 设置日志
logger = setup_logger(__name__)

# 导入核心模块
from src.core.data_structures import ProcessingState, OutputConfiguration
from src.config.model_config import ModelConfig, ModelType, load_model_config_from_file
from src.modules import (
    PDFPreprocessor, LayoutDetector, OrderAnalyzer, ContentParser,
    HeadingLevelAnalyzer, DocumentAssembler, OutputManager, Translator
)
from src.utils.file_utils import is_pdf_file, get_file_extension

def parse_arguments():
    """
    解析命令行参数
    
    Returns:
        argparse.Namespace: 解析后的命令行参数
    """
    parser = argparse.ArgumentParser(description="PDF到Markdown转换工具")
    
    # 输入输出参数
    parser.add_argument("pdf_path", help="PDF文件路径")
    parser.add_argument("--output_dir", help="输出目录", default=None)
    
    # 功能参数
    parser.add_argument("--debug", help="启用调试模式", action="store_true")
    parser.add_argument("--use_gpu", help="使用GPU", action="store_true")
    parser.add_argument("--translate", help="启用翻译功能", action="store_true")
    parser.add_argument("--target-language", type=str, default="zh-CN", help="目标语言代码")
    parser.add_argument("--no-rotation-detection", help="禁用旋转检测", action="store_false", dest="rotation_detection")
    parser.set_defaults(rotation_detection=True)  # 默认启用旋转检测
    parser.add_argument("--tables-as-images", help="将表格作为图像输出，而不是Markdown格式", action="store_true")
    
    # 模型配置参数
    parser.add_argument("--model-config", help="模型配置文件路径", default="src/config/model_config.json")
    parser.add_argument("--layout-model", help="版面检测模型类型", 
                        choices=[m.value for m in ModelType], default=None)
    parser.add_argument("--content-model", help="内容解析模型类型", 
                        choices=[m.value for m in ModelType], default=None)
    parser.add_argument("--heading-model", help="标题分级模型类型", 
                        choices=[m.value for m in ModelType], default=None)
    parser.add_argument("--translation-model", help="翻译模型类型", 
                        choices=[m.value for m in ModelType], default=None)
    
    # API密钥参数
    parser.add_argument("--openai-api-key", help="OpenAI API密钥")
    parser.add_argument("--azure-api-key", help="Azure API密钥")
    parser.add_argument("--azure-endpoint", help="Azure API端点")
    parser.add_argument("--anthropic-api-key", help="Anthropic API密钥")
    
    return parser.parse_args()

def main():
    """
    主函数，实现完整的PDF处理流程
    
    Returns:
        int: 执行结果状态码，0表示成功，1表示失败
    """
    # 解析命令行参数
    args = parse_arguments()
    
    # 检查文件是否存在
    pdf_path = args.pdf_path
    if not os.path.exists(pdf_path):
        print(f"错误: 文件 '{pdf_path}' 不存在")
        return 1
    
    # 检查文件扩展名
    if not is_pdf_file(pdf_path):
        print(f"错误: 文件 '{pdf_path}' 不是PDF文件")
        return 1
    
    # 设置输出目录
    if args.output_dir is None:
        output_dir = os.path.join("File", "pdf_to_markdown")
    else:
        output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)
    
    # 创建调试输出目录
    if args.debug:
        debug_output_dir = os.path.join(output_dir, "debug")
        os.makedirs(os.path.join(debug_output_dir, "layout"), exist_ok=True)
        os.makedirs(os.path.join(debug_output_dir, "order"), exist_ok=True)
        os.makedirs(os.path.join(debug_output_dir, "content"), exist_ok=True)
    
    # 加载模型配置
    model_config = load_model_config_from_file(args.model_config)
    
    # 如果命令行指定了模型类型，则覆盖配置文件中的设置
    if args.layout_model:
        model_config.layout_model_type = ModelType(args.layout_model)
    if args.content_model:
        model_config.content_model_type = ModelType(args.content_model)
    if args.heading_model:
        model_config.heading_model_type = ModelType(args.heading_model)
    if args.translation_model:
        model_config.translation_model_type = ModelType(args.translation_model)
    
    # 命令行API密钥参数已废弃，现在使用固定的Docker AI服务配置
    if args.openai_api_key or args.azure_api_key or args.anthropic_api_key:
        logger.warning("命令行API密钥参数已废弃，将使用Docker AI服务的固定配置")
    
    # 配置对象直接使用，不再需要特殊的API密钥管理
    mllm_config = model_config
    llm_config = model_config
    
    # 初始化处理状态
    state = ProcessingState(
        pdf_path=pdf_path,
        current_stage="preprocessing",
        debug_enabled=args.debug
    )
    
    # 创建输出配置
    output_config = OutputConfiguration(
        output_dir=output_dir,
        base_filename=os.path.splitext(os.path.basename(pdf_path))[0],
        include_translation=args.translate,
        target_language=args.target_language,
        table_as_image=args.tables_as_images,
        debug_mode=args.debug
    )
    
    try:
        # 开始处理
        start_time = time.time()
        
        # 步骤1: 预处理
        preprocessor = PDFPreprocessor(model_config, debug_mode=args.debug)
        pdf_pages, state = preprocessor.process_pdf(pdf_path)
        
        # 步骤2: 版面检测
        layout_detector = LayoutDetector(model_config, debug_mode=args.debug)
        layout_results, state = layout_detector.detect_layout(pdf_pages, output_dir, state)
        
        # 步骤3: 阅读顺序分析
        order_analyzer = OrderAnalyzer(model_config, debug_mode=args.debug)
        order_results, state = order_analyzer.analyze_reading_order(layout_results, output_dir, state)
        
        # 步骤4: 内容解析
        content_parser = ContentParser(model_config, debug_mode=args.debug, table_as_image=args.tables_as_images)
        content_results, state = content_parser.parse_document(pdf_pages, layout_results, order_results, output_dir, state)
        
        # 步骤5: 标题分级
        heading_analyzer = HeadingLevelAnalyzer(model_config, debug_mode=args.debug)
        heading_result, state = heading_analyzer.analyze_heading_levels(content_results, output_dir, state)
        
        # 步骤6: 翻译（如果启用）
        if args.translate:
            translator = Translator(model_config, debug_mode=args.debug)
            content_results, state = translator.translate_document(content_results, args.target_language, output_dir, state)
        
        # 步骤7: 文档组装
        assembler = DocumentAssembler(debug_mode=args.debug)
        assembled_doc, state = assembler.assemble_document(content_results, heading_result, output_dir, state)
        
        # 步骤8: 输出管理
        output_manager = OutputManager(debug_mode=args.debug)
        output_result, state = output_manager.generate_output(assembled_doc, output_config, state)
        
        # 输出结果
        total_time = time.time() - start_time
        
        print(f"\n✅ PDF处理完成！")
        print(f"⏱️  总耗时: {total_time:.2f}秒")
        print(f"📁 输出目录: {output_result.output_directory}")
        print(f"📄 生成文件: {len(output_result.output_files)}个")
        
        # 显示生成的文件
        for output_file in output_result.output_files:
            print(f"   - {output_file.file_path} ({output_file.size_bytes} 字节)")
        
        if output_result.warnings:
            print(f"⚠️  警告: {len(output_result.warnings)}个")
            for warning in output_result.warnings:
                print(f"   - {warning}")
        
        if output_result.errors:
            print(f"❌ 错误: {len(output_result.errors)}个")
            for error in output_result.errors:
                print(f"   - {error}")
        
        return 0
        
    except Exception as e:
        logger.error(f"处理过程中发生错误: {str(e)}")
        print(f"❌ 处理失败: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 