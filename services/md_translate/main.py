#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown翻译工具 - 主入口文件（简化版）

此脚本提供一个简化的命令行界面，仅支持API管理和Markdown翻译功能。
"""

import argparse
import sys
import os
from pathlib import Path
import asyncio

# 导入必需模块
from api_manager.config import (
    load_config, get_data_dirs, ensure_dirs_exist, 
    save_config, get_task_config
)
from api_manager import test_all_models

def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="Markdown翻译工具")
    
    # 子命令
    subparsers = parser.add_subparsers(dest="command", help="命令")
    
    # 翻译命令
    translate = subparsers.add_parser("translate", help="翻译Markdown文件")
    translate.add_argument("input", help="输入Markdown文件或目录")
    translate.add_argument("--output", "-o", help="输出目录，默认为File/outputmd", default="File/outputmd")
    translate.add_argument("--model", help="使用的模型名称")
    translate.add_argument("--concurrency", "-c", type=int, default=1, help="并发翻译的文件数量")
    translate.add_argument("--task", "-t", help="使用的任务配置名称", default="document_translation")
    
    # 配置命令
    config = subparsers.add_parser("config", help="配置管理")
    config.add_argument("--add-key", help="添加API密钥")
    config.add_argument("--pool", help="指定API池名称", default="default_pool")
    config.add_argument("--list", "-l", action="store_true", help="列出所有API池和密钥")
    config.add_argument("--set-url", help="设置API基础URL")
    
    return parser.parse_args()

async def translate_files(input_files, output_dir, task_name="document_translation", model=None, concurrency=1):
    """
    翻译Markdown文件（使用简化的翻译模块）
    
    Args:
        input_files: 输入文件列表
        output_dir: 输出目录
        task_name: 任务名称，用于获取配置
        model: 使用的模型
        concurrency: 并发翻译的文件数量
    """
    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 导入翻译模块
    from markdown_translator.translator import translate_document
    from markdown_translator.chunk_splitter import optimize_text
    
    # 确保工作目录存在
    ensure_dirs_exist()
    
    # 获取任务配置
    task_config = get_task_config(task_name)
    
    print(f"开始翻译 {len(input_files)} 个文件...")
    
    # 处理每个文件
    for i, input_file in enumerate(input_files):
        print(f"正在翻译文件 {i+1}/{len(input_files)}: {input_file.name}")
        
        try:
            # 读取文件内容
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 智能分块
            print(f"  分块处理中...")
            chunks = await optimize_text(content)
            
            # 翻译
            print(f"  翻译处理中...")
            translated_markdown = await translate_document(chunks)
            
            # 保存结果
            output_file = output_path / f"translated_{input_file.name}"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(translated_markdown)
            
            print(f"  ✅ 完成：{output_file}")
            
        except Exception as e:
            print(f"  ❌ 翻译失败：{str(e)}")
            continue
    
    print(f"完成! 已翻译 {len(input_files)} 个文件到 {output_dir}")

def manage_config(args):
    """
    管理配置
    
    Args:
        args: 命令行参数
    """
    if args.add_key:
        print("简化版本暂不支持添加API密钥，请直接修改 api_manager/config.json 文件")
    
    if args.list:
        # 列出配置信息
        config = load_config()
        
        # 显示API配置
        api_config = config.get("api", {})
        print("API配置:")
        print(f"  基础URL: {api_config.get('base_url', 'http://localhost:4000/v1')}")
        print(f"  API密钥: {api_config.get('api_key', 'sk-litellm-master-key-2024')}")
        print(f"  超时时间: {api_config.get('timeout', 300)}秒")
        
        # 显示模型配置
        models = config.get("models", {})
        if models:
            print("\n支持的模型:")
            for model_type, model_name in models.items():
                print(f"  {model_type}: {model_name}")
        
        # 显示任务配置
        tasks = config.get("tasks", {})
        if tasks:
            print("\n任务配置:")
            for task_name, task_config in tasks.items():
                print(f"\n任务名称: {task_name}")
                print(f"  模型: {task_config.get('model', 'None')}")
                print("  参数:")
                for param, value in task_config.get('params', {}).items():
                    print(f"    {param}: {value}")
    
    if args.set_url:
        print("简化版本暂不支持设置URL，请直接修改 api_manager/config.json 文件")

async def main():
    """主函数"""
    # 确保目录存在
    ensure_dirs_exist()
    
    # 解析命令行参数
    args = parse_arguments()
    
    if args.command == "translate":
        # 翻译Markdown
        input_path = Path(args.input)
        if input_path.is_file():
            await translate_files([input_path], args.output, args.task, args.model, args.concurrency)
        else:
            # 如果是目录，获取所有md文件
            input_files = list(input_path.glob("**/*.md"))
            await translate_files(input_files, args.output, args.task, args.model, args.concurrency)
    elif args.command == "config":
        # 管理配置
        manage_config(args)
    else:
        print("请指定命令。使用 -h 或 --help 查看帮助。")
        sys.exit(1)

if __name__ == "__main__":
    # 运行主函数
    asyncio.run(main()) 