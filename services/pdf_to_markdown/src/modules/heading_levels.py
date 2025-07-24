import logging
import re
from typing import List, Dict, Optional, Any, Tuple

from ..core.data_structures import ContentBlock, ElementType, HeadingLevel, HeadingLevelingResult
from ..config.model_config import ModelConfig, ModelType
from ..utils.logger import setup_logger
from ..api.ai_client import AIClient, AIClientError

class HeadingLevelAnalyzer:
    """
    标题分级分析器
    使用Docker AI服务对文档标题进行语义分级
    """
    
    def __init__(self, model_config: Optional[ModelConfig] = None, debug_mode: bool = False):
        """
        初始化标题分级分析器
        
        Args:
            model_config: 模型配置
            debug_mode: 是否启用调试模式
        """
        self.logger = setup_logger(__name__)
        self.debug_mode = debug_mode
        self.model_config = model_config
        
        # 初始化AI客户端
        if model_config and model_config.heading_model_type == ModelType.DOCKER_AI:
            self.ai_client = AIClient(
                base_url=model_config.base_url,
                api_key=model_config.api_key,
                max_concurrent=model_config.max_concurrent,
                debug_mode=debug_mode
            )
            self.model_name = model_config.heading_model_name
            self.logger.info(f"初始化标题分级分析器，使用Docker AI服务，模型: {self.model_name}")
        else:
            # 如果没有配置或使用本地模型，则禁用AI分级功能
            self.ai_client = None
            self.model_name = None
            self.logger.warning("AI标题分级功能已禁用：未配置Docker AI服务或选择了本地模型")
        
    def analyze(self, content_results: List, state=None) -> Tuple[HeadingLevelingResult, Any]:
        """
        分析标题级别
        
        Args:
            content_results: 内容解析结果列表
            state: 处理状态
        
        Returns:
            Tuple[HeadingLevelingResult, Any]: 标题分级结果和状态
        """
        # 提取所有标题
        all_headings = []
        for result in content_results:
            if hasattr(result, 'content_blocks'):
                for block in result.content_blocks:
                    if block.element_type in [ElementType.DOCUMENT_TITLE, ElementType.PARAGRAPH_TITLE]:
                        all_headings.append(block)
        
        if not all_headings:
            self.logger.info("未找到标题元素")
            return HeadingLevelingResult(
                heading_levels=[],
                processing_time=0.0,
                total_headings=0
            ), state
        
        self.logger.info(f"找到 {len(all_headings)} 个标题，开始分级分析")
        
        # 如果没有AI客户端，使用默认分级
        if not self.ai_client:
            return self._default_heading_levels(all_headings), state
        
        # 使用AI进行分级
        try:
            heading_levels = self._classify_headings_with_ai(all_headings)
            
            result = HeadingLevelingResult(
                heading_levels=heading_levels,
                processing_time=0.0,  # 暂时设为0，可以在需要时添加计时
                total_headings=len(heading_levels)
            )
            
            self.logger.info(f"标题分级完成，共处理 {len(heading_levels)} 个标题")
            return result, state
            
        except Exception as e:
            self.logger.error(f"AI标题分级失败: {str(e)}，使用默认分级")
            return self._default_heading_levels(all_headings), state
    
    def _default_heading_levels(self, headings: List[ContentBlock]) -> HeadingLevelingResult:
        """
        默认标题分级（不使用AI）
        
        Args:
            headings: 标题内容块列表
        
        Returns:
            HeadingLevelingResult: 默认分级结果
        """
        heading_levels = []
        
        for block in headings:
            # 默认分级规则：文档标题=1级，段落标题=2级
            if block.element_type == ElementType.DOCUMENT_TITLE:
                level = 1
            else:  # PARAGRAPH_TITLE
                level = 2
            
            heading_level = HeadingLevel(
                element_id=block.element_id,
                original_level=level,
                semantic_level=level,
                confidence=1.0  # 默认分级置信度为1.0
            )
            heading_levels.append(heading_level)
        
        return HeadingLevelingResult(
            heading_levels=heading_levels,
            processing_time=0.0,
            total_headings=len(heading_levels)
        )
    
    def _classify_headings_with_ai(self, headings: List[ContentBlock]) -> List[HeadingLevel]:
        """
        使用AI模型对标题进行分级
        
        Args:
            headings: 标题内容块列表
        
        Returns:
            List[HeadingLevel]: 标题级别列表
        """
        if not headings or not self.ai_client or not self.model_name:
            return []
        
        # 提取标题文本
        heading_texts = []
        for block in headings:
            heading_texts.append(block.raw_markdown.strip())
        
        # 构建提示
        prompt = self._build_ai_prompt(heading_texts)
        
        try:
            # 调用AI客户端
            messages = [
                {"role": "system", "content": "你是一个专业的文档结构分析专家，擅长分析标题的层级关系。"},
                {"role": "user", "content": prompt}
            ]
            
            response_text = self.ai_client.chat_completion(
                model=self.model_name,
                messages=messages,
                temperature=0.1
            )
            
            # 解析响应
            semantic_levels = self._parse_ai_response(response_text, len(heading_texts))
            
            # 构建结果
            heading_levels = []
            for i, block in enumerate(headings):
                # 确定原始级别
                if block.element_type == ElementType.DOCUMENT_TITLE:
                    original_level = 1
                else:  # PARAGRAPH_TITLE
                    original_level = 2
                
                # 获取语义级别
                if i < len(semantic_levels):
                    semantic_level = semantic_levels[i]
                else:
                    semantic_level = original_level  # 如果解析失败，使用原始级别
                
                heading_level = HeadingLevel(
                    element_id=block.element_id,
                    original_level=original_level,
                    semantic_level=semantic_level,
                    confidence=0.8  # AI分级的置信度
                )
                heading_levels.append(heading_level)
            
            return heading_levels
            
        except Exception as e:
            self.logger.error(f"AI标题分级失败: {str(e)}")
            # 分级失败时，返回空列表，由调用方处理
            raise e
    
    def _build_ai_prompt(self, heading_texts: List[str]) -> str:
        """
        构建AI分级提示
        
        Args:
            heading_texts: 标题文本列表
        
        Returns:
            str: 分级提示
        """
        # 构建标题列表
        heading_list = []
        for i, text in enumerate(heading_texts):
            heading_list.append(f"{i+1}. {text}")
        
        heading_text = "\n".join(heading_list)
        
        prompt = f"""请分析以下标题的层级关系，并为每个标题分配1-6级的标题级别（1级为最高级别）。

标题列表：
{heading_text}

请根据以下规则进行分级：
1. 文档总标题通常为1级
2. 章节标题通常为2-3级
3. 小节标题通常为3-4级
4. 段落标题通常为4-5级
5. 具体内容标题通常为5-6级

请按照标题的语义重要性和层级关系进行分级，返回格式如下：
1: [级别]
2: [级别]
3: [级别]
...

例如：
1: 1
2: 2
3: 3
"""
        
        return prompt
    
    def _parse_ai_response(self, response_text: str, expected_count: int) -> List[int]:
        """
        解析AI响应，提取标题级别
        
        Args:
            response_text: AI响应文本
            expected_count: 期望的标题数量
        
        Returns:
            List[int]: 标题级别列表
        """
        try:
            # 使用正则表达式提取级别信息
            pattern = r'(\d+):\s*(\d+)'
            matches = re.findall(pattern, response_text)
            
            # 构建级别字典
            levels_dict = {}
            for match in matches:
                index = int(match[0])
                level = int(match[1])
                # 确保级别在有效范围内
                if 1 <= level <= 6:
                    levels_dict[index] = level
                else:
                    levels_dict[index] = 2  # 默认级别
            
            # 构建有序的级别列表
            semantic_levels = []
            for i in range(1, expected_count + 1):
                if i in levels_dict:
                    semantic_levels.append(levels_dict[i])
                else:
                    semantic_levels.append(2)  # 默认级别
            
            return semantic_levels
            
        except Exception as e:
            self.logger.error(f"解析AI响应失败: {str(e)}")
            # 解析失败时返回默认级别
            return [2] * expected_count
    
    def close(self):
        """关闭分析器，清理资源"""
        if self.ai_client:
            self.ai_client.close() 