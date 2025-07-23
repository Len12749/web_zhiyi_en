#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API管理模块 - 简化版本

此模块提供统一的API客户端和配置管理功能。
"""

from .simple_client import SimpleLLMClient, get_client, quick_chat, test_all_models
from .config import (
    load_config, 
    get_task_config, 
    get_data_dirs, 
    ensure_dirs_exist, 
    save_config
)

# 向后兼容的别名
LLMClient = SimpleLLMClient

__all__ = [
    # 客户端相关
    'SimpleLLMClient',
    'LLMClient',  # 别名
    'get_client',
    'quick_chat',
    'test_all_models',
    
    # 配置相关
    'load_config',
    'get_task_config',
    'get_data_dirs',
    'ensure_dirs_exist',
    'save_config'
] 