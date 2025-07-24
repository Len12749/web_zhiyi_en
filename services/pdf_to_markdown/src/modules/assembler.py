import time
import logging
from typing import List, Dict, Optional
import os
from datetime import datetime
import re

from ..core.data_structures import (
    ContentBlock, ContentParsingResult, HeadingLevel, 
    HeadingLevelingResult, ElementType, ProcessingState,
    AssembledDocument, ImageInfo, BoundingBox
)
from ..config.model_config import ModelConfig
from ..modules.translator import Translator
from ..utils.logger import setup_logger

class DocumentAssembler:
    """
    文档组装器
    将内容解析结果和标题分级结果组装成完整的文档
    """
    
    def __init__(self, debug_mode: bool = False):
        """
        初始化文档组装器
        
        Args:
            debug_mode: 是否启用调试模式
        """
        self.logger = setup_logger(__name__)
        self.debug_mode = debug_mode
    
    def assemble(self, 
                 content_parsing_results: List[ContentParsingResult],
                 heading_level_result: HeadingLevelingResult,
                 state: ProcessingState,
                 translation_enabled: bool = False,
                 target_language: Optional[str] = None,
                 model_config: Optional[ModelConfig] = None,
                 llm_config: Optional[Dict] = None) -> AssembledDocument:
        """
        组装文档
        
        Args:
            content_parsing_results: 内容解析结果列表
            heading_level_result: 标题分级结果
            state: 处理状态
            translation_enabled: 是否启用翻译
            target_language: 目标语言（如果启用翻译）
            model_config: 模型配置
            llm_config: LLM配置
        
        Returns:
            AssembledDocument: 组装完成的文档
        """
        start_time = time.time()
        
        print(f"步骤6/7: 文档组装 - 开始处理")
        
        # 更新处理状态
        state.current_stage = "assembly"
        
        # 获取语言信息
        detected_language = self._determine_document_language(content_parsing_results)
        
        # 按全局阅读顺序组织内容块
        ordered_blocks = self._organize_content_by_reading_order(content_parsing_results)
        
        # 提取所有图像信息
        images = self._extract_image_info(content_parsing_results)
        
        # 应用标题分级结果
        ordered_blocks = self._apply_heading_levels(ordered_blocks, heading_level_result)
        
        # 如果启用翻译，对内容进行翻译
        if translation_enabled and target_language:
            if model_config or llm_config:
                ordered_blocks = self._translate_content(
                    ordered_blocks, 
                    detected_language, 
                    target_language,
                    model_config,
                    llm_config
                )
            else:
                self.logger.warning("翻译功能已启用，但未提供模型配置")
        
        # 统计处理信息
        total_elements = sum(len(result.content_blocks) for result in content_parsing_results)
        successful_elements = sum(result.success_count for result in content_parsing_results)
        failed_elements = [element for result in content_parsing_results for element in result.failed_elements]
        
        # 创建组装文档
        assembled_document = AssembledDocument(
            detected_language=detected_language,
            total_pages=len(content_parsing_results),
            ordered_content_blocks=ordered_blocks,
            heading_levels=heading_level_result.heading_levels,
            images=images,
            translation_enabled=translation_enabled,
            target_language=target_language,
            total_elements=total_elements,
            successful_elements=successful_elements,
            failed_elements=failed_elements,
            total_processing_time=time.time() - start_time
        )
        
        # 调试模式下保存结果
        if self.debug_mode:
            self._save_debug_info(assembled_document)
        
        # 更新处理状态
        state.completed_stages.append("assembly")
        
        print(f"步骤6/7: 文档组装 - 完成，总耗时: {time.time() - start_time:.2f}秒")
        
        return assembled_document
    
    def _translate_content(self,
                         content_blocks: List[ContentBlock],
                         source_language: str,
                         target_language: str,
                         model_config: Optional[ModelConfig] = None,
                         llm_config: Optional[Dict] = None) -> List[ContentBlock]:
        """
        翻译内容块
        
        Args:
            content_blocks: 内容块列表
            source_language: 源语言
            target_language: 目标语言
            model_config: 模型配置
            llm_config: LLM配置
        
        Returns:
            List[ContentBlock]: 翻译后的内容块列表
        """
        self.logger.info(f"开始翻译内容，源语言: {source_language}，目标语言: {target_language}")
        
        try:
            # 初始化翻译器
            translator = Translator(
                model_config=model_config,
                llm_config=llm_config, 
                debug_mode=self.debug_mode
            )
            
            # 执行翻译
            translated_blocks = translator.translate_content_blocks(
                content_blocks=content_blocks,
                source_language=source_language,
                target_language=target_language
            )
            
            self.logger.info(f"翻译完成，共 {len(translated_blocks)} 个内容块")
            
            return translated_blocks
            
        except Exception as e:
            self.logger.error(f"翻译内容时出错: {str(e)}")
            # 发生错误时返回原始内容
            return content_blocks
    
    def _determine_document_language(self, content_parsing_results: List[ContentParsingResult]) -> str:
        """
        确定文档的主要语言
        
        Args:
            content_parsing_results: 内容解析结果列表
        
        Returns:
            str: 检测到的语言代码
        """
        # 简单实现：使用第一页的语言
        # 在实际应用中，可以分析所有页面的语言并选择最常见的
        if content_parsing_results and hasattr(content_parsing_results[0], 'detected_language'):
            return content_parsing_results[0].detected_language or "en"
        return "en"  # 默认英语
    
    def _organize_content_by_reading_order(self, content_parsing_results: List[ContentParsingResult]) -> List[ContentBlock]:
        """
        按全局阅读顺序组织内容块
        
        直接使用内容解析结果中的顺序，不做任何额外的排序。
        每个页面内部的内容块已经在内容解析阶段按阅读顺序排序。
        这里只按页面顺序组合它们。
        
        同时，确保图片按照元素ID排序，保持原始顺序。
        
        Args:
            content_parsing_results: 内容解析结果列表
        
        Returns:
            List[ContentBlock]: 按全局阅读顺序排列的内容块列表
        """
        # 按页面编号排序内容解析结果
        sorted_results = sorted(content_parsing_results, key=lambda x: x.page_num)
        
        # 收集所有内容块
        all_blocks = []
        for result in sorted_results:
            all_blocks.extend(result.content_blocks)
            
            # 输出调试信息
            if self.debug_mode:
                self.logger.debug(f"页面 {result.page_num} 内容块顺序:")
                for i, block in enumerate(result.content_blocks):
                    self.logger.debug(f"  {i}. {block.element_id} [{block.element_type.value}]")
        
        # 识别所有图片内容块
        image_blocks = []
        for i, block in enumerate(all_blocks):
            # 检查是否为图片内容 - 使用HTML格式检测
            is_image = block.raw_markdown and '<img src="' in block.raw_markdown and 'style="zoom:' in block.raw_markdown
            if is_image or (block.image_info is not None):
                # 保存图片块及其在原始列表中的索引
                image_blocks.append((i, block))
        
        # 如果没有图片，直接返回原始顺序
        if not image_blocks:
            return all_blocks
        
        # 按元素ID对图片进行排序 - 修复数字排序问题
        def _extract_element_numbers(element_id: str) -> tuple:
            """
            从element_id中提取页码和元素索引进行数字排序
            element_id格式: "{page_num}-{element_index}"
            """
            try:
                parts = element_id.split('-')
                if len(parts) >= 2:
                    page_num = int(parts[0])
                    element_index = int(parts[1])
                    return (page_num, element_index)
                else:
                    # 如果格式不符合预期，返回一个默认值
                    return (0, 0)
            except (ValueError, IndexError):
                # 如果无法解析，返回一个默认值
                return (0, 0)
        
        sorted_image_blocks = sorted(image_blocks, key=lambda x: _extract_element_numbers(x[1].element_id))
        
        # 创建最终结果列表
        final_blocks = all_blocks.copy()
        
        # 替换图片块，保持原始位置
        for (orig_idx, _), (_, sorted_block) in zip(image_blocks, sorted_image_blocks):
            final_blocks[orig_idx] = sorted_block
        
        return final_blocks
    
    def _extract_image_info(self, content_parsing_results: List[ContentParsingResult]) -> List[ImageInfo]:
        """
        从内容解析结果中提取所有图像信息
        
        Args:
            content_parsing_results: 内容解析结果列表
        
        Returns:
            List[ImageInfo]: 图像信息列表
        """
        images = []
        
        for result in content_parsing_results:
            for block in result.content_blocks:
                if block.image_info:  # 处理有image_info的内容块
                    # 确保图片路径使用正确的分隔符
                    if block.image_info.saved_path:
                        block.image_info.saved_path = block.image_info.saved_path.replace('\\', '/')
                        
                        # 确保路径以 "images/" 开头
                        if not block.image_info.saved_path.startswith("images/"):
                            filename = os.path.basename(block.image_info.saved_path)
                            block.image_info.saved_path = f"images/{filename}"
                
                    # 调整raw_markdown以匹配image_info中的图片路径
                    if block.raw_markdown:
                        if '<img src="' in block.raw_markdown:
                            # 更新HTML格式的图片引用
                            html_pattern = r'<img src="(.*?)"(.*?)/>'
                            match = re.search(html_pattern, block.raw_markdown)
                            if match:
                                # 保留style属性
                                attrs = match.group(2)
                                # 直接使用image_info.saved_path，不添加./前缀
                                block.raw_markdown = f'<img src="{block.image_info.saved_path}"{attrs}/>'
                        elif '![' in block.raw_markdown:
                            # 更新Markdown格式的图片引用
                            md_pattern = r'!\[(.*?)\]\((.*?)\)'
                            match = re.search(md_pattern, block.raw_markdown)
                            if match:
                                alt_text = match.group(1)
                                block.raw_markdown = f'![{alt_text}]({block.image_info.saved_path})'
                
                    # 添加到图像列表
                    images.append(block.image_info)
                elif block.raw_markdown and '<img src="' in block.raw_markdown:  # 处理没有image_info但raw_markdown中包含图片引用的内容块
                    # 从HTML图片标签中提取图片路径
                    html_pattern = r'<img src="(.*?)".*?/>'
                    match = re.search(html_pattern, block.raw_markdown)
                    if match:
                        img_path = match.group(1)
                        # 移除路径前的./符号
                        if img_path.startswith('./'):
                            img_path = img_path[2:]
                        
                        # 确保路径使用正确的分隔符
                        img_path = img_path.replace('\\', '/')
                        
                        # 确保路径以 "images/" 开头
                        if not img_path.startswith("images/"):
                            filename = os.path.basename(img_path)
                            img_path = f"images/{filename}"
                        
                        # 创建ImageInfo对象
                        image_info = ImageInfo(
                            element_id=block.element_id,
                            original_bbox=BoundingBox(x=0, y=0, width=0, height=0, page_num=0),  # 占位值
                            saved_path=img_path,
                            width=0,  # 占位值
                            height=0,  # 占位值
                            format="PNG",
                            file_size=0  # 占位值
                        )
                        
                        # 添加到图像列表
                        images.append(image_info)
                        
                        # 关联到内容块
                        block.image_info = image_info
        
        return images
    
    def _apply_heading_levels(self, 
                             content_blocks: List[ContentBlock], 
                             heading_level_result: HeadingLevelingResult) -> List[ContentBlock]:
        """
        应用标题分级结果，更新标题的Markdown格式
        
        Args:
            content_blocks: 内容块列表
            heading_level_result: 标题分级结果
        
        Returns:
            List[ContentBlock]: 更新后的内容块列表
        """
        # 创建元素ID到标题级别的映射
        heading_level_map = {level.element_id: level.semantic_level 
                            for level in heading_level_result.heading_levels}
        
        updated_blocks = []
        
        for block in content_blocks:
            # 如果是标题并且有对应的分级结果
            if block.element_type in [ElementType.DOCUMENT_TITLE, ElementType.PARAGRAPH_TITLE] and block.element_id in heading_level_map:
                semantic_level = heading_level_map[block.element_id]
                
                # 获取原始文本，移除可能存在的#前缀
                raw_text = block.raw_markdown.lstrip("#").lstrip()
                
                # 根据语义级别添加Markdown格式
                if semantic_level > 0:  # 真正的标题
                    updated_markdown = "#" * semantic_level + " " + raw_text
                    updated_element_type = block.element_type
                else:  # 0级表示非标题文本
                    updated_markdown = raw_text
                    updated_element_type = ElementType.TEXT  # 这里将类型改为普通文本
                
                # 创建更新后的内容块
                updated_block = ContentBlock(
                    element_id=block.element_id,
                    element_type=updated_element_type,
                    raw_markdown=updated_markdown,
                    trans_markdown=block.trans_markdown,
                    image_info=block.image_info,
                    confidence=block.confidence
                )
                updated_blocks.append(updated_block)
            else:
                updated_blocks.append(block)
        
        return updated_blocks
    
    def _save_debug_info(self, assembled_document: AssembledDocument):
        """
        保存调试信息
        
        Args:
            assembled_document: 组装完成的文档
        """
        try:
            debug_dir = os.path.join("data", "temp", "debug", "assembly")
            os.makedirs(debug_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = os.path.join(debug_dir, f"assembled_document_{timestamp}.md")
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"# 组装文档调试信息 {timestamp}\n\n")
                f.write(f"语言: {assembled_document.detected_language}\n")
                f.write(f"总页数: {assembled_document.total_pages}\n")
                f.write(f"总元素数: {assembled_document.total_elements}\n")
                f.write(f"成功处理元素数: {assembled_document.successful_elements}\n")
                f.write(f"失败元素数: {len(assembled_document.failed_elements)}\n")
                f.write(f"处理时间: {assembled_document.total_processing_time:.2f}秒\n\n")
                
                f.write("## 标题分级\n\n")
                for level in assembled_document.heading_levels:
                    f.write(f"- {level.element_id}: 原始级别={level.original_level}, 语义级别={level.semantic_level}, 置信度={level.confidence:.2f}\n")
                
                f.write("\n## 内容块\n\n")
                for i, block in enumerate(assembled_document.ordered_content_blocks):
                    f.write(f"### {i+1}. {block.element_id} [{block.element_type.value}]\n\n")
                    f.write(f"```markdown\n{block.raw_markdown}\n```\n\n")
                    if block.trans_markdown:
                        f.write(f"翻译:\n```markdown\n{block.trans_markdown}\n```\n\n")
                
                f.write("\n## 图像信息\n\n")
                for i, image in enumerate(assembled_document.images):
                    f.write(f"- {i+1}. {image.element_id}: {image.saved_path} ({image.width}x{image.height}, {image.format}, {image.file_size}字节)\n")
            
            self.logger.info(f"保存组装文档调试信息到: {file_path}")
        
        except Exception as e:
            self.logger.error(f"保存调试信息失败: {str(e)}") 