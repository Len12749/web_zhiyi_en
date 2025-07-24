import time
import logging
from typing import List, Dict, Optional, Any, Tuple
import os
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import re

from ..core.data_structures import ContentBlock, ElementType
from ..config.model_config import ModelConfig, ModelType
from ..utils.logger import setup_logger
from ..api.ai_client import AIClient, AIClientError

class Translator:
    """
    翻译器
    使用Docker AI服务将内容从源语言翻译为目标语言
    """
    
    def __init__(self, model_config: Optional[ModelConfig] = None, debug_mode: bool = False):
        """
        初始化翻译器
        
        Args:
            model_config: 模型配置
            debug_mode: 是否启用调试模式
        """
        self.logger = setup_logger(__name__)
        self.debug_mode = debug_mode
        self.model_config = model_config
        
        # 初始化AI客户端
        if model_config and model_config.translation_model_type == ModelType.DOCKER_AI:
            self.ai_client = AIClient(
                base_url=model_config.base_url,
                api_key=model_config.api_key,
                max_concurrent=model_config.max_concurrent,
                debug_mode=debug_mode
            )
            self.model_name = model_config.translation_model_name
            self.logger.info(f"初始化翻译器，使用Docker AI服务，模型: {self.model_name}")
        else:
            # 如果没有配置或使用本地模型，则禁用翻译功能
            self.ai_client = None
            self.model_name = None
            self.logger.warning("翻译功能已禁用：未配置Docker AI服务或选择了本地模型")
        
        # 配置并行处理
        max_workers = model_config.max_concurrent if model_config else 5
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
    def translate(
        self,
        content_blocks: List[ContentBlock],
        source_language: str = "中文",
        target_language: str = "English"
    ) -> List[ContentBlock]:
        """
        翻译内容块列表
        
        Args:
            content_blocks: 内容块列表
            source_language: 源语言
            target_language: 目标语言
        
        Returns:
            List[ContentBlock]: 翻译后的内容块列表
        """
        if not self.ai_client:
            self.logger.warning("翻译客户端未初始化，返回原始内容")
            return content_blocks
        
        if not content_blocks:
            return []
        
        self.logger.info(f"开始翻译 {len(content_blocks)} 个内容块，从 {source_language} 翻译到 {target_language}")
        
        # 分批处理以避免单次请求过大
        batch_size = 10  # 每批处理10个内容块
        translated_blocks = []
        
        for i in range(0, len(content_blocks), batch_size):
            batch = content_blocks[i:i+batch_size]
            batch_start_time = time.time()
            
            try:
                # 翻译这一批内容
                translated_batch = self._translate_batch(batch, source_language, target_language)
                translated_blocks.extend(translated_batch)
                
                batch_time = time.time() - batch_start_time
                self.logger.info(f"批次 {i//batch_size + 1} 翻译完成，耗时: {batch_time:.2f}秒")
                
            except Exception as e:
                self.logger.error(f"批次 {i//batch_size + 1} 翻译失败: {str(e)}")
                # 翻译失败时，保留原始内容，但标记翻译内容为空
                for block in batch:
                    new_block = ContentBlock(
                        element_id=block.element_id,
                        element_type=block.element_type,
                        raw_markdown=block.raw_markdown,
                        trans_markdown="",  # 翻译失败，设为空字符串
                        image_info=block.image_info,
                        confidence=block.confidence
                    )
                    translated_blocks.append(new_block)
        
        self.logger.info(f"翻译完成，共处理 {len(translated_blocks)} 个内容块")
        return translated_blocks
    
    def _translate_batch(
        self, 
        content_blocks: List[ContentBlock], 
        source_language: str,
        target_language: str
    ) -> List[ContentBlock]:
        """
        翻译一批内容块
        
        Args:
            content_blocks: 内容块列表
            source_language: 源语言
            target_language: 目标语言
        
        Returns:
            List[ContentBlock]: 翻译后的内容块列表
        """
        if not content_blocks:
            return []
        
        # 过滤出需要翻译的内容块
        translatable_blocks = []
        for block in content_blocks:
            # 跳过图像元素（通常不需要翻译）
            if block.element_type in [ElementType.IMAGE, ElementType.CHART]:
                continue
            # 跳过空内容
            if not block.raw_markdown or not block.raw_markdown.strip():
                continue
            translatable_blocks.append(block)
        
        if not translatable_blocks:
            # 如果没有需要翻译的内容，返回原始内容块但设置空的翻译内容
            result_blocks = []
            for block in content_blocks:
                new_block = ContentBlock(
                    element_id=block.element_id,
                    element_type=block.element_type,
                    raw_markdown=block.raw_markdown,
                    trans_markdown="",
                    image_info=block.image_info,
                    confidence=block.confidence
                )
                result_blocks.append(new_block)
            return result_blocks
        
        # 构建需要翻译的内容
        source_contents = []
        for block in translatable_blocks:
            source_contents.append(f"<content>{block.raw_markdown}</content>")
        
        combined_source = "\n".join(source_contents)
        
        # 构建系统提示
        system_prompt = f"""你是一个专业的文档翻译器。
你需要将{source_language}文本翻译成{target_language}，保持原始格式和Markdown标记不变。
请严格遵循以下翻译规则：
1. 保持所有Markdown格式不变
2. 保持所有标题级别不变
3. 保持所有列表、引用和代码块的格式不变
4. 不要添加或删除内容
5. 根据上下文进行准确的翻译
6. 数学公式处理规则：
   - 不要翻译任何LaTeX数学公式内容，包括行内公式$...$和行间公式$$...$$
   - 保持所有数学符号、变量名称和公式结构完全不变
   - 例如：$f'(xi)= \\frac{{f(xi)-f(a)}}{{xi-a}}$ 应该保持原样不翻译
   - 对于公式中的文字说明，可以适当翻译，但要保持公式本身的完整性

每个内容块使用<content>和</content>标签包围。
请按照相同的顺序返回翻译后的内容，每个内容块使用<translated>和</translated>标签包围。"""
        
        # 构建用户提示
        user_prompt = f"""请将以下内容从{source_language}翻译成{target_language}：

{combined_source}

请返回翻译结果，每个内容块使用<translated>和</translated>标签包围。
记住：不要翻译任何数学公式内容，保持所有LaTeX公式原样不变。"""
        
        try:
            # 调用AI客户端进行翻译
            if not self.ai_client or not self.model_name:
                raise AIClientError("AI客户端或模型名称未初始化")
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            translated_text = self.ai_client.chat_completion(
                model=self.model_name,
                messages=messages,
                temperature=0.1  # 低温度以获得一致的翻译
            )
            
            # 解析翻译结果
            translated_contents = self._parse_translation_result(translated_text, len(translatable_blocks))
            
            # 构建结果列表
            result_blocks = []
            translatable_index = 0
            
            for block in content_blocks:
                if block in translatable_blocks:
                    # 这是需要翻译的内容块
                    if translatable_index < len(translated_contents):
                        trans_content = translated_contents[translatable_index]
                    else:
                        trans_content = block.raw_markdown  # 翻译失败时使用原文
                    translatable_index += 1
                else:
                    # 这是不需要翻译的内容块（如图像）
                    trans_content = ""
                
                new_block = ContentBlock(
                    element_id=block.element_id,
                    element_type=block.element_type,
                    raw_markdown=block.raw_markdown,
                    trans_markdown=trans_content,
                    image_info=block.image_info,
                    confidence=block.confidence
                )
                result_blocks.append(new_block)
            
            return result_blocks
            
        except Exception as e:
            self.logger.error(f"翻译API调用失败: {str(e)}")
            # 翻译失败时，返回原始内容，但设置空的翻译内容
            result_blocks = []
            for block in content_blocks:
                new_block = ContentBlock(
                    element_id=block.element_id,
                    element_type=block.element_type,
                    raw_markdown=block.raw_markdown,
                    trans_markdown="",
                    image_info=block.image_info,
                    confidence=block.confidence
                )
                result_blocks.append(new_block)
            return result_blocks
    
    def _parse_translation_result(self, translated_text: str, expected_count: int) -> List[str]:
        """
        解析翻译结果，提取各个内容块的翻译
        
        Args:
            translated_text: 翻译API返回的文本
            expected_count: 期望的内容块数量
        
        Returns:
            List[str]: 翻译后的内容列表
        """
        try:
            # 使用正则表达式提取<translated>标签中的内容
            pattern = r'<translated>(.*?)</translated>'
            matches = re.findall(pattern, translated_text, re.DOTALL)
            
            # 清理提取的内容
            translated_contents = []
            for match in matches:
                content = match.strip()
                translated_contents.append(content)
            
            # 检查提取的内容数量
            if len(translated_contents) != expected_count:
                self.logger.warning(f"翻译结果数量不匹配，期望 {expected_count} 个，实际 {len(translated_contents)} 个")
                
                # 如果数量不够，用原文填充
                while len(translated_contents) < expected_count:
                    translated_contents.append("")
                
                # 如果数量过多，截断
                translated_contents = translated_contents[:expected_count]
            
            return translated_contents
            
        except Exception as e:
            self.logger.error(f"解析翻译结果失败: {str(e)}")
            # 解析失败时返回空列表
            return [""] * expected_count
    
    def close(self):
        """关闭翻译器，清理资源"""
        if self.ai_client:
            self.ai_client.close()
        self.executor.shutdown(wait=True) 