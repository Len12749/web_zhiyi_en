#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
日志工具模块
包含日志配置和记录的工具函数
"""

import os
import logging
import sys
from datetime import datetime
from typing import Optional

def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    设置日志记录器，防止重复添加处理器
    
    Args:
        name: 日志记录器名称
        level: 日志级别
        
    Returns:
        logging.Logger: 配置好的日志记录器
    """
    # 获取日志记录器
    logger = logging.getLogger(name)
    
    # 设置日志级别
    logger.setLevel(level)
    
    # 检查是否已有处理器，避免重复添加
    if not logger.handlers:
        # 创建控制台处理器
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    # 防止日志传播到根记录器
    logger.propagate = False
    
    return logger

def configure_root_logger(log_file: Optional[str] = None, level: int = logging.INFO):
    """
    配置根日志记录器
    
    Args:
        log_file: 日志文件路径，如果为None则只输出到控制台
        level: 日志级别
    """
    # 检查根日志记录器是否已有处理器
    if not logging.getLogger().handlers:
        # 创建日志格式
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # 创建处理器
        handlers = [logging.StreamHandler(sys.stdout)]
        
        # 如果指定了日志文件，添加文件处理器
        if log_file:
            # 检查log_file是否包含目录路径
            log_dir = os.path.dirname(log_file)
            if log_dir:  # 如果有目录路径，确保目录存在
                os.makedirs(log_dir, exist_ok=True)
        
            handlers.append(logging.FileHandler(log_file, mode='a'))
        
        # 配置根日志记录器
        logging.basicConfig(
            level=level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=handlers
        )

# 这里将实现日志相关的工具函数 