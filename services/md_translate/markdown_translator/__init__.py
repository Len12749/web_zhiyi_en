#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown Translator - 中英文翻译工具包

自动将英文 Markdown 文档翻译成中文，保持格式和专业术语的准确性。
"""

__version__ = "1.0.0"
__author__ = "AI Assistant"

# 导入streaming模块中确实存在的函数
from .streaming import (
    translate_file,
    process_files
)

# 导出文本块优化器函数
from .chunk_splitter import (
    optimize_text,
    optimize_text_chunks
)

# 导出内容优化器函数
from .content_optimizer import optimize_content

# 导出翻译器函数
from .translator import translate_document

# 导出主要函数
from markdown_translator.chunk_splitter import optimize_text
from markdown_translator.content_optimizer import optimize_content
from markdown_translator.translator import translate_document

__all__ = [
    'translate_file',
    'process_files',
    'optimize_text',
    'optimize_text_chunks',
    'optimize_content',
    'translate_document'
] 