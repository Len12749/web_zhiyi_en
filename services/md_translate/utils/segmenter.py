#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown分段工具 - 负责将Markdown文档分割成适当大小的段落

版本: 2.0.0
作者: Liu Jingkang
最后更新: 2024-05-15
许可证: MIT
"""

import re
from pathlib import Path
from typing import List, Dict, Tuple

class MarkdownSegmenter:
    """Markdown文档分段工具，用于将长文档分割成适当大小的段落"""
    
    def __init__(self, max_length=5000, min_length=3000):
        """
        初始化分段器
        
        Args:
            max_length: 段落最大长度
            min_length: 段落最小长度
        """
        self.max_length = max_length
        self.min_length = min_length
        
        # 预编译正则表达式
        self.formula_start = re.compile(r'^\s*\$\$', re.MULTILINE)
        self.formula_end = re.compile(r'\$\$\s*$')  # 以$$结尾
        self.algorithm_start = re.compile(
            r'(?:^|\n)###*\s*Algorithm\b',
            re.IGNORECASE
        )
        self.continuation_keywords = re.compile(
            r'^\s*(where|which|with|assuming|let\b|in\b|such\s+that)',
            re.IGNORECASE
        )
        self.sentence_end = re.compile(r'[.!?]\s*$')
        # 修改段落分割正则表达式，考虑HTML表格结束标签
        self.paragraph_split = re.compile(r'(?<!#)(?:\n\s*\n|</table>\s*\n)')
        self.code_block = re.compile(r'^```[^\n]*\n.*?^```', re.MULTILINE | re.DOTALL)
        self.header_pattern = re.compile(r'^#{1,6}\s+')  # 新增标题检测
        # 添加HTML表格识别
        self.html_table_start = re.compile(r'<table>')
        self.html_table_end = re.compile(r'</table>')
        self.html_table = re.compile(r'<table>.*?</table>', re.DOTALL)
        
        # 最小段落长度阈值，小于此值的段落将被合并
        self.min_segment_length = 600

    def segment(self, content: str, return_preprocessed=False) -> List[str]:
        """
        主分段入口
        
        Args:
            content: 要分段的Markdown内容
            return_preprocessed: 是否返回预处理后的块
            
        Returns:
            List[str]: 分段后的内容列表
        """
        blocks = self._parse_blocks(content)
        protected_blocks = self._process_protected_zones(blocks)
        segments = self._build_segments(protected_blocks)
        
        # 添加后处理步骤，合并过短的段落
        segments = self._merge_short_segments(segments)
        
        return segments

    def _merge_short_segments(self, segments: List[str]) -> List[str]:
        """
        合并过短的段落到前面或后面较短的段落中，不考虑合并后的长度限制
        
        Args:
            segments: 分段后的内容列表
            
        Returns:
            List[str]: 合并短段落后的内容列表
        """
        if len(segments) <= 1:
            return segments
            
        result = []
        i = 0
        
        while i < len(segments):
            current = segments[i]
            
            # 如果当前段落长度小于阈值且不是第一个或最后一个段落
            if len(current) < self.min_segment_length and 0 < i < len(segments) - 1:
                # 获取前一个和后一个段落
                prev_segment = result[-1]
                next_segment = segments[i + 1]
                
                # 计算合并到前面或后面的长度
                prev_merged_len = len(prev_segment) + len(current)
                next_merged_len = len(current) + len(next_segment)
                
                # 如果合并到前面的段落更短，优先合并到前面
                if prev_merged_len <= next_merged_len:
                    # 合并到前一个段落
                    result[-1] = prev_segment + "\n\n" + current
                else:
                    # 合并到后一个段落
                    segments[i + 1] = current + "\n\n" + next_segment
            # 如果是第一个段落且长度小于阈值，直接合并到下一个段落
            elif len(current) < self.min_segment_length and i == 0 and i < len(segments) - 1:
                next_segment = segments[i + 1]
                # 合并到下一个段落
                segments[i + 1] = current + "\n\n" + next_segment
            # 如果是最后一个段落且长度小于阈值，直接合并到前一个段落
            elif len(current) < self.min_segment_length and i == len(segments) - 1 and i > 0:
                prev_segment = result[-1]
                # 合并到前一个段落
                result[-1] = prev_segment + "\n\n" + current
            else:
                # 正常添加当前段落
                result.append(current)
            
            i += 1
        
        return result

    def _parse_blocks(self, content: str) -> List[Dict]:
        """
        解析文档为带元数据的块列表
        
        Args:
            content: Markdown内容
            
        Returns:
            List[Dict]: 带元数据的块列表
        """
        # 修改分割逻辑，确保HTML表格被正确识别
        raw_blocks = []
        current_pos = 0
        
        # 查找所有HTML表格位置
        table_positions = []
        for match in self.html_table.finditer(content):
            table_positions.append((match.start(), match.end()))
        
        # 根据表格位置和段落分隔符分割文本
        for match in self.paragraph_split.finditer(content):
            end_pos = match.end()
            # 检查是否在表格内部
            in_table = False
            for start, end in table_positions:
                if start < end_pos < end:
                    in_table = True
                    break
            
            if not in_table and current_pos < end_pos:
                block_text = content[current_pos:end_pos].strip()
                if block_text:
                    raw_blocks.append(block_text)
                current_pos = end_pos
        
        # 添加最后一个块
        if current_pos < len(content):
            last_block = content[current_pos:].strip()
            if last_block:
                raw_blocks.append(last_block)
        
        # 处理空块
        raw_blocks = [b for b in raw_blocks if b.strip()]
        
        blocks = []
        in_algorithm = False

        for i, text in enumerate(raw_blocks):
            block = {
                'text': text,
                'type': 'normal',
                'protected': False,
                'continuation': False
            }

            # 新增HTML表格检测
            if self.html_table.search(text):
                block['type'] = 'table'
                block['protected'] = True

            # 新增标题块检测
            if self.header_pattern.match(text.strip()):
                block['type'] = 'header'
                block['protected'] = True

            # 检测公式块（仅匹配以$$开头的块）
            if self.formula_start.search(text) and self.formula_end.search(text):
                block['type'] = 'formula'
                block['protected'] = True

            # 检测代码块（完整匹配```...```）
            if self.code_block.fullmatch(text.strip()):
                block['type'] = 'code'
                block['protected'] = True

            # 检测算法块开始
            if self.algorithm_start.search(text):
                in_algorithm = True

            # 处理算法块内部
            if in_algorithm:
                block['type'] = 'algorithm'
                block['protected'] = True

            # 检测延续关系
            if i > 0:
                prev_text = raw_blocks[i-1]
                block['continuation'] = self._needs_continuation(prev_text, text)

            blocks.append(block)

        return blocks

    def _count_nested_blocks(self, text: str) -> int:
        """
        计算嵌套块层数
        
        Args:
            text: 块文本
            
        Returns:
            int: 嵌套块层数
        """
        formula_count = len(self.formula_start.findall(text))
        code_count = len(self.code_block.findall(text))
        table_count = len(self.html_table.findall(text))
        return formula_count + code_count + table_count

    def _needs_continuation(self, prev_text: str, current_text: str) -> bool:
        """
        判断是否需要延续
        
        Args:
            prev_text: 前一个块的文本
            current_text: 当前块的文本
            
        Returns:
            bool: 是否需要延续
        """
        # 前导文本未结束
        if not self.sentence_end.search(prev_text):
            return True

        # 当前文本是延续关键词
        if self.continuation_keywords.match(current_text):
            return True
            
        # 如果前一个块是HTML表格，且当前块不是以标题开始，则不视为延续
        if self.html_table_end.search(prev_text) and not self.header_pattern.match(current_text.strip()):
            return False

        return False

    def _process_protected_zones(self, blocks: List[Dict]) -> List[Dict]:
        """
        处理保护区域连续性
        
        Args:
            blocks: 解析后的块列表
            
        Returns:
            List[Dict]: 处理后的块列表
        """
        result = []
        
        # 标记连续的公式、代码、表格和算法块
        in_protected = False
        protected_start = -1
        
        for i, block in enumerate(blocks):
            if block['protected'] and not in_protected:
                # 保护区域开始
                in_protected = True
                protected_start = i
            elif not block['protected'] and in_protected:
                # 保护区域结束，合并
                if i - protected_start > 1:
                    # 有多个连续的保护块
                    merged_text = "\n\n".join(blocks[j]['text'] for j in range(protected_start, i))
                    merged_block = {
                        'text': merged_text,
                        'type': 'protected_group',
                        'protected': True,
                        'continuation': blocks[protected_start]['continuation']
                    }
                    result.append(merged_block)
                else:
                    # 只有一个保护块
                    result.append(blocks[protected_start])
                
                # 添加当前非保护块
                result.append(block)
                in_protected = False
            elif not in_protected:
                # 非保护区域中的普通块
                result.append(block)
        
        # 处理最后的保护区域
        if in_protected:
            if len(blocks) - protected_start > 1:
                # 有多个连续的保护块
                merged_text = "\n\n".join(blocks[j]['text'] for j in range(protected_start, len(blocks)))
                merged_block = {
                    'text': merged_text,
                    'type': 'protected_group',
                    'protected': True,
                    'continuation': blocks[protected_start]['continuation']
                }
                result.append(merged_block)
            else:
                # 只有一个保护块
                result.append(blocks[protected_start])
                
        return result

    def _build_segments(self, blocks: List[Dict]) -> List[str]:
        """
        构建最终的段落
        
        Args:
            blocks: 处理后的块列表
            
        Returns:
            List[str]: 最终的段落列表
        """
        segments = []
        current_segment = []
        current_length = 0
        
        for block in blocks:
            block_text = block['text']
            block_length = len(block_text)
            
            # 如果当前块是受保护的，或者添加后总长度不超过最大长度
            if block['protected'] or current_length + block_length <= self.max_length:
                current_segment.append(block_text)
                current_length += block_length
            else:
                # 如果当前段落已经有内容，结束当前段落
                if current_segment:
                    segments.append("\n\n".join(current_segment))
                
                # 如果当前块本身就超过最大长度，单独成段
                if block_length > self.max_length:
                    segments.append(block_text)
                    current_segment = []
                    current_length = 0
                else:
                    # 否则，开始新段落
                    current_segment = [block_text]
                    current_length = block_length
        
        # 添加最后一个段落
        if current_segment:
            segments.append("\n\n".join(current_segment))
            
        return segments 