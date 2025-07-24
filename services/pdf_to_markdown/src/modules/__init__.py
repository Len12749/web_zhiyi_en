"""
模块包，包含PDF解析和处理的所有模块组件
"""

from .preprocessor import PDFPreprocessor  # PDF预处理模块
from .layout_detector import LayoutDetector  # 版面检测模块
from .order_analyzer import OrderAnalyzer  # 阅读顺序分析模块
from .content_parser import ContentParser  # 内容解析模块
from .heading_levels import HeadingLevelAnalyzer  # 标题分级模块
from .assembler import DocumentAssembler  # 文档组装模块
from .output_manager import OutputManager  # 输出管理模块
from .translator import Translator  # 翻译模块
from .rotation_detector import RotationDetector  # 旋转检测模块 