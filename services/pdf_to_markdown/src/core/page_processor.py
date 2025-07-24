"""
页面处理器模块
负责单个页面的完整处理流水线：版面检测 → 阅读顺序 → 内容解析
"""

import time
import logging
from typing import Tuple, Optional
from pathlib import Path

from .data_structures import (
    PDFPage, LayoutDetectionResult, ReadingOrderResult, 
    ContentParsingResult, ProcessingState, DebugInfo
)
from ..modules.layout_detector import LayoutDetector
from ..modules.order_analyzer import OrderAnalyzer  
from ..modules.content_parser import ContentParser
from ..config.model_config import ModelConfig
from ..utils.logger import setup_logger


class PageProcessingError(Exception):
    """页面处理过程中的错误"""
    pass


class PageProcessor:
    """
    页面处理器
    
    负责单个页面的完整处理流水线，包括：
    1. 版面检测：识别页面中的各类元素
    2. 阅读顺序：确定元素的阅读顺序
    3. 内容解析：将元素转换为Markdown内容
    
    设计为线程安全，支持并行处理多个页面。
    """
    
    def __init__(
        self,
        layout_detector: LayoutDetector,
        order_analyzer: OrderAnalyzer,
        content_parser: ContentParser,
        debug_mode: bool = False,
        log_level: int = logging.INFO
    ):
        """
        初始化页面处理器
        
        Args:
            layout_detector: 版面检测器实例
            order_analyzer: 阅读顺序分析器实例  
            content_parser: 内容解析器实例
            debug_mode: 是否启用调试模式
            log_level: 日志级别
        """
        self.layout_detector = layout_detector
        self.order_analyzer = order_analyzer
        self.content_parser = content_parser
        self.debug_mode = debug_mode
        
        # 设置日志
        self.logger = setup_logger(f"PageProcessor", log_level)
        
        self.logger.info("PageProcessor initialized for parallel page processing")
    
    def process_page(
        self,
        pdf_page: PDFPage,
        output_dir: str,
        thread_id: Optional[int] = None
    ) -> Tuple[LayoutDetectionResult, ReadingOrderResult, ContentParsingResult]:
        """
        处理单个页面的完整流水线
        
        Args:
            pdf_page: PDF页面对象
            output_dir: 输出目录
            thread_id: 线程ID（用于日志标识）
            
        Returns:
            Tuple[LayoutDetectionResult, ReadingOrderResult, ContentParsingResult]: 
                版面检测结果、阅读顺序结果、内容解析结果
                
        Raises:
            PageProcessingError: 当页面处理失败时抛出
        """
        page_num = pdf_page.page_num
        thread_prefix = f"[Thread-{thread_id}] " if thread_id is not None else ""
        
        try:
            start_time = time.time()
            self.logger.info(f"{thread_prefix}开始处理页面 {page_num}")
            
            # 步骤1: 版面检测
            layout_start_time = time.time()
            layout_result = self._detect_layout(pdf_page, thread_prefix)
            layout_time = time.time() - layout_start_time
            
            self.logger.debug(f"{thread_prefix}页面 {page_num} 版面检测完成，耗时 {layout_time:.2f}秒，检测到 {len(layout_result.elements)} 个元素")
            
            # 步骤2: 阅读顺序分析
            order_start_time = time.time()
            order_result = self._analyze_reading_order(layout_result, thread_prefix)
            order_time = time.time() - order_start_time
            
            self.logger.debug(f"{thread_prefix}页面 {page_num} 阅读顺序分析完成，耗时 {order_time:.2f}秒")
            
            # 步骤3: 内容解析
            content_start_time = time.time()
            content_result = self._parse_content(pdf_page, layout_result, order_result, output_dir, thread_prefix)
            content_time = time.time() - content_start_time
            
            self.logger.debug(f"{thread_prefix}页面 {page_num} 内容解析完成，耗时 {content_time:.2f}秒，成功解析 {content_result.success_count} 个元素")
            
            total_time = time.time() - start_time
            self.logger.info(f"{thread_prefix}页面 {page_num} 处理完成，总耗时 {total_time:.2f}秒")
            
            return layout_result, order_result, content_result
            
        except Exception as e:
            error_msg = f"{thread_prefix}页面 {page_num} 处理失败: {str(e)}"
            self.logger.error(error_msg)
            raise PageProcessingError(error_msg) from e
    
    def _detect_layout(self, pdf_page: PDFPage, thread_prefix: str = "") -> LayoutDetectionResult:
        """
        执行版面检测
        
        Args:
            pdf_page: PDF页面对象
            thread_prefix: 线程前缀（用于日志）
            
        Returns:
            LayoutDetectionResult: 版面检测结果
        """
        try:
            # 创建临时状态对象（用于单页处理）
            temp_state = ProcessingState(
                pdf_path="",
                current_stage="layout_detection",
                completed_stages=[],
                total_pages=1,
                debug_enabled=self.debug_mode
            )
            
            # 调用版面检测器的单页检测方法
            layout_results, _ = self.layout_detector.detect_layout([pdf_page], temp_state)
            
            if not layout_results:
                raise PageProcessingError(f"版面检测返回空结果")
                
            return layout_results[0]
            
        except Exception as e:
            raise PageProcessingError(f"版面检测失败: {str(e)}") from e
    
    def _analyze_reading_order(self, layout_result: LayoutDetectionResult, thread_prefix: str = "") -> ReadingOrderResult:
        """
        执行阅读顺序分析
        
        Args:
            layout_result: 版面检测结果
            thread_prefix: 线程前缀（用于日志）
            
        Returns:
            ReadingOrderResult: 阅读顺序结果
        """
        try:
            # 调用阅读顺序分析器的单页分析方法
            order_result = self.order_analyzer.analyze_page_order(layout_result)
            return order_result
            
        except Exception as e:
            raise PageProcessingError(f"阅读顺序分析失败: {str(e)}") from e
    
    def _parse_content(
        self,
        pdf_page: PDFPage,
        layout_result: LayoutDetectionResult,
        order_result: ReadingOrderResult,
        output_dir: str,
        thread_prefix: str = ""
    ) -> ContentParsingResult:
        """
        执行内容解析
        
        Args:
            pdf_page: PDF页面对象
            layout_result: 版面检测结果
            order_result: 阅读顺序结果
            output_dir: 输出目录
            thread_prefix: 线程前缀（用于日志）
            
        Returns:
            ContentParsingResult: 内容解析结果
        """
        try:
            # 调用内容解析器的单页解析方法
            content_result = self.content_parser.parse_page(
                page=pdf_page,
                layout_result=layout_result,
                reading_order_result=order_result,
                output_dir=output_dir
            )
            return content_result
            
        except Exception as e:
            raise PageProcessingError(f"内容解析失败: {str(e)}") from e 