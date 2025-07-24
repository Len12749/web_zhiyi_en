import os
import time
import logging
import shutil
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import subprocess
import tempfile
from pathlib import Path
from enum import Enum
import re

from ..core.data_structures import (
    AssembledDocument, OutputResult, OutputFile, OutputConfiguration,
    ProcessingState, ElementType, ContentBlock
)
from ..utils.logger import setup_logger

class OutputManager:
    """
    输出管理器
    负责将组装好的文档输出为Markdown文件
    """
    
    def __init__(self, output_dir: str = "File/pdf_to_markdown", debug_mode: bool = False):
        """
        初始化输出管理器
        
        Args:
            output_dir: 输出目录路径
            debug_mode: 是否启用调试模式
        """
        self.logger = setup_logger(__name__)
        self.output_dir = output_dir
        self.debug_mode = debug_mode
    
    def generate_output(self, 
                        assembled_document: AssembledDocument, 
                        config: OutputConfiguration,
                        state: ProcessingState) -> Tuple[OutputResult, ProcessingState]:
        """
        生成输出文件
        
        Args:
            assembled_document: 组装好的文档
            config: 输出配置
            state: 处理状态
        
        Returns:
            Tuple[OutputResult, ProcessingState]: 输出结果和更新后的状态
        """
        start_time = time.time()
        
        print(f"步骤8/8: 输出管理 - 开始处理")
        
        # 更新处理状态
        state.current_stage = "output_generation"
        
        # 准备输出目录
        output_dir, image_dir, debug_dir = self._prepare_output_directories(config.output_dir, config.debug_mode)
        
        # 复制图像文件到输出目录
        image_paths = self._process_images(assembled_document, image_dir)
        
        # 生成文档文件
        output_files = []
        errors = []
        warnings = []
        
        try:
            # 原文Markdown (仅在不是只要译文时生成)
            if not config.translated_only:
                original_path = os.path.join(output_dir, f"{config.base_filename}.md")
                original_content = self._generate_markdown(assembled_document, False)
                original_size = self._save_file(original_path, original_content)
                
                output_files.append(OutputFile(
                    file_type="markdown",
                    file_path=original_path,
                    size_bytes=original_size,
                    created_at=datetime.now()
                ))
            
            # 如果启用翻译
            if config.include_translation and assembled_document.translation_enabled:
                # 译文Markdown (仅在只要译文或不要双语时生成单独译文)
                if config.translated_only or not config.bilingual_output:
                    translated_path = os.path.join(output_dir, f"{config.base_filename}-translated.md")
                    translated_content = self._generate_markdown(assembled_document, True)
                    translated_size = self._save_file(translated_path, translated_content)
                    
                    output_files.append(OutputFile(
                        file_type="translated",
                        file_path=translated_path,
                        size_bytes=translated_size,
                        created_at=datetime.now()
                    ))
                
                # 双语对照 (仅在用户选择双语时生成)
                if config.bilingual_output:
                    combined_path = os.path.join(output_dir, f"{config.base_filename}-bilingual.md")
                    combined_content = self._generate_combined_markdown(assembled_document)
                    combined_size = self._save_file(combined_path, combined_content)
                    
                    output_files.append(OutputFile(
                        file_type="bilingual",
                        file_path=combined_path,
                        size_bytes=combined_size,
                        created_at=datetime.now()
                    ))
            elif config.include_translation and not assembled_document.translation_enabled:
                warnings.append("请求包含翻译，但文档未启用翻译功能")
            
            # 生成调试信息（如果启用）
            if config.debug_mode and debug_dir:
                self._generate_debug_files(assembled_document, debug_dir)
        
        except Exception as e:
            error_msg = f"生成输出文件时出错: {str(e)}"
            self.logger.error(error_msg)
            errors.append(error_msg)
        
        # 创建输出结果
        result = OutputResult(
            output_files=output_files,
            image_paths=image_paths,
            processing_time=time.time() - start_time,
            errors=errors,
            warnings=warnings,
            output_directory=output_dir
        )
        
        # 更新处理状态
        state.completed_stages.append("output_generation")
        state.progress_percentage = 100.0
        
        print(f"步骤8/8: 输出管理 - 完成，生成了 {len(output_files)} 个文件")
        
        return result, state
    
    def _prepare_output_directories(self, output_dir: str, debug_mode: bool = False) -> Tuple[str, str, Optional[str]]:
        """
        准备输出目录结构
        
        Args:
            output_dir: 输出目录路径
            debug_mode: 是否启用调试模式
        
        Returns:
            Tuple[str, str, Optional[str]]: (输出目录, 图像目录, 调试目录)
        """
        # 创建主输出目录
        os.makedirs(output_dir, exist_ok=True)
        
        # 创建图像目录
        image_dir = os.path.join(output_dir, "images")
        os.makedirs(image_dir, exist_ok=True)
        
        # 创建调试目录（如果启用）
        debug_dir = None
        if debug_mode:
            debug_dir = os.path.join(output_dir, "debug")
            os.makedirs(debug_dir, exist_ok=True)
        
        return output_dir, image_dir, debug_dir
    
    def _process_images(self, assembled_document: AssembledDocument, image_dir: str) -> List[str]:
        """
        处理图像文件，复制到输出目录
        
        Args:
            assembled_document: 组装好的文档
            image_dir: 图像输出目录
        
        Returns:
            List[str]: 图像文件路径列表
        """
        image_paths = []
        
        # 处理AssembledDocument中的图像信息
        for image_info in assembled_document.images:
            if hasattr(image_info, 'saved_path') and image_info.saved_path:
                source_path = image_info.saved_path
                if os.path.exists(source_path):
                    filename = os.path.basename(source_path)
                    dest_path = os.path.join(image_dir, filename)
                    
                    try:
                        shutil.copy2(source_path, dest_path)
                        image_paths.append(dest_path)
                    except Exception as e:
                        self.logger.error(f"复制图像文件失败: {source_path} -> {dest_path}, 错误: {str(e)}")
        
        return image_paths
    
    def _generate_markdown(self, assembled_document: AssembledDocument, use_translation: bool = False) -> str:
        """
        生成Markdown内容
        
        Args:
            assembled_document: 组装好的文档
            use_translation: 是否使用翻译内容
        
        Returns:
            str: Markdown内容
        """
        content_lines = []
        
        # 处理有序内容块
        for content_block in assembled_document.ordered_content_blocks:
            # 选择使用原文还是译文
            text = content_block.trans_markdown if use_translation and content_block.trans_markdown else content_block.raw_markdown
            
            if text and text.strip():
                content_lines.append(text)
                content_lines.append("")
        
        return "\n".join(content_lines)
    
    def _generate_combined_markdown(self, assembled_document: AssembledDocument) -> str:
        """
        生成原文+译文对照的Markdown内容
        
        Args:
            assembled_document: 组装好的文档
        
        Returns:
            str: 对照Markdown内容
        """
        content_lines = []
        
        # 处理有序内容块
        for content_block in assembled_document.ordered_content_blocks:
            # 原文
            if content_block.raw_markdown and content_block.raw_markdown.strip():
                content_lines.append(content_block.raw_markdown)
                content_lines.append("")
            
            # 译文
            if content_block.trans_markdown and content_block.trans_markdown.strip():
                content_lines.append(content_block.trans_markdown)
                content_lines.append("")
            
            # 添加分隔线
            if content_block.raw_markdown and content_block.trans_markdown:
                content_lines.append("---")
                content_lines.append("")
        
        return "\n".join(content_lines)
    
    def _save_file(self, file_path: str, content: str) -> int:
        """
        保存文件
        
        Args:
            file_path: 文件路径
            content: 文件内容
        
        Returns:
            int: 文件大小（字节）
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            file_size = os.path.getsize(file_path)
            self.logger.info(f"保存文件: {file_path} ({file_size} 字节)")
            return file_size
            
        except Exception as e:
            self.logger.error(f"保存文件失败: {file_path}, 错误: {str(e)}")
            raise
    
    def _generate_debug_files(self, assembled_document: AssembledDocument, debug_dir: str):
        """
        生成调试文件
        
        Args:
            assembled_document: 组装好的文档
            debug_dir: 调试目录
        """
        try:
            # 生成文档结构信息
            structure_info = {
                "detected_language": assembled_document.detected_language,
                "total_pages": assembled_document.total_pages,
                "total_blocks": len(assembled_document.ordered_content_blocks),
                "translation_enabled": assembled_document.translation_enabled,
                "target_language": assembled_document.target_language,
                "total_elements": assembled_document.total_elements,
                "successful_elements": assembled_document.successful_elements,
                "failed_elements": assembled_document.failed_elements,
                "total_processing_time": assembled_document.total_processing_time
            }
            
            structure_path = os.path.join(debug_dir, "document_structure.json")
            with open(structure_path, 'w', encoding='utf-8') as f:
                import json
                json.dump(structure_info, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"生成调试文件: {structure_path}")
        
        except Exception as e:
            self.logger.error(f"生成调试文件失败: {str(e)}") 