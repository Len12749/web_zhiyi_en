#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
内存管理器模块
负责监控内存使用情况，确保并行处理不会导致内存溢出
"""

import gc
import os
import psutil
import logging
from typing import Dict, Optional
from threading import Lock

from .logger import setup_logger


class MemoryManager:
    """
    内存管理器
    
    监控系统内存使用情况，提供内存清理和检查功能。
    在并行处理过程中确保内存使用在安全范围内。
    """
    
    def __init__(self, warning_threshold: float = 80.0, critical_threshold: float = 90.0):
        """
        初始化内存管理器
        
        Args:
            warning_threshold: 内存使用警告阈值（百分比）
            critical_threshold: 内存使用危险阈值（百分比）
        """
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold
        self.logger = setup_logger("MemoryManager")
        self._lock = Lock()
        
        # 记录初始内存状态
        self.initial_memory = psutil.virtual_memory()
        self.logger.info(f"MemoryManager initialized - Total: {self.initial_memory.total / (1024**3):.1f}GB, "
                        f"Warning: {warning_threshold}%, Critical: {critical_threshold}%")
    
    def get_memory_info(self) -> Dict[str, float]:
        """
        获取当前内存信息
        
        Returns:
            Dict[str, float]: 内存信息字典
        """
        memory = psutil.virtual_memory()
        return {
            "total_gb": memory.total / (1024**3),
            "available_gb": memory.available / (1024**3),
            "used_gb": memory.used / (1024**3),
            "percent": memory.percent,
            "free_gb": memory.free / (1024**3)
        }
    
    def check_memory_available(self, required_mb: Optional[float] = None) -> bool:
        """
        检查内存是否可用
        
        Args:
            required_mb: 需要的内存大小（MB），如果为None则只检查百分比阈值
            
        Returns:
            bool: 内存是否足够使用
        """
        memory = psutil.virtual_memory()
        
        # 检查百分比阈值
        if memory.percent >= self.critical_threshold:
            self.logger.warning(f"内存使用率达到危险水平: {memory.percent:.1f}%")
            return False
        
        # 检查具体需求
        if required_mb is not None:
            available_mb = memory.available / (1024**2)
            if available_mb < required_mb:
                self.logger.warning(f"可用内存不足: 需要 {required_mb:.1f}MB，可用 {available_mb:.1f}MB")
                return False
        
        # 发出警告
        if memory.percent >= self.warning_threshold:
            self.logger.warning(f"内存使用率较高: {memory.percent:.1f}%")
        
        return True
    
    def cleanup_if_needed(self, force: bool = False) -> bool:
        """
        在需要时清理内存
        
        Args:
            force: 是否强制清理
            
        Returns:
            bool: 是否执行了清理
        """
        with self._lock:
            memory = psutil.virtual_memory()
            
            # 判断是否需要清理
            needs_cleanup = force or memory.percent >= self.warning_threshold
            
            if needs_cleanup:
                self.logger.info(f"执行内存清理 - 当前使用率: {memory.percent:.1f}%")
                
                # 强制垃圾回收
                collected = gc.collect()
                
                # 获取清理后的内存状态
                new_memory = psutil.virtual_memory()
                freed_mb = (memory.used - new_memory.used) / (1024**2)
                
                self.logger.info(f"内存清理完成 - 回收对象: {collected}, "
                               f"释放内存: {freed_mb:.1f}MB, "
                               f"当前使用率: {new_memory.percent:.1f}%")
                
                return True
            
            return False
    
    def get_process_memory_info(self) -> Dict[str, float]:
        """
        获取当前进程的内存信息
        
        Returns:
            Dict[str, float]: 进程内存信息
        """
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        return {
            "rss_mb": memory_info.rss / (1024**2),  # 物理内存
            "vms_mb": memory_info.vms / (1024**2),  # 虚拟内存
            "percent": process.memory_percent(),     # 占总内存百分比
            "num_threads": process.num_threads()     # 线程数
        }
    
    def log_memory_status(self, prefix: str = ""):
        """
        记录当前内存状态到日志
        
        Args:
            prefix: 日志前缀
        """
        system_memory = self.get_memory_info()
        process_memory = self.get_process_memory_info()
        
        self.logger.info(f"{prefix}内存状态 - "
                        f"系统: {system_memory['percent']:.1f}% "
                        f"({system_memory['used_gb']:.1f}/{system_memory['total_gb']:.1f}GB), "
                        f"进程: {process_memory['rss_mb']:.1f}MB "
                        f"({process_memory['percent']:.1f}%), "
                        f"线程数: {process_memory['num_threads']}")
    
    def estimate_page_memory_usage(self, page_width: int, page_height: int, dpi: int = 300) -> float:
        """
        估算单页处理所需内存
        
        Args:
            page_width: 页面宽度（像素）
            page_height: 页面高度（像素）
            dpi: 分辨率
            
        Returns:
            float: 估算内存使用量（MB）
        """
        # 估算图像内存使用：宽 × 高 × 3通道 × 字节
        image_memory = page_width * page_height * 3
        
        # 考虑处理过程中的临时内存（约3倍）
        processing_memory = image_memory * 3
        
        # 转换为MB并加上模型推理内存开销（约100MB）
        total_mb = (processing_memory / (1024**2)) + 100
        
        return total_mb 