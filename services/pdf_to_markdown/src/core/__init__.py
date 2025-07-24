"""
核心模块
包含数据结构和模型接口等核心组件
"""
# 导入数据结构
from .data_structures import *
# 导入模型接口
from .model_interface import *
# 导入并行处理器
from .page_processor import PageProcessor, PageProcessingError
from .parallel_processor import ParallelDocumentProcessor, PageProcessingResult 