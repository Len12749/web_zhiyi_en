"""
自适应布局模块 - 参考PDFMathTranslate的排版重建逻辑
解决pdf_translator中文本换行计算的问题
"""

import re
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Tuple, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import unicodedata

# 导入数学公式渲染相关函数
from utils import draw_text_with_math, parse_text_with_math

class TextBlockType(Enum):
    TEXT = "text"
    MATH = "math"
    LINE = "line"

@dataclass
class TextBlock:
    """文本块数据结构"""
    type: TextBlockType
    content: str
    x: float
    y: float
    width: float
    height: float
    font_size: float
    font_family: str
    confidence: float = 1.0

@dataclass
class LayoutSegment:
    """布局段落数据结构 - 参考PDFMathTranslate的Paragraph"""
    x: float          # 段落起始横坐标
    y: float          # 段落起始纵坐标
    x0: float         # 段落左边界
    x1: float         # 段落右边界
    y0: float         # 段落上边界
    y1: float         # 段落下边界
    width: float      # 段落宽度
    height: float     # 段落高度
    font_size: float  # 字体大小
    line_height: float # 行间距
    has_line_break: bool = False  # 是否包含换行

class AdaptiveLayoutRenderer:
    """自适应布局渲染器 - 参考PDFMathTranslate的排版重建逻辑"""
    
    def __init__(self):
        # 语言相关的行距映射 - 参考PDFMathTranslate，但适当减小以适应更多文本
        self.LANG_LINEHEIGHT_MAP = {
            "中文": 1.2, "简体中文": 1.2, "繁体中文": 1.2,
            "日语": 1.0, "韩语": 1.1, "英语": 1.1, "英文": 1.1,
            "阿拉伯语": 1.0, "俄语": 0.9, "乌克兰语": 0.9, "泰语": 0.9
        }
        
        # 字符宽度缓存
        self.char_width_cache = {}
        
        # 数学公式检测正则
        self.math_pattern = re.compile(r'\$([^$]+)\$')
    
    def get_language_line_height(self, language: str) -> float:
        """根据语言获取行距系数"""
        return self.LANG_LINEHEIGHT_MAP.get(language, 1.1)
    
    def get_char_width(self, char: str, font, font_size: float) -> float:
        """获取字符宽度 - 使用缓存提高性能"""
        cache_key = (char, font.path if hasattr(font, 'path') else str(font), font_size)
        
        if cache_key in self.char_width_cache:
            return self.char_width_cache[cache_key]
        
        # 创建临时绘图对象测量字符宽度
        temp_img = Image.new("RGB", (1, 1))
        temp_draw = ImageDraw.Draw(temp_img)
        
        try:
            width = temp_draw.textlength(char, font=font)
        except:
            # 如果字符无法渲染，使用平均宽度
            width = font_size * 0.6
        
        self.char_width_cache[cache_key] = width
        return width
    
    def analyze_text_layout(self, text: str, font, 
                          font_size: float, available_width: float) -> List[TextBlock]:
        """分析文本布局 - 参考PDFMathTranslate的字符级处理逻辑"""
        
        blocks = []
        current_x = 0
        current_line = 0
        line_height = font_size * 1.2  # 基础行高
        
        # 识别数学公式
        math_segments = []
        for match in self.math_pattern.finditer(text):
            math_segments.append((match.start(), match.end(), match.group(0)))
        
        # 按字符处理文本 - 参考PDFMathTranslate的逐字符处理
        ptr = 0
        while ptr < len(text):
            char = text[ptr]
            
            # 检查是否为数学公式
            is_math = False
            for start, end, formula in math_segments:
                if start <= ptr < end:
                    is_math = True
                    # 将整个公式作为一个块
                    blocks.append(TextBlock(
                        type=TextBlockType.MATH,
                        content=formula,
                        x=current_x,
                        y=current_line * line_height,
                        width=len(formula) * font_size * 0.8,  # 估算公式宽度
                        height=font_size,
                        font_size=font_size,
                        font_family=""
                    ))
                    ptr = end
                    current_x += len(formula) * font_size * 0.8
                    break
            
            if not is_math:
                # 普通字符处理
                char_width = self.get_char_width(char, font, font_size)
                
                # 检查是否需要换行 - 参考PDFMathTranslate的边界检测
                if current_x + char_width > available_width * 0.95:  # 留5%边距
                    current_line += 1
                    current_x = 0
                
                blocks.append(TextBlock(
                    type=TextBlockType.TEXT,
                    content=char,
                    x=current_x,
                    y=current_line * line_height,
                    width=char_width,
                    height=font_size,
                    font_size=font_size,
                    font_family=""
                ))
                
                current_x += char_width
                ptr += 1
        
        return blocks
    
    def calculate_adaptive_layout(self, text: str, bbox: Tuple[float, float, float, float],
                                font, font_size: float,
                                target_language: str = "中文") -> LayoutSegment:
        """计算自适应布局 - 参考PDFMathTranslate的布局计算逻辑"""
        
        x0, y0, x1, y1 = bbox
        width = x1 - x0
        height = y1 - y0
        
        # 使用实际的文本分割方法来计算行数，确保一致性
        lines = self._split_text_into_lines(text, font, font_size, width)
        actual_lines = len(lines)
        
        # 获取语言相关的行距
        line_height_ratio = self.get_language_line_height(target_language)
        base_line_height = font_size * line_height_ratio
        
        # 计算需要的总高度
        needed_height = actual_lines * base_line_height
        
        # 如果文本超出高度，需要调整字体大小和行距
        adjusted_font_size = font_size
        adjusted_line_height = base_line_height
        
        if needed_height > height:
            # 方案1：先尝试减小行距
            min_line_height_ratio = 0.9  # 最小行距系数
            adjusted_line_height = height / actual_lines
            
            # 如果调整行距还不够，需要减小字体
            if adjusted_line_height < font_size * min_line_height_ratio:
                # 计算需要的字体大小
                adjusted_font_size = height / (actual_lines * line_height_ratio)
                # 限制最小字体大小
                adjusted_font_size = max(adjusted_font_size, font_size * 0.5)
                
                # 用新字体重新计算
                new_font = self._create_font_with_size(font, adjusted_font_size)
                lines = self._split_text_into_lines(text, new_font, adjusted_font_size, width)
                actual_lines = len(lines)
                
                # 重新计算行高
                adjusted_line_height = height / actual_lines if actual_lines > 0 else base_line_height
        
        return LayoutSegment(
            x=x0,
            y=y0,
            x0=x0,
            x1=x1,
            y0=y0,
            y1=y1,
            width=width,
            height=height,
            font_size=adjusted_font_size,
            line_height=adjusted_line_height,
            has_line_break=actual_lines > 1
        )
    
    def render_adaptive_text(self, draw, text: str, 
                           layout_segment: LayoutSegment, font,
                           target_language: str = "中文") -> None:
        """渲染自适应文本 - 支持数学公式渲染和自动换行"""
        
        # 检查是否需要使用调整后的字体大小
        actual_font = font
        if hasattr(font, 'size') and font.size != int(layout_segment.font_size):
            # 字体大小已被调整，创建新字体
            actual_font = self._create_font_with_size(font, layout_segment.font_size)
        
        # 使用实际的行高（已经在calculate_adaptive_layout中调整过）
        line_height = layout_segment.line_height
        
        # 将文本分割成行（这个方法已经支持数学公式保护）
        lines = self._split_text_into_lines(text, actual_font, layout_segment.font_size, layout_segment.width)
        
        # 计算实际需要的高度
        total_height = len(lines) * line_height
        
        # 如果仍然超出高度，进一步压缩行距
        if total_height > layout_segment.height and len(lines) > 1:
            line_height = layout_segment.height / len(lines)
        
        # 逐行渲染
        for i, line in enumerate(lines):
            if not line.strip():  # 空行
                continue
                
            y = i * line_height
            
            # 确保文本在边界内
            if y + layout_segment.font_size > layout_segment.height * 1.1:  # 允许10%的溢出
                break
                
            # 检查这一行是否包含数学公式
            if '$' in line:
                # 解析这一行的文本和数学公式
                parts = parse_text_with_math(line, int(layout_segment.font_size))
                
                # 渲染这一行的每个部分
                x = 0
                for part_type, content in parts:
                    if part_type == 'text' and content.strip():
                        # 绘制普通文本
                        draw.text((x, y), content, font=actual_font, fill="black")
                        x += self._get_text_width(content, actual_font)
                    elif part_type == 'math':
                        # 渲染数学公式图像
                        try:
                            # 将RGBA图像转换为RGB，背景设为白色
                            formula_image = content
                            if formula_image.mode == 'RGBA':
                                # 创建白色背景
                                white_bg = Image.new('RGB', formula_image.size, (255, 255, 255))
                                white_bg.paste(formula_image, mask=formula_image.split()[-1])  # 使用alpha通道作为mask
                                formula_image = white_bg
                            
                            # 改进的基线对齐计算
                            # 让公式更好地与文本基线对齐
                            text_baseline_offset = int(layout_segment.font_size * 0.15)
                            formula_y = y + int(layout_segment.font_size * 0.7) - formula_image.height + text_baseline_offset
                            
                            # 确保公式不会太高而超出行边界
                            if formula_y < y:
                                formula_y = y
                            
                            # 粘贴公式图像
                            draw._image.paste(formula_image, (int(x), int(formula_y)))
                            x += formula_image.width + 2  # 添加小间距
                        except Exception as e:
                            print(f"  ⚠️ 公式图像绘制失败: {e}")
                            # 如果绘制失败，绘制原始文本作为备用
                            fallback_text = f"${content}$" if not isinstance(content, str) else content
                            draw.text((x, y), fallback_text, font=actual_font, fill="black")
                            x += self._get_text_width(fallback_text, actual_font)
            else:
                # 不包含数学公式的行，直接绘制
                draw.text((0, y), line, font=actual_font, fill="black")
    
    def _split_text_into_lines(self, text: str, font, font_size: float, max_width: float) -> List[str]:
        """将文本分割成适合宽度的行 - 支持中文字符级换行和数学公式保护"""
        lines = []
        
        # 先按换行符分割
        paragraphs = text.split('\n')
        
        for paragraph in paragraphs:
            if not paragraph.strip():
                lines.append('')
                continue
            
            # 如果段落包含数学公式，使用特殊处理
            if '$' in paragraph:
                # 识别数学公式片段
                parts = []
                last_end = 0
                
                for match in self.math_pattern.finditer(paragraph):
                    # 添加公式前的文本
                    if match.start() > last_end:
                        before_text = paragraph[last_end:match.start()]
                        if before_text:
                            parts.append(('text', before_text))
                    
                    # 添加数学公式（作为一个整体单元）
                    formula_text = match.group(0)  # 包含$符号的完整公式
                    parts.append(('math', formula_text))
                    
                    last_end = match.end()
                
                # 添加最后一段文本
                if last_end < len(paragraph):
                    remaining_text = paragraph[last_end:]
                    if remaining_text:
                        parts.append(('text', remaining_text))
                
                # 如果没有找到数学公式，当作普通文本处理
                if not parts:
                    parts = [('text', paragraph)]
                
                # 智能换行：将数学公式作为不可分割的单元
                current_line = ""
                current_width = 0
                
                for part_type, content in parts:
                    if part_type == 'text':
                        # 处理普通文本：按字符逐个添加
                        for char in content:
                            char_width = self.get_char_width(char, font, font_size)
                            
                            if current_width + char_width <= max_width * 0.95:
                                current_line += char
                                current_width += char_width
                            else:
                                # 检查标点符号规则
                                if self._is_line_start_prohibited(char) and current_line:
                                    # 标点符号不能放在行首，强行放到上一行末尾
                                    lines.append(current_line + char)
                                    current_line = ""
                                    current_width = 0
                                else:
                                    # 正常换行
                                    if current_line.strip():
                                        lines.append(current_line.rstrip())
                                    current_line = char
                                    current_width = char_width
                    
                    elif part_type == 'math':
                        # 处理数学公式：作为一个整体单元
                        # 使用更准确的公式宽度估算
                        formula_width = self._estimate_formula_width(content, font_size)
                        
                        # 检查公式前是否需要空格
                        needs_space_before = (current_line and 
                                            not current_line.endswith(' ') and 
                                            not current_line.endswith('(') and
                                            not current_line.endswith('['))
                        
                        # 计算包含可能的空格的总宽度
                        space_width = self.get_char_width(' ', font, font_size) if needs_space_before else 0
                        total_width_needed = formula_width + space_width
                        
                        if current_width + total_width_needed <= max_width * 0.95:
                            # 公式可以放在当前行
                            if needs_space_before:
                                current_line += ' '
                                current_width += space_width
                            current_line += content
                            current_width += formula_width
                        else:
                            # 公式放不下，需要换行
                            if current_line.strip():
                                lines.append(current_line.rstrip())
                            current_line = content
                            current_width = formula_width
                
                # 添加最后一行
                if current_line.strip():
                    lines.append(current_line.rstrip())
                
            else:
                # 不包含数学公式的普通文本处理
                current_line = ""
                i = 0
                
                while i < len(paragraph):
                    char = paragraph[i]
                    
                    # 测试添加当前字符后的行宽度
                    test_line = current_line + char
                    
                    # 测量文本宽度
                    text_width = self._get_text_width(test_line, font)
                    
                    if text_width <= max_width * 0.95:  # 留5%边距
                        current_line = test_line
                        i += 1
                    else:
                        # 当前行已满，需要换行
                        if current_line:
                            # 检查下一个字符是否是不能放在行首的标点
                            if self._is_line_start_prohibited(char):
                                # 标点符号不能放在行首，强行放到上一行末尾
                                lines.append(current_line + char)
                                current_line = ""
                                i += 1
                            else:
                                # 正常换行
                                lines.append(current_line)
                                current_line = char
                                i += 1
                        else:
                            # 单个字符就超宽，强制加入
                            lines.append(char)
                            i += 1
                
                # 添加最后一行
                if current_line:
                    lines.append(current_line)
        
        return lines
    
    def _get_text_width(self, text: str, font) -> float:
        """获取文本宽度"""
        temp_img = Image.new("RGB", (1, 1))
        temp_draw = ImageDraw.Draw(temp_img)
        try:
            return temp_draw.textlength(text, font=font)
        except AttributeError:
            bbox = temp_draw.textbbox((0, 0), text, font=font)
            return bbox[2] - bbox[0]
    
    def _is_line_start_prohibited(self, char: str) -> bool:
        """判断字符是否不能出现在行首（中文标点符号规则）"""
        # 不能出现在行首的标点符号
        prohibited_chars = (
            "，。！？；：、）】》"
            "％‰″℃」』〉〕〗〙〛"
            "︶︸︺︼︾﹀﹂﹄﹚﹜﹞"
            "）］｝"
        )
        # 单独处理引号
        if char in ['"', '"', ''', ''']:
            return True
        return char in prohibited_chars
    
    def _is_cjk_char(self, char: str) -> bool:
        """判断是否为中日韩字符"""
        return '\u4e00' <= char <= '\u9fff' or '\u3400' <= char <= '\u4dbf' or '\u3040' <= char <= '\u309f' or '\u30a0' <= char <= '\u30ff'
    
    def _create_font_with_size(self, original_font, new_size: float):
        """创建指定大小的新字体"""
        try:
            # 尝试获取字体路径并创建新字体
            if hasattr(original_font, 'path'):
                return ImageFont.truetype(original_font.path, int(new_size))
            elif hasattr(original_font, 'filename'):
                return ImageFont.truetype(original_font.filename, int(new_size))
            else:
                # 如果无法获取字体路径，返回默认字体
                return ImageFont.load_default()
        except:
            return ImageFont.load_default()
    
    def get_text_metrics(self, text: str, font, 
                        font_size: float) -> Dict[str, Any]:
        """获取文本度量信息 - 用于更精确的布局计算"""
        
        temp_img = Image.new("RGB", (1, 1))
        temp_draw = ImageDraw.Draw(temp_img)
        
        # 计算文本总宽度
        total_width = temp_draw.textlength(text, font=font)
        
        # 分析字符类型分布
        char_types = {
            'latin': 0, 'cjk': 0, 'digit': 0, 'symbol': 0, 'space': 0
        }
        
        for char in text:
            if char.isspace():
                char_types['space'] += 1
            elif char.isdigit():
                char_types['digit'] += 1
            elif ord(char) < 128:  # ASCII字符
                char_types['latin'] += 1
            elif '\u4e00' <= char <= '\u9fff':  # 中日韩字符
                char_types['cjk'] += 1
            else:
                char_types['symbol'] += 1
        
        total_chars = len(text)
        avg_char_width = total_width / total_chars if total_chars > 0 else 0
        
        return {
            'total_width': total_width,
            'avg_char_width': avg_char_width,
            'char_distribution': char_types,
            'total_chars': total_chars
        }
    
    def suggest_font_adjustments(self, text: str, bbox: Tuple[float, float, float, float],
                               font_size: float, target_language: str = "中文") -> Dict[str, float]:
        """建议字体调整 - 基于内容和语言特征"""
        
        x0, y0, x1, y1 = bbox
        width = x1 - x0
        height = y1 - y0
        
        # 基于语言的字体大小调整建议
        language_font_ratio = {
            "中文": 1.0, "简体中文": 1.0, "繁体中文": 1.0,
            "日语": 0.95, "韩语": 0.95, "英语": 0.9, "英文": 0.9,
            "阿拉伯语": 1.1, "俄语": 0.85, "德语": 0.85, "法语": 0.85
        }
        
        font_ratio = language_font_ratio.get(target_language, 1.0)
        suggested_font_size = font_size * font_ratio
        
        # 基于区域大小的调整
        area_ratio = (width * height) / (font_size * font_size * 20)  # 假设20字符的标准区域
        if area_ratio < 0.5:  # 区域太小
            suggested_font_size *= 0.8
        elif area_ratio > 2.0:  # 区域很大
            suggested_font_size *= 1.1
        
        return {
            'suggested_font_size': suggested_font_size,
            'suggested_line_height': suggested_font_size * self.get_language_line_height(target_language),
            'font_ratio': font_ratio,
            'area_ratio': area_ratio
        } 

    def _estimate_formula_width(self, formula_text: str, font_size: float) -> float:
        """更准确地估算数学公式的渲染宽度"""
        # 移除 $ 符号
        formula_content = formula_text.strip('$')
        
        # 基础字符计数（不包括 LaTeX 命令）
        visible_chars = 0
        i = 0
        while i < len(formula_content):
            if formula_content[i] == '\\':
                # 跳过 LaTeX 命令
                i += 1
                # 跳过命令名
                while i < len(formula_content) and formula_content[i].isalpha():
                    i += 1
                # 某些命令产生可见字符
                if i > 0 and formula_content[i-3:i] in ['sum', 'int', 'lim', 'sin', 'cos', 'tan', 'log', 'exp']:
                    visible_chars += 3
                elif i > 0 and formula_content[i-4:i] in ['frac', 'sqrt', 'left', 'right']:
                    visible_chars += 1
                elif i > 0 and formula_content[i-2:i] in ['pm', 'mp', 'pi']:
                    visible_chars += 1
                elif i > 0 and formula_content[i-5:i] in ['alpha', 'beta', 'gamma', 'delta', 'sigma', 'omega']:
                    visible_chars += 1
            elif formula_content[i] in '{}_^':
                # 这些是控制字符，不占用水平空间
                i += 1
            elif formula_content[i] == ' ':
                # LaTeX 中的空格通常被忽略
                i += 1
            else:
                # 普通可见字符
                visible_chars += 1
                i += 1
        
        # 根据公式复杂度调整
        if '\\frac' in formula_content:
            visible_chars = max(visible_chars * 0.7, 5)  # 分数会更紧凑
        if '\\sqrt' in formula_content:
            visible_chars += 2  # 根号需要额外空间
        if '^' in formula_content or '_' in formula_content:
            visible_chars *= 0.9  # 上下标会减少水平空间
        
        # 估算宽度：可见字符数 * 字符平均宽度
        # LaTeX 渲染的字符通常比普通文本稍宽
        estimated_width = visible_chars * font_size * 0.8
        
        # 设置最小宽度，避免过小
        min_width = font_size * 2
        return max(estimated_width, min_width) 