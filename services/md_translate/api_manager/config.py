#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置管理模块（简化版）

提供简化的配置加载和管理功能。
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional

# 配置文件路径
CONFIG_FILE = Path(__file__).parent / "config.json"

def load_config() -> Dict[str, Any]:
    """加载配置文件"""
    if not CONFIG_FILE.exists():
        raise FileNotFoundError(f"配置文件不存在: {CONFIG_FILE}")
    
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)
    
    return config

def save_config(config: Dict[str, Any]) -> None:
    """保存配置到文件"""
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4, ensure_ascii=False)

def get_data_dirs() -> Dict[str, Path]:
    """获取数据目录配置"""
    config = load_config()
    data_dirs = config.get("data_dirs", {})
    
    # 转换为Path对象
    return {
        key: Path(value) for key, value in data_dirs.items()
    }

def ensure_dirs_exist() -> None:
    """确保所有必要的目录存在"""
    dirs = get_data_dirs()
    for dir_path in dirs.values():
        dir_path.mkdir(parents=True, exist_ok=True)

def get_task_config(task_name: str) -> Dict[str, Any]:
    """
    获取特定任务的配置
    
    Args:
        task_name: 任务名称
    
    Returns:
        任务配置字典
    """
    config = load_config()
    tasks = config.get("tasks", {})
    
    if task_name not in tasks:
        # 如果任务不存在，返回默认配置
        return {
            "model": config.get("models", {}).get("default", "deepseek-ai/DeepSeek-V3"),
            "params": {"temperature": 0.7}
        }
    
    return tasks[task_name]

def get_model_concurrency(model_name: str) -> int:
    """
    根据模型名称返回对应的最大并发数
    
    Args:
        model_name: 模型名称
    
    Returns:
        最大并发数
    """
    # 将模型名称转换为小写进行匹配
    model_lower = model_name.lower()
    
    # Gemini模型的最大并发数为3
    if "gemini" in model_lower:
        return 3
    else:
        # 其他模型的最大并发数为25
        return 25 