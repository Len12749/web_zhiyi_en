#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
模型工具模块
包含模型路径验证和配置的工具函数
"""

import os
from pathlib import Path
from typing import Optional, List


def validate_model_directory(model_dir: str, required_files: List[str]) -> bool:
    """
    验证模型目录是否包含必要的文件
    
    Args:
        model_dir: 模型目录路径
        required_files: 必需的文件列表
        
    Returns:
        bool: 目录是否有效
        
    Raises:
        FileNotFoundError: 模型目录不存在
        ValueError: 缺少必要的模型文件
    """
    if not os.path.exists(model_dir):
        raise FileNotFoundError(f"模型目录不存在: {model_dir}")
    
    missing_files = []
    for file_name in required_files:
        file_path = os.path.join(model_dir, file_name)
        if not os.path.exists(file_path):
            missing_files.append(file_name)
    
    if missing_files:
        raise ValueError(f"模型目录 {model_dir} 缺少必要文件: {missing_files}")
    
    return True


def get_model_info(model_dir: str) -> dict:
    """
    获取模型目录的基本信息
    
    Args:
        model_dir: 模型目录路径
        
    Returns:
        dict: 模型信息
    """
    if not os.path.exists(model_dir):
        return {"exists": False, "files": []}
    
    files = []
    total_size = 0
    
    for item in os.listdir(model_dir):
        item_path = os.path.join(model_dir, item)
        if os.path.isfile(item_path):
            size = os.path.getsize(item_path)
            files.append({
                "name": item,
                "size": size,
                "size_mb": round(size / (1024 * 1024), 2)
            })
            total_size += size
    
    return {
        "exists": True,
        "files": files,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "file_count": len(files)
    }


def validate_layout_model(model_dir: str) -> bool:
    """
    验证版面检测模型目录
    
    Args:
        model_dir: 版面检测模型目录路径
        
    Returns:
        bool: 模型目录是否有效
    """
    required_files = ["inference.pdiparams", "inference.json", "inference.yml"]
    return validate_model_directory(model_dir, required_files)


def validate_rotation_model(model_dir: str) -> bool:
    """
    验证旋转检测模型目录
    
    Args:
        model_dir: 旋转检测模型目录路径
        
    Returns:
        bool: 模型目录是否有效
    """
    required_files = ["inference.pdiparams", "inference.json", "inference.yml"]
    return validate_model_directory(model_dir, required_files)


def validate_order_model(model_dir: str) -> bool:
    """
    验证阅读顺序模型目录
    
    Args:
        model_dir: 阅读顺序模型目录路径
        
    Returns:
        bool: 模型目录是否有效
    """
    required_files = ["model.safetensors", "config.json", "vocab.json"]
    return validate_model_directory(model_dir, required_files)


def get_default_model_paths() -> dict:
    """
    获取默认的模型路径配置
    
    Returns:
        dict: 包含所有模型的默认路径
    """
    project_root = Path(__file__).parent.parent.parent
    models_dir = project_root / "models"
    
    return {
        "layout": str(models_dir / "layout"),
        "rotation": str(models_dir / "rotation" / "PP-LCNet_x1_0_doc_ori_infer"),
        "order": str(models_dir / "order" / "layoutlmv3_reading_order"),
        "vlm": str(models_dir / "vlm")
    }


def verify_all_models() -> dict:
    """
    验证所有本地模型是否可用
    
    Returns:
        dict: 各模型的验证结果
    """
    model_paths = get_default_model_paths()
    results = {}
    
    try:
        results["layout"] = {
            "valid": validate_layout_model(model_paths["layout"]),
            "path": model_paths["layout"]
        }
    except Exception as e:
        results["layout"] = {"valid": False, "error": str(e), "path": model_paths["layout"]}
    
    try:
        results["rotation"] = {
            "valid": validate_rotation_model(model_paths["rotation"]),
            "path": model_paths["rotation"]
        }
    except Exception as e:
        results["rotation"] = {"valid": False, "error": str(e), "path": model_paths["rotation"]}
    
    try:
        results["order"] = {
            "valid": validate_order_model(model_paths["order"]),
            "path": model_paths["order"]
        }
    except Exception as e:
        results["order"] = {"valid": False, "error": str(e), "path": model_paths["order"]}
    
    return results 