#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
图像处理工具模块
包含图像处理、转换和保存的工具函数
"""

import os
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional

# 这里将实现图像处理相关的工具函数

def ensure_directory(directory: str) -> str:
    """
    确保目录存在，如果不存在则创建
    Args:
        directory: 目录路径
    Returns:
        创建的目录路径
    """
    os.makedirs(directory, exist_ok=True)
    return directory

def save_image(image: np.ndarray, output_path: str, format: str = "PNG") -> str:
    """
    保存图像到文件
    Args:
        image: 图像数组（OpenCV或NumPy格式）
        output_path: 输出文件路径
        format: 图像格式（PNG、JPEG等）
    Returns:
        保存的文件路径
    """
    # 确保输出目录存在
    output_dir = os.path.dirname(output_path)
    ensure_directory(output_dir)
    
    # 如果是OpenCV格式（BGR），转换为RGB
    if len(image.shape) == 3 and image.shape[2] == 3:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        image_rgb = image
    
    # 保存图像
    pil_image = Image.fromarray(image_rgb)
    
    # 先尝试以默认设置保存
    pil_image.save(output_path, format=format)
    
    # 检查文件大小是否超过5MB（5 * 1024 * 1024字节）
    if os.path.getsize(output_path) > 5 * 1024 * 1024:
        # 使用通用的图像压缩逻辑
        compress_image(output_path, output_path=output_path)
    
    return output_path

def crop_image(image: np.ndarray, x: int, y: int, width: int, height: int) -> np.ndarray:
    """
    裁剪图像
    Args:
        image: 图像数组
        x: 左上角X坐标
        y: 左上角Y坐标
        width: 裁剪宽度
        height: 裁剪高度
    Returns:
        裁剪后的图像
    """
    # 确保坐标在图像范围内
    img_height, img_width = image.shape[:2]
    x = max(0, min(x, img_width - 1))
    y = max(0, min(y, img_height - 1))
    width = min(width, img_width - x)
    height = min(height, img_height - y)
    
    # 裁剪图像
    cropped = image[y:y+height, x:x+width]
    return cropped

def resize_image(image: np.ndarray, width: Optional[int] = None, height: Optional[int] = None, 
                 keep_aspect_ratio: bool = True) -> np.ndarray:
    """
    调整图像大小
    Args:
        image: 图像数组
        width: 目标宽度，如果为None则根据高度和原始宽高比计算
        height: 目标高度，如果为None则根据宽度和原始宽高比计算
        keep_aspect_ratio: 是否保持宽高比
    Returns:
        调整大小后的图像
    """
    img_height, img_width = image.shape[:2]
    
    if width is None and height is None:
        return image
    
    if keep_aspect_ratio:
        if width is None:
            # 根据高度计算宽度
            aspect_ratio = img_width / img_height
            width = int(height * aspect_ratio)
        elif height is None:
            # 根据宽度计算高度
            aspect_ratio = img_height / img_width
            height = int(width * aspect_ratio)
        else:
            # 同时指定了宽度和高度，保持宽高比，以较小的缩放比例为准
            width_ratio = width / img_width
            height_ratio = height / img_height
            if width_ratio < height_ratio:
                height = int(img_height * width_ratio)
            else:
                width = int(img_width * height_ratio)
    else:
        # 不保持宽高比，使用指定的宽度和高度
        if width is None:
            width = img_width
        if height is None:
            height = img_height
    
    # 调整图像大小
    resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
    return resized 

def compress_image(image_path: str, output_path: Optional[str] = None) -> str:
    """
    压缩图像，主要针对PNG格式进行优化
    Args:
        image_path: 图像路径
        output_path: 输出路径，如果为None则覆盖原文件
    Returns:
        压缩后的图像路径
    """
    if output_path is None:
        output_path = image_path
    
    # 读取图像
    img = Image.open(image_path)
    
    # 确定图像格式
    format = img.format if img.format else "PNG"
    
    # 压缩图像，主要针对PNG格式
    if format.upper() == "PNG":
        # PNG格式使用优化和合理的压缩级别
        img.save(output_path, format=format, optimize=True, compress_level=6)
    else:
        # 其他格式使用默认压缩选项
        img.save(output_path, format=format, optimize=True)
    
    return output_path 

def visualize_layout(image_path: str, elements: list) -> str:
    """
    可视化版面检测结果
    
    Args:
        image_path: 原始图像路径
        elements: 检测到的版面元素列表
        
    Returns:
        str: 可视化结果图像的保存路径，如果失败则返回None
    """
    try:
        # 读取原始图像
        image = cv2.imread(image_path)
        if image is None:
            print(f"无法读取图像: {image_path}")
            return None
        
        # 创建图像副本
        vis_image = image.copy()
        
        # 定义不同元素类型的颜色 (BGR格式)
        color_map = {
            'TEXT': (0, 0, 255),                  # 红色
            'PARAGRAPH_TITLE': (255, 0, 0),       # 蓝色
            'IMAGE': (0, 255, 0),                 # 绿色
            'TABLE': (0, 255, 255),               # 黄色
            'HEADER': (255, 165, 0),              # 橙色
            'FOOTER': (128, 0, 128),              # 深紫色
            'PAGE_NUMBER': (0, 128, 0),           # 深绿色
            'FIGURE_CAPTION': (128, 128, 0),      # 橄榄色 - 图像标题
            'TABLE_CAPTION': (128, 128, 0),       # 橄榄色 - 表格标题
            'CHART_CAPTION': (128, 128, 0),       # 橄榄色 - 图表标题
            'CHEMICAL_FORMULA': (0, 128, 128),    # 青色
            'REFERENCE': (128, 0, 0),             # 深蓝色
            'ABSTRACT': (255, 105, 180),          # 粉色
            'TABLE_OF_CONTENTS': (70, 130, 180),  # 钢蓝色
            'DOCUMENT_TITLE': (255, 215, 0),      # 金色
            'FOOTNOTE': (210, 105, 30),           # 巧克力色
            'ALGORITHM': (0, 191, 255),           # 深天蓝
            'CODE_BLOCK': (139, 69, 19),          # 马鞍棕色
            'CHART': (0, 255, 127),               # 春绿色
            'ASIDE_TEXT': (255, 20, 147),         # 深粉色
            'OTHER': (128, 128, 128)              # 灰色 - 默认颜色
        }
        
        # 绘制每个元素的边界框
        for element in elements:
            # 获取边界框坐标
            x = int(element.bbox.x)
            y = int(element.bbox.y)
            w = int(element.bbox.width)
            h = int(element.bbox.height)
            
            # 获取元素类型
            element_type = element.element_type.name
            if element_type not in color_map:
                print(f"警告: 未知元素类型 '{element_type}'，显示为OTHER")
                element_type = 'OTHER'
            
            # 绘制矩形
            color = color_map[element_type]
            cv2.rectangle(vis_image, (x, y), (x + w, y + h), color, 2)
            
            # 添加标签
            label = f"{element.element_id}: {element_type}"
            cv2.putText(vis_image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # 保存可视化结果
        # 确保输出到File/pdf_to_markdown/debug/layout目录
        output_dir = "File/pdf_to_markdown/debug/layout"
        ensure_directory(output_dir)
        
        # 使用页码作为文件名的一部分
        page_num = os.path.basename(image_path).replace("page_", "").replace(".png", "")
        output_path = os.path.join(output_dir, f"page_{page_num}_layout.png")
        cv2.imwrite(output_path, vis_image)
        
        print(f"版面检测可视化结果已保存至: {output_path}")
        return output_path
    
    except Exception as e:
        print(f"可视化版面检测结果时出错: {str(e)}")
        return None

def visualize_reading_order(image_path: str, elements: list, ordered_indices: list) -> str:
    """
    可视化阅读顺序分析结果
    
    Args:
        image_path: 原始图像路径
        elements: 检测到的版面元素列表
        ordered_indices: 阅读顺序索引列表
        
    Returns:
        str: 可视化结果图像的保存路径，如果失败则返回None
    """
    try:
        # 读取原始图像
        image = cv2.imread(image_path)
        if image is None:
            print(f"无法读取图像: {image_path}")
            return None
        
        # 创建图像副本
        vis_image = image.copy()
        
        # 定义颜色 (BGR格式)
        box_color = (0, 255, 0)  # 绿色边框
        line_color = (255, 0, 0)  # 蓝色连线
        
        # 定义不同元素类型的颜色 (BGR格式)
        type_color_map = {
            'TEXT': (0, 0, 255),                  # 红色
            'PARAGRAPH_TITLE': (255, 0, 0),       # 蓝色
            'IMAGE': (0, 255, 0),                 # 绿色
            'TABLE': (0, 255, 255),               # 黄色
            'HEADER': (255, 165, 0),              # 橙色
            'FOOTER': (128, 0, 128),              # 深紫色
            'PAGE_NUMBER': (0, 128, 0),           # 深绿色
            'FIGURE_CAPTION': (128, 128, 0),      # 橄榄色 - 图像标题
            'TABLE_CAPTION': (128, 128, 0),       # 橄榄色 - 表格标题
            'CHART_CAPTION': (128, 128, 0),       # 橄榄色 - 图表标题
            'CHEMICAL_FORMULA': (0, 128, 128),    # 青色
            'REFERENCE': (128, 0, 0),             # 深蓝色
            'ABSTRACT': (255, 105, 180),          # 粉色
            'TABLE_OF_CONTENTS': (70, 130, 180),  # 钢蓝色
            'DOCUMENT_TITLE': (255, 215, 0),      # 金色
            'FOOTNOTE': (210, 105, 30),           # 巧克力色
            'ALGORITHM': (0, 191, 255),           # 深天蓝
            'CODE_BLOCK': (139, 69, 19),          # 马鞍棕色
            'CHART': (0, 255, 127),               # 春绿色
            'ASIDE_TEXT': (255, 20, 147),         # 深粉色
            'OTHER': (128, 128, 128)              # 灰色 - 默认颜色
        }
        
        # 创建元素ID到元素的映射
        element_map = {element.element_id: element for element in elements}
        
        # 获取有序的元素列表
        ordered_elements = []
        for idx, order_elem in enumerate(ordered_indices):
            if isinstance(order_elem, int) and order_elem < len(elements):
                # 处理整数索引的情况
                ordered_elements.append(elements[order_elem])
            elif hasattr(order_elem, 'element_id') and order_elem.element_id in element_map:
                # 处理ReadingOrderElement对象的情况
                ordered_elements.append(element_map[order_elem.element_id])
        
        # 绘制每个元素的边界框和顺序编号
        for i, element in enumerate(ordered_elements):
            # 获取边界框坐标
            x = int(element.bbox.x)
            y = int(element.bbox.y)
            w = int(element.bbox.width)
            h = int(element.bbox.height)
            
            # 计算中心点
            center_x = x + w // 2
            center_y = y + h // 2
            
            # 获取元素类型
            element_type = element.element_type.name
            if element_type not in type_color_map:
                print(f"警告: 未知元素类型 '{element_type}'，显示为OTHER")
                element_type = 'OTHER'
                
            # 获取对应的颜色
            type_color = type_color_map[element_type]
            
            # 绘制矩形
            cv2.rectangle(vis_image, (x, y), (x + w, y + h), type_color, 2)
            
            # 添加顺序编号和类型标签
            label = f"{i + 1}: {element_type}"
            cv2.putText(vis_image, label, (center_x - 10, center_y + 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # 绘制连接线
            if i > 0:
                prev_element = ordered_elements[i - 1]
                prev_x = int(prev_element.bbox.x + prev_element.bbox.width // 2)
                prev_y = int(prev_element.bbox.y + prev_element.bbox.height // 2)
                cv2.line(vis_image, (prev_x, prev_y), (center_x, center_y), line_color, 2)
        
        # 保存可视化结果
        # 确保输出到File/pdf_to_markdown/debug/order目录
        output_dir = "File/pdf_to_markdown/debug/order"
        ensure_directory(output_dir)
        
        # 使用页码作为文件名的一部分
        page_num = os.path.basename(image_path).replace("page_", "").replace(".png", "")
        output_path = os.path.join(output_dir, f"page_{page_num}_order.png")
        cv2.imwrite(output_path, vis_image)
        
        print(f"阅读顺序可视化结果已保存至: {output_path}")
        return output_path
    
    except Exception as e:
        print(f"可视化阅读顺序分析结果时出错: {str(e)}")
        return None 