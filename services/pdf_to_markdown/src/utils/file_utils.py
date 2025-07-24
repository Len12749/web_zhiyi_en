#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
文件操作工具模块
包含文件读写、目录管理等工具函数
"""

import os
import shutil
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

# 这里将实现文件操作相关的工具函数

def ensure_directory(directory: str) -> str:
    """
    确保目录存在，如果不存在则创建
    Args:
        directory: 目录路径
    Returns:
        创建的目录路径
    """
    os.makedirs(directory, exist_ok=True)
    return directory

def get_file_extension(file_path: str) -> str:
    """
    获取文件扩展名
    Args:
        file_path: 文件路径
    Returns:
        文件扩展名（小写，不包含点号）
    """
    return os.path.splitext(file_path)[1].lower()[1:]

def is_pdf_file(file_path: str) -> bool:
    """
    检查文件是否为PDF文件
    Args:
        file_path: 文件路径
    Returns:
        是否为PDF文件
    """
    return get_file_extension(file_path) == "pdf"

def list_files(directory: str, extension: Optional[str] = None) -> List[str]:
    """
    列出目录中的文件
    Args:
        directory: 目录路径
        extension: 文件扩展名过滤（不包含点号，如"pdf"）
    Returns:
        文件路径列表
    """
    if not os.path.exists(directory):
        return []
    
    files = []
    for file in os.listdir(directory):
        file_path = os.path.join(directory, file)
        if os.path.isfile(file_path):
            if extension is None or get_file_extension(file_path) == extension.lower():
                files.append(file_path)
    
    return files

def save_json(data: Union[Dict, List], file_path: str) -> str:
    """
    保存JSON数据到文件
    Args:
        data: 要保存的数据
        file_path: 输出文件路径
    Returns:
        保存的文件路径
    """
    # 确保输出目录存在
    output_dir = os.path.dirname(file_path)
    ensure_directory(output_dir)
    
    # 保存JSON数据
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return file_path

def load_json(file_path: str) -> Union[Dict, List]:
    """
    从文件加载JSON数据
    Args:
        file_path: 文件路径
    Returns:
        加载的数据
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_text(text: str, file_path: str) -> str:
    """
    保存文本到文件
    Args:
        text: 要保存的文本
        file_path: 输出文件路径
    Returns:
        保存的文件路径
    """
    # 确保输出目录存在
    output_dir = os.path.dirname(file_path)
    ensure_directory(output_dir)
    
    # 保存文本
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
    
    return file_path

def load_text(file_path: str) -> str:
    """
    从文件加载文本
    Args:
        file_path: 文件路径
    Returns:
        加载的文本
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def copy_file(source_path: str, target_path: str, overwrite: bool = True) -> str:
    """
    复制文件
    Args:
        source_path: 源文件路径
        target_path: 目标文件路径
        overwrite: 是否覆盖已存在的文件
    Returns:
        目标文件路径
    """
    # 确保源文件存在
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"源文件不存在: {source_path}")
    
    # 确保目标目录存在
    target_dir = os.path.dirname(target_path)
    ensure_directory(target_dir)
    
    # 如果目标文件已存在且不覆盖，则返回
    if os.path.exists(target_path) and not overwrite:
        return target_path
    
    # 复制文件
    shutil.copy2(source_path, target_path)
    
    return target_path 