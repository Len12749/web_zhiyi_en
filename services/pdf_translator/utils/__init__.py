import os
from .textwrap_local import fw_fill, fw_wrap
from .ocr_model import OCRModel
from .layout_model import LayoutAnalyzer

import yaml
import re
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import matplotlib.mathtext as mathtext
from io import BytesIO


__all__ = ["fw_fill", "fw_wrap", "fw_fill_with_math_protection", "OCRModel", "LayoutAnalyzer", "load_config", "draw_text"]

def load_config(base_config_path, override_config_path=None):
    # Update the base config with the override config
    # This recursively updates nested dictionaries
    def update(d, u):
        for k, v in u.items():
            if isinstance(v, dict):
                d[k] = update(d.get(k, {}), v)
            else:
                d[k] = v
        return d

    with open(base_config_path, 'r', encoding='utf-8') as base_file:
        base_config = yaml.safe_load(base_file)
    
    final_config = base_config

    if override_config_path and os.path.exists(override_config_path):
        with open(override_config_path, 'r', encoding='utf-8') as override_file:
            override_config = yaml.safe_load(override_file)
            final_config = update(base_config, override_config)

    return final_config





def render_math_formula(formula_text, font_size=20, dpi=150, color="black"):
    """
    使用matplotlib渲染数学公式，与文本大小匹配
    
    Args:
        formula_text: 数学公式文本（LaTeX格式，包含$...$）
        font_size: 字体大小（与文本相匹配）
        dpi: 分辨率
        color: 颜色
        
    Returns:
        PIL.Image: 渲染后的公式图像，如果失败则返回None
    """
    try:
        # 使用简单可靠的figure方法
        # 调整字体大小以更好地匹配文本
        adjusted_font_size = font_size * 0.6  # 更小以便与文本相容
        
        # 创建一个小的figure
        fig = plt.figure(figsize=(0.1, 0.1), dpi=dpi)
        ax = fig.add_subplot(111)
        ax.axis('off')
        
        # 渲染文本，使用紧凑的位置
        text_obj = ax.text(0, 0, formula_text, fontsize=adjusted_font_size, 
                          color=color, ha='left', va='bottom')
        
        # 保存到buffer，使用紧凑的边界框
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=dpi, bbox_inches='tight', 
                   pad_inches=0.02, transparent=True, facecolor='none')
        buf.seek(0)
        
        # 转换为PIL Image
        formula_image = Image.open(buf)
        
        # 关闭figure
        plt.close(fig)
        
        # 如果图像太高，进行缩放以匹配文本行高
        max_height = int(font_size * 1.1)  # 最大高度为字体大小的1.1倍，更小以便相容
        if formula_image.height > max_height:
            # 按比例缩放
            scale_factor = max_height / formula_image.height
            new_width = int(formula_image.width * scale_factor)
            formula_image = formula_image.resize((new_width, max_height), Image.Resampling.LANCZOS)
        
        return formula_image
        
    except Exception as e:
        print(f"  ⚠️ 数学公式渲染失败: {e}")
        return None


def parse_text_with_math(text, font_size=20):
    """
    解析包含数学公式的文本
    
    Args:
        text: 包含$...$格式数学公式的文本
        font_size: 字体大小
        
    Returns:
        list: 包含文本片段和公式图像的列表
    """
    # 正则表达式匹配 $...$ 格式的数学公式
    math_pattern = r'\$([^$]+)\$'
    
    parts = []
    last_end = 0
    
    for match in re.finditer(math_pattern, text):
        # 添加公式前的文本
        if match.start() > last_end:
            before_text = text[last_end:match.start()]
            if before_text.strip():
                parts.append(('text', before_text))
        
        # 添加数学公式
        formula_content = match.group(1)
        formula_text = f'${formula_content}$'  # 保留$符号
        
        # 渲染公式
        formula_image = render_math_formula(formula_text, font_size)
        if formula_image:
            parts.append(('math', formula_image))
        else:
            # 如果渲染失败，保留原文本
            parts.append(('text', formula_text))
        
        last_end = match.end()
    
    # 添加最后一段文本
    if last_end < len(text):
        remaining_text = text[last_end:]
        if remaining_text.strip():
            parts.append(('text', remaining_text))
    
    # 如果没有找到数学公式，返回原始文本
    if not parts:
        parts.append(('text', text))
    
    return parts


def draw_text_with_math(draw, text, font, font_size, width, ygain, start_y=0):
    """
    绘制包含数学公式的文本
    
    Args:
        draw: PIL ImageDraw对象
        text: 包含数学公式的文本
        font: 字体对象
        font_size: 字体大小
        width: 可用宽度
        ygain: 行间距
        start_y: 起始Y坐标
        
    Returns:
        int: 绘制后的Y坐标
    """
    y = start_y
    
    # 按行处理文本
    for line in text.split('\n'):
        if not line.strip():
            y += ygain
            continue
            
        # 解析这一行的文本和数学公式
        parts = parse_text_with_math(line, font_size)
        
        # 计算这一行的总宽度，用于居中或对齐
        total_width = 0
        for part_type, content in parts:
            if part_type == 'text':
                total_width += draw.textlength(content, font=font)
            elif part_type == 'math':
                total_width += content.width
        
        # 绘制这一行
        x = 40  # 固定缩进
        for part_type, content in parts:
            if part_type == 'text' and content.strip():
                # 绘制普通文本
                draw.text((x, y), content, font=font, fill="black")
                x += draw.textlength(content, font=font)
            elif part_type == 'math':
                # 绘制数学公式图像
                try:
                    # 将RGBA图像转换为RGB，背景设为白色
                    if content.mode == 'RGBA':
                        # 创建白色背景
                        white_bg = Image.new('RGB', content.size, (255, 255, 255))
                        white_bg.paste(content, mask=content.split()[-1])  # 使用alpha通道作为mask
                        content = white_bg
                    
                    # 改进的基线对齐计算
                    # 让公式更好地与文本基线对齐
                    text_baseline_offset = int(font_size * 0.15)  # 减小基线偏移
                    formula_y = y + int(font_size * 0.7) - content.height + text_baseline_offset
                    
                    # 确保公式不会太高而超出行边界
                    if formula_y < y:
                        formula_y = y
                    
                    # 粘贴公式图像
                    draw._image.paste(content, (int(x), int(formula_y)))
                    x += content.width + 2  # 添加小间距
                except Exception as e:
                    print(f"  ⚠️ 公式图像绘制失败: {e}")
                    # 如果绘制失败，绘制原始文本
                    fallback_text = f"${content}$"
                    draw.text((x, y), fallback_text, font=font, fill="black")
                    x += draw.textlength(fallback_text, font=font)
        
        y += ygain
    
    return y


