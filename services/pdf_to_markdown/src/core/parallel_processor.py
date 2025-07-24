"""
并行文档处理器模块
负责管理多个页面的并行处理，提升处理效率
"""

import os
import time
import logging
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass

from .data_structures import (
    PDFPage, LayoutDetectionResult, ReadingOrderResult, 
    ContentParsingResult, ProcessingState, DebugInfo
)
from .page_processor import PageProcessor, PageProcessingError
from ..modules.layout_detector import LayoutDetector
from ..modules.order_analyzer import OrderAnalyzer  
from ..modules.content_parser import ContentParser
from ..config.model_config import ModelConfig
from ..utils.logger import setup_logger
from ..utils.memory_manager import MemoryManager


@dataclass
class PageProcessingResult:
    """单页处理结果"""
    page_num: int
    layout_result: Optional[LayoutDetectionResult] = None
    order_result: Optional[ReadingOrderResult] = None
    content_result: Optional[ContentParsingResult] = None
    success: bool = False
    error_message: Optional[str] = None
    processing_time: float = 0.0


class ParallelDocumentProcessor:
    """
    并行文档处理器
    
    负责管理多个页面的并行处理，采用线程池技术提升处理效率。
    在预处理完成后，对每个页面执行版面检测→阅读顺序→内容解析的完整流水线。
    支持内存管理、进度跟踪和错误处理。
    """
    
    def __init__(
        self,
        model_config: ModelConfig,
        debug_mode: bool = False,
        max_workers: Optional[int] = None,
        log_level: int = logging.INFO
    ):
        """
        初始化并行文档处理器
        
        Args:
            model_config: 模型配置
            debug_mode: 是否启用调试模式
            max_workers: 最大并行工作线程数，默认为CPU核心数
            log_level: 日志级别
        """
        self.model_config = model_config
        self.debug_mode = debug_mode
        
        # 确保 max_workers 不为 None
        cpu_count = os.cpu_count() or 1
        self.max_workers = max_workers or min(cpu_count, 4)  # 限制最大并发数
        
        # 设置日志
        self.logger = setup_logger("ParallelDocumentProcessor", log_level)
        
        # 内存管理器
        self.memory_manager = MemoryManager()
        
        # 处理统计
        self.total_pages = 0
        self.completed_pages = 0
        self.failed_pages = 0
        
        # 线程安全锁
        self._lock = threading.Lock()
        
        self.logger.info(f"ParallelDocumentProcessor initialized with max_workers={self.max_workers}")
    
    def process_pages_parallel(
        self,
        pdf_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState
    ) -> Tuple[List[LayoutDetectionResult], List[ReadingOrderResult], List[ContentParsingResult], ProcessingState]:
        """
        智能并行处理所有页面
        
        采用自适应内存管理策略：
        1. 优先尝试并行处理
        2. 内存不足时动态调整并发数
        3. 极端情况下分批处理
        4. 确保所有页面都被处理
        
        Args:
            pdf_pages: PDF页面列表
            output_dir: 输出目录
            state: 处理状态对象
            
        Returns:
            Tuple[List[LayoutDetectionResult], List[ReadingOrderResult], List[ContentParsingResult], ProcessingState]:
                版面检测结果列表、阅读顺序结果列表、内容解析结果列表、更新后的状态
        """
        self.total_pages = len(pdf_pages)
        self.completed_pages = 0
        self.failed_pages = 0
        
        # 智能调整并行数：当页数小于配置的max_workers时，使用页数作为实际并行数
        original_max_workers = self.max_workers
        actual_max_workers = min(self.max_workers, self.total_pages)
        
        if actual_max_workers != original_max_workers:
            self.logger.info(f"根据页数({self.total_pages})调整并行数: {original_max_workers} -> {actual_max_workers}")
            self.max_workers = actual_max_workers
        
        start_time = time.time()
        self.logger.info(f"开始智能并行处理 {self.total_pages} 个页面，使用 {self.max_workers} 个工作线程")
        
        # 更新处理状态
        state.current_stage = "parallel_page_processing"
        
        # 初始化结果列表（按页面顺序）
        layout_results: List[Optional[LayoutDetectionResult]] = [None] * self.total_pages
        order_results: List[Optional[ReadingOrderResult]] = [None] * self.total_pages
        content_results: List[Optional[ContentParsingResult]] = [None] * self.total_pages
        
        # 检查初始内存状态
        initial_memory = self.memory_manager.get_memory_info()
        self.logger.info(f"初始内存状态: {initial_memory['percent']:.1f}% "
                        f"({initial_memory['used_gb']:.1f}/{initial_memory['total_gb']:.1f}GB)")
        
        try:
            # 根据内存状态选择处理策略
            if initial_memory['percent'] > 75:
                # 内存使用率已经很高，使用保守策略
                layout_results, order_results, content_results = self._process_with_conservative_strategy(
                    pdf_pages, output_dir, state
                )
            else:
                # 内存状态良好，尝试并行处理
                layout_results, order_results, content_results = self._process_with_adaptive_strategy(
                    pdf_pages, output_dir, state
                )
        
        except Exception as e:
            self.logger.error(f"智能并行处理失败，回退到串行处理: {str(e)}")
            # 最后的保险措施：串行处理确保所有页面都被处理
            layout_results, order_results, content_results = self._process_sequentially(
                pdf_pages, output_dir, state
            )
        
        finally:
            # 恢复原始max_workers值，避免影响后续处理
            self.max_workers = original_max_workers
        
        # 检查结果完整性
        self._verify_results_completeness(pdf_pages, layout_results, order_results, content_results)
        
        # 过滤None值，保持顺序
        filtered_layout_results: List[LayoutDetectionResult] = [r for r in layout_results if r is not None]
        filtered_order_results: List[ReadingOrderResult] = [r for r in order_results if r is not None]
        filtered_content_results: List[ContentParsingResult] = [r for r in content_results if r is not None]
        
        self.logger.info(f"智能并行处理完成: 成功处理 {len(filtered_layout_results)}/{self.total_pages} 页，"
                        f"耗时 {time.time() - start_time:.2f}秒")
        
        # 更新处理状态
        state.completed_stages.extend(["layout_detection", "reading_order", "content_parsing"])
        
        return filtered_layout_results, filtered_order_results, filtered_content_results, state
    
    def _create_page_processors(self) -> List[PageProcessor]:
        """
        创建页面处理器实例池
        每个处理器包含独立的模型实例，避免线程冲突
        
        Returns:
            List[PageProcessor]: 页面处理器列表
        """
        processors = []
        
        self.logger.info(f"创建 {self.max_workers} 个页面处理器实例...")
        
        for i in range(self.max_workers):
            # 为每个线程创建独立的模型实例
            layout_detector = LayoutDetector(debug_mode=self.debug_mode)
            order_analyzer = OrderAnalyzer(debug_mode=self.debug_mode)
            content_parser = ContentParser(
                model_config=self.model_config,
                debug_mode=self.debug_mode
            )
            
            page_processor = PageProcessor(
                layout_detector=layout_detector,
                order_analyzer=order_analyzer,
                content_parser=content_parser,
                debug_mode=self.debug_mode
            )
            
            processors.append(page_processor)
        
        self.logger.info(f"页面处理器实例池创建完成，共 {len(processors)} 个处理器")
        return processors
    
    def _process_single_page_with_error_handling(
        self,
        page_processor: PageProcessor,
        pdf_page: PDFPage,
        output_dir: str,
        thread_id: int
    ) -> PageProcessingResult:
        """
        带错误处理的单页面处理
        
        注意：不再在这里跳过页面，而是通过上层的智能策略确保所有页面都被处理
        
        Args:
            page_processor: 页面处理器
            pdf_page: PDF页面
            output_dir: 输出目录
            thread_id: 线程ID
            
        Returns:
            PageProcessingResult: 页面处理结果
        """
        start_time = time.time()
        
        try:
            # 记录内存状态（仅用于监控，不跳过页面）
            memory_info = self.memory_manager.get_memory_info()
            if memory_info['percent'] > 85:
                self.logger.debug(f"Thread-{thread_id}: 内存使用率较高 ({memory_info['percent']:.1f}%)，但继续处理页面 {pdf_page.page_num}")
            
            # 执行页面处理
            layout_result, order_result, content_result = page_processor.process_page(
                pdf_page=pdf_page,
                output_dir=output_dir,
                thread_id=thread_id
            )
            
            return PageProcessingResult(
                page_num=pdf_page.page_num,
                layout_result=layout_result,
                order_result=order_result,
                content_result=content_result,
                success=True,
                processing_time=time.time() - start_time
            )
            
        except PageProcessingError as e:
            self.logger.error(f"Thread-{thread_id}: 页面 {pdf_page.page_num} 处理失败: {str(e)}")
            return PageProcessingResult(
                page_num=pdf_page.page_num,
                success=False,
                error_message=str(e),
                processing_time=time.time() - start_time
            )
        
        except Exception as e:
            self.logger.error(f"Thread-{thread_id}: 页面 {pdf_page.page_num} 处理异常: {str(e)}")
            return PageProcessingResult(
                page_num=pdf_page.page_num,
                success=False,
                error_message=f"未知错误: {str(e)}",
                processing_time=time.time() - start_time
            )
        
        finally:
            # 清理内存
            self.memory_manager.cleanup_if_needed()
    
    def _process_with_conservative_strategy(
        self,
        pdf_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState
    ) -> Tuple[List[Optional[LayoutDetectionResult]], List[Optional[ReadingOrderResult]], List[Optional[ContentParsingResult]]]:
        """
        保守策略处理：内存使用率高时采用小批次分批处理
        
        Args:
            pdf_pages: PDF页面列表
            output_dir: 输出目录
            state: 处理状态
            
        Returns:
            处理结果元组
        """
        self.logger.info("采用保守策略：小批次分批处理，确保内存安全")
        
        batch_size = min(2, self.max_workers // 2)  # 更小的批次
        if batch_size < 1:
            batch_size = 1
            
        self.logger.info(f"使用批次大小: {batch_size}")
        
        return self._process_in_batches(pdf_pages, output_dir, state, batch_size)
    
    def _process_with_adaptive_strategy(
        self,
        pdf_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState
    ) -> Tuple[List[Optional[LayoutDetectionResult]], List[Optional[ReadingOrderResult]], List[Optional[ContentParsingResult]]]:
        """
        自适应策略处理：根据内存状态动态调整并发数
        
        Args:
            pdf_pages: PDF页面列表
            output_dir: 输出目录
            state: 处理状态
            
        Returns:
            处理结果元组
        """
        self.logger.info("采用自适应策略：根据内存状态动态调整处理方式")
        
        # 先尝试较大批次的并行处理
        initial_batch_size = min(self.max_workers, 6)  # 不超过6个并发
        
        try:
            return self._process_in_batches(pdf_pages, output_dir, state, initial_batch_size)
        except Exception as e:
            self.logger.warning(f"自适应策略失败，降级到保守策略: {str(e)}")
            return self._process_with_conservative_strategy(pdf_pages, output_dir, state)
    
    def _process_in_batches(
        self,
        pdf_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState,
        batch_size: int
    ) -> Tuple[List[Optional[LayoutDetectionResult]], List[Optional[ReadingOrderResult]], List[Optional[ContentParsingResult]]]:
        """
        分批处理页面
        
        Args:
            pdf_pages: PDF页面列表
            output_dir: 输出目录
            state: 处理状态
            batch_size: 批次大小
            
        Returns:
            处理结果元组
        """
        total_pages = len(pdf_pages)
        layout_results: List[Optional[LayoutDetectionResult]] = [None] * total_pages
        order_results: List[Optional[ReadingOrderResult]] = [None] * total_pages
        content_results: List[Optional[ContentParsingResult]] = [None] * total_pages
        
        # 创建页面处理器池
        page_processors = self._create_page_processors()
        
        # 分批处理
        for batch_start in range(0, total_pages, batch_size):
            batch_end = min(batch_start + batch_size, total_pages)
            batch_pages = pdf_pages[batch_start:batch_end]
            
            self.logger.info(f"处理批次 {batch_start//batch_size + 1}/{(total_pages + batch_size - 1)//batch_size}: "
                           f"页面 {batch_start + 1}-{batch_end}")
            
            # 检查内存状态
            memory_info = self.memory_manager.get_memory_info()
            if memory_info['percent'] > 90:
                self.logger.warning(f"内存使用率过高 ({memory_info['percent']:.1f}%)，强制清理内存")
                self.memory_manager.cleanup_if_needed(force=True)
                
                # 再次检查，如果还是很高，改为串行处理这个批次
                memory_info = self.memory_manager.get_memory_info()
                if memory_info['percent'] > 90:
                    self.logger.warning("内存仍然紧张，该批次改为串行处理")
                    batch_size = 1
            
            # 处理当前批次
            batch_layout, batch_order, batch_content = self._process_batch_parallel(
                batch_pages, output_dir, state, page_processors[:min(batch_size, len(page_processors))]
            )
            
            # 将结果放回对应位置
            for i, (layout, order, content) in enumerate(zip(batch_layout, batch_order, batch_content)):
                global_index = batch_start + i
                layout_results[global_index] = layout
                order_results[global_index] = order
                content_results[global_index] = content
            
            # 批次处理完成后清理内存
            self.memory_manager.cleanup_if_needed()
            
            # 更新进度
            completed = batch_end
            progress = (completed / total_pages) * 60
            state.progress_percentage = progress
            state.processed_pages = completed
            
            self.logger.info(f"批次完成，总进度: {completed}/{total_pages} ({progress:.1f}%)")
        
        return layout_results, order_results, content_results
    
    def _process_batch_parallel(
        self,
        batch_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState,
        page_processors: List[PageProcessor]
    ) -> Tuple[List[Optional[LayoutDetectionResult]], List[Optional[ReadingOrderResult]], List[Optional[ContentParsingResult]]]:
        """
        并行处理单个批次
        
        Args:
            batch_pages: 批次页面列表
            output_dir: 输出目录
            state: 处理状态
            page_processors: 页面处理器列表
            
        Returns:
            批次处理结果
        """
        batch_size = len(batch_pages)
        workers = min(len(page_processors), batch_size)
        
        layout_results: List[Optional[LayoutDetectionResult]] = [None] * batch_size
        order_results: List[Optional[ReadingOrderResult]] = [None] * batch_size
        content_results: List[Optional[ContentParsingResult]] = [None] * batch_size
        
        with ThreadPoolExecutor(max_workers=workers) as executor:
            # 提交批次任务
            future_to_page = {}
            for i, pdf_page in enumerate(batch_pages):
                page_processor = page_processors[i % len(page_processors)]
                future = executor.submit(
                    self._process_single_page_with_error_handling,
                    page_processor,
                    pdf_page,
                    output_dir,
                    i + 1  # thread_id
                )
                future_to_page[future] = (i, pdf_page)
            
            # 收集批次结果
            for future in as_completed(future_to_page):
                batch_index, pdf_page = future_to_page[future]
                
                try:
                    page_result = future.result()
                    
                    if page_result.success:
                        layout_results[batch_index] = page_result.layout_result
                        order_results[batch_index] = page_result.order_result
                        content_results[batch_index] = page_result.content_result
                        
                        with self._lock:
                            self.completed_pages += 1
                    else:
                        with self._lock:
                            self.failed_pages += 1
                        
                        self.logger.error(f"页面 {pdf_page.page_num} 处理失败: {page_result.error_message}")
                        # 失败的页面尝试重试一次
                        layout_results[batch_index], order_results[batch_index], content_results[batch_index] = \
                            self._retry_single_page(pdf_page, output_dir, page_processors[0])
                
                except Exception as e:
                    with self._lock:
                        self.failed_pages += 1
                    
                    self.logger.error(f"页面 {pdf_page.page_num} 处理异常: {str(e)}")
                    # 异常的页面也尝试重试一次
                    layout_results[batch_index], order_results[batch_index], content_results[batch_index] = \
                        self._retry_single_page(pdf_page, output_dir, page_processors[0])
        
        return layout_results, order_results, content_results
    
    def _process_sequentially(
        self,
        pdf_pages: List[PDFPage],
        output_dir: str,
        state: ProcessingState
    ) -> Tuple[List[Optional[LayoutDetectionResult]], List[Optional[ReadingOrderResult]], List[Optional[ContentParsingResult]]]:
        """
        串行处理所有页面（最后的保险措施）
        
        Args:
            pdf_pages: PDF页面列表
            output_dir: 输出目录
            state: 处理状态
            
        Returns:
            处理结果元组
        """
        self.logger.info("回退到串行处理模式，确保所有页面都被处理")
        
        total_pages = len(pdf_pages)
        layout_results: List[Optional[LayoutDetectionResult]] = [None] * total_pages
        order_results: List[Optional[ReadingOrderResult]] = [None] * total_pages
        content_results: List[Optional[ContentParsingResult]] = [None] * total_pages
        
        # 创建单个页面处理器
        page_processor = self._create_page_processors()[0]
        
        for i, pdf_page in enumerate(pdf_pages):
            self.logger.info(f"串行处理页面 {i+1}/{total_pages}")
            
            try:
                # 每次处理前清理内存
                self.memory_manager.cleanup_if_needed()
                
                # 处理单页
                layout_result, order_result, content_result = page_processor.process_page(
                    pdf_page=pdf_page,
                    output_dir=output_dir,
                    thread_id=0
                )
                
                layout_results[i] = layout_result
                order_results[i] = order_result
                content_results[i] = content_result
                
                with self._lock:
                    self.completed_pages += 1
                
                # 更新进度
                progress = ((i + 1) / total_pages) * 60
                state.progress_percentage = progress
                state.processed_pages = i + 1
                
                if (i + 1) % max(1, total_pages // 10) == 0:
                    self.logger.info(f"串行处理进度: {i+1}/{total_pages} ({progress:.1f}%)")
            
            except Exception as e:
                self.logger.error(f"串行处理页面 {pdf_page.page_num} 失败: {str(e)}")
                with self._lock:
                    self.failed_pages += 1
                # 串行处理失败时，设置为None但继续处理下一页
                layout_results[i] = None
                order_results[i] = None
                content_results[i] = None
        
        return layout_results, order_results, content_results
    
    def _retry_single_page(
        self,
        pdf_page: PDFPage,
        output_dir: str,
        page_processor: PageProcessor
    ) -> Tuple[Optional[LayoutDetectionResult], Optional[ReadingOrderResult], Optional[ContentParsingResult]]:
        """
        重试单个页面的处理
        
        Args:
            pdf_page: PDF页面
            output_dir: 输出目录
            page_processor: 页面处理器
            
        Returns:
            处理结果元组
        """
        try:
            self.logger.info(f"重试处理页面 {pdf_page.page_num}")
            
            # 强制清理内存
            self.memory_manager.cleanup_if_needed(force=True)
            
            layout_result, order_result, content_result = page_processor.process_page(
                pdf_page=pdf_page,
                output_dir=output_dir,
                thread_id=0
            )
            
            self.logger.info(f"页面 {pdf_page.page_num} 重试成功")
            return layout_result, order_result, content_result
            
        except Exception as e:
            self.logger.error(f"页面 {pdf_page.page_num} 重试仍然失败: {str(e)}")
            return None, None, None
    
    def _verify_results_completeness(
        self,
        pdf_pages: List[PDFPage],
        layout_results: List[Optional[LayoutDetectionResult]],
        order_results: List[Optional[ReadingOrderResult]],
        content_results: List[Optional[ContentParsingResult]]
    ) -> None:
        """
        验证处理结果的完整性
        
        Args:
            pdf_pages: 原始页面列表
            layout_results: 版面检测结果
            order_results: 阅读顺序结果
            content_results: 内容解析结果
        """
        total_pages = len(pdf_pages)
        successful_layout = sum(1 for r in layout_results if r is not None)
        successful_order = sum(1 for r in order_results if r is not None)
        successful_content = sum(1 for r in content_results if r is not None)
        
        self.logger.info(f"结果完整性检查:")
        self.logger.info(f"  版面检测: {successful_layout}/{total_pages} 页成功")
        self.logger.info(f"  阅读顺序: {successful_order}/{total_pages} 页成功")
        self.logger.info(f"  内容解析: {successful_content}/{total_pages} 页成功")
        
        # 检查是否有完全失败的页面
        failed_pages = []
        for i, (layout, order, content) in enumerate(zip(layout_results, order_results, content_results)):
            if layout is None or order is None or content is None:
                failed_pages.append(pdf_pages[i].page_num)
        
        if failed_pages:
            self.logger.warning(f"以下页面处理不完整: {failed_pages}")
            
            # 如果失败页面比例过高，记录警告
            failure_rate = len(failed_pages) / total_pages
            if failure_rate > 0.1:  # 超过10%失败率
                self.logger.error(f"页面处理失败率过高: {failure_rate:.1%}，请检查系统资源和配置")
        else:
            self.logger.info("✅ 所有页面都已成功处理")
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """
        获取处理统计信息
        
        Returns:
            Dict[str, Any]: 处理统计信息
        """
        with self._lock:
            return {
                "total_pages": self.total_pages,
                "completed_pages": self.completed_pages,
                "failed_pages": self.failed_pages,
                "success_rate": self.completed_pages / self.total_pages if self.total_pages > 0 else 0,
                "max_workers": self.max_workers
            } 