import re
from typing import List, Dict, Tuple
from pathlib import Path

class TableHandler:
    """处理Markdown和HTML表格的提取和恢复"""
    
    def __init__(self):
        # 更新占位符格式，使用{id}作为ID占位
        self.table_placeholder_template = "[TABLE_ID_{id}]"
        # HTML表格正则表达式 - 匹配<table>到</table>的内容，包括不同的属性格式
        self.html_table_pattern = re.compile(r'<table(?:\s+[^>]*)?>(.*?)</table>', re.DOTALL)
        # 用于检测Markdown表格行的正则表达式
        self.md_table_line_pattern = re.compile(r'^\s*\|.*\|\s*$')
        # 分隔行正则，用于识别表格头部和内容的分隔
        self.md_table_separator_pattern = re.compile(r'^\s*\|\s*[-:]+[-|\s:]*\|\s*$')
        # 用于从占位符中提取ID的正则表达式
        self.placeholder_id_pattern = re.compile(r'\[TABLE_ID_(\d+)\]')
    
    def extract_tables(self, content: str) -> Tuple[str, List[Dict]]:
        """
        从文本中提取所有表格并替换为带ID的占位符
        
        Args:
            content: 原始Markdown文本
        
        Returns:
            Tuple[str, List[Dict]]: 替换了表格的文本和提取出的表格信息列表(包含id和内容)
        """
        processed_content = content
        extracted_tables = []
        table_id = 0
        
        # 1. 提取HTML表格
        html_tables = self.html_table_pattern.findall(processed_content)
        if html_tables:
            # 先找到完整的表格标签
            full_tables = []
            for match in self.html_table_pattern.finditer(processed_content):
                full_tables.append(match.group(0))
            
            # 替换找到的HTML表格
            for i, table in enumerate(full_tables):
                table_id += 1
                placeholder = self.table_placeholder_template.format(id=table_id)
                processed_content = processed_content.replace(table, placeholder, 1)
                extracted_tables.append({
                    "id": table_id,
                    "content": table,
                    "type": "html"
                })
        
        # 2. 提取Markdown表格
        lines = processed_content.split('\n')
        i = 0
        while i < len(lines):
            # 如果发现一个表格行
            if self.md_table_line_pattern.match(lines[i]):
                table_start = i
                # 向下查找直到找到非表格行
                while i < len(lines) and self.md_table_line_pattern.match(lines[i]):
                    i += 1
                
                # 提取表格文本
                table_text = '\n'.join(lines[table_start:i])
                # 检查是否是有效的Markdown表格（至少有两行，包括表头和分隔行）
                table_lines = table_text.split('\n')
                if len(table_lines) >= 2 and any(self.md_table_separator_pattern.match(line) for line in table_lines):
                    # 替换原文本中的表格
                    table_id += 1
                    placeholder = self.table_placeholder_template.format(id=table_id)
                    lines[table_start:i] = [placeholder]
                    extracted_tables.append({
                        "id": table_id,
                        "content": table_text,
                        "type": "markdown"
                    })
                    i = table_start + 1
                else:
                    i = table_start + 1  # 不是有效的表格，继续处理下一行
                continue
            i += 1
            
        processed_content = '\n'.join(lines)
        return processed_content, extracted_tables
    
    def restore_tables(self, content: str, tables: List[Dict]) -> str:
        """
        根据ID将占位符替换回原始表格
        
        Args:
            content: 包含带ID占位符的文本
            tables: 原始表格信息列表，包含id和内容
        
        Returns:
            str: 恢复了表格的文本
        """
        restored_content = content
        
        # 创建ID到表格内容的映射
        table_map = {table["id"]: table["content"] for table in tables}
        
        # 查找所有占位符并替换
        for match in self.placeholder_id_pattern.finditer(restored_content):
            placeholder = match.group(0)  # 完整的占位符
            table_id = int(match.group(1))  # 提取的ID
            
            if table_id in table_map:
                # 替换占位符为对应ID的表格内容
                restored_content = restored_content.replace(placeholder, table_map[table_id], 1)
        
        return restored_content
        
    def is_table_placeholder(self, text: str) -> bool:
        """
        检查文本是否是表格占位符
        
        Args:
            text: 要检查的文本
        
        Returns:
            bool: 是否是表格占位符
        """
        return bool(self.placeholder_id_pattern.match(text.strip()))
    
    def test_extraction(self, content: str) -> Tuple[str, List[Dict]]:
        """
        测试表格提取功能
        
        Args:
            content: 包含表格的文本内容
            
        Returns:
            Tuple[str, List[Dict]]: 处理后的文本和提取的表格信息列表
        """
        processed, tables = self.extract_tables(content)
        print(f"提取了 {len(tables)} 个表格")
        
        if tables:
            for table in tables:
                print(f"\n表格 ID-{table['id']} ({table['type']}):")
                print("-" * 40)
                print(table['content'])
                print("-" * 40)
        
        return processed, tables
    
    def test_restoration(self, processed_content: str, tables: List[Dict]) -> str:
        """
        测试表格恢复功能
        
        Args:
            processed_content: 已处理的文本（包含占位符）
            tables: 提取的表格信息列表
            
        Returns:
            str: 恢复后的文本
        """
        restored = self.restore_tables(processed_content, tables)
        print(f"已恢复 {len(tables)} 个表格")
        return restored 