def draw_text(draw, processed_text, current_fnt, font_size, width, ygain):
    """
    改进的文本渲染函数 - 支持数学公式渲染
    """
    # 检查文本是否包含数学公式
    if '$' in processed_text:
        # 使用数学公式渲染
        return draw_text_with_math(draw, processed_text, current_fnt, font_size, width, ygain)
    else:
        # 使用原始的简单文本渲染
        y = 0
        first = len(processed_text.split("\n")) > 1
        for l in processed_text.split("\n"):
            words = l.split(" ")
            if not words:  # 空行处理
                y += ygain
                first = False
                continue
                
            # 计算所有单词的总宽度
            words_length = sum(draw.textlength(w, font=current_fnt) for w in words)
            
            # 第一行缩进处理
            indent = 40 if first else 0
            available_width = width - indent
            
            # 如果单行文本或者只有一个单词，简单居左对齐
            if len(words) == 1:
                x = indent
                # 边界检查 - 确保单词不会超出边界
                word_width = draw.textlength(words[0], font=current_fnt)
                if x + word_width <= width:
                    draw.text((x, y), words[0], font=current_fnt, fill="black")
            else:
                # 多单词情况 - 修复间距计算
                # 计算单词间的空间数量（单词数-1）
                num_spaces = len(words) - 1
                
                # 检查文本是否会超出边界
                if words_length <= available_width:
                    # 文本适合，计算均匀间距
                    remaining_space = available_width - words_length
                    space_length = remaining_space / num_spaces if num_spaces > 0 else 0
                    
                    # 限制最大间距避免过度拉伸
                    max_space = font_size / 2.4
                    space_length = min(space_length, max_space)
                else:
                    # 文本过长，使用最小间距
                    space_length = draw.textlength(" ", font=current_fnt)
                
                # 绘制单词
                x = indent
                for i, word in enumerate(words):
                    word_width = draw.textlength(word, font=current_fnt)
                    
                    # 边界检查 - 确保单词不会超出右边界
                    if x + word_width <= width:
                        draw.text((x, y), word, font=current_fnt, fill="black")
                        x += word_width
                        
                        # 添加间距（除了最后一个单词）
                        if i < len(words) - 1:
                            x += space_length
                    else:
                        # 如果单词会超出边界，停止绘制这一行
                        break
            
            y += ygain
            first = False
        
        return y


def fw_fill_with_math_protection(text, width):
    """
    保护数学公式的文本换行函数
    
    Args:
        text: 包含数学公式的文本
        width: 每行的字符数限制
        
    Returns:
        换行后的文本，数学公式不会被分割
    """
    if not text:
        return ""
    
    # 如果没有数学公式，使用原始的换行函数
    if '$' not in text:
        return fw_fill(text, width)
    
    # 识别数学公式块
    import re
    math_pattern = r'\$([^$]+)\$'
    
    # 分割文本为文本片段和数学公式片段
    parts = []
    last_end = 0
    
    for match in re.finditer(math_pattern, text):
        # 添加公式前的文本
        if match.start() > last_end:
            before_text = text[last_end:match.start()]
            if before_text:
                parts.append(('text', before_text))
        
        # 添加数学公式（作为一个整体单元）
        formula_text = match.group(0)  # 包含$符号的完整公式
        parts.append(('math', formula_text))
        
        last_end = match.end()
    
    # 添加最后一段文本
    if last_end < len(text):
        remaining_text = text[last_end:]
        if remaining_text:
            parts.append(('text', remaining_text))
    
    # 如果没有找到数学公式，返回原始换行结果
    if not parts:
        return fw_fill(text, width)
    
    # 智能换行：将文本和数学公式作为不可分割的单元处理
    lines = []
    current_line = ""
    
    for part_type, content in parts:
        if part_type == 'text':
            # 处理普通文本：按字符逐个添加
            for char in content:
                if len(current_line + char) <= width:
                    current_line += char
                else:
                    # 当前行满了，换行
                    if current_line.strip():
                        lines.append(current_line.rstrip())
                    current_line = char
        
        elif part_type == 'math':
            # 处理数学公式：作为一个整体单元
            if len(current_line + content) <= width:
                # 公式可以放在当前行
                current_line += content
            else:
                # 公式放不下，需要换行
                if current_line.strip():
                    lines.append(current_line.rstrip())
                current_line = content
    
    # 添加最后一行
    if current_line.strip():
        lines.append(current_line.rstrip())
    
    return '\n'.join(lines)