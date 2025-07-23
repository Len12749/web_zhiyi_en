#!/usr/bin/env python3
"""
PDF 翻译命令行工具
支持PDF文档的布局检测、OCR识别和AI翻译
"""

import argparse
import tempfile
from pathlib import Path
from typing import List, Tuple, Union, Optional
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # 使用非交互式后端
import numpy as np
import PyPDF2
from PIL import Image, ImageDraw, ImageFont
from tqdm import tqdm
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import time

# 导入PDF处理库
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

from utils import fw_fill, fw_fill_with_math_protection, load_config, draw_text
from modules import load_translator, load_layout_engine, load_ocr_engine, load_font_engine
import queue
import threading

class GPUResourceManager:
    """GPU资源管理器 - 控制GPU任务的并发数量"""
    
    def __init__(self, gpu_queue_size: int = 2):
        self.gpu_semaphore = threading.Semaphore(gpu_queue_size)
        self.gpu_queue_size = gpu_queue_size
        print(f"🎮 GPU资源管理器初始化完成，GPU队列大小: {gpu_queue_size}")
    
    def acquire_gpu(self):
        """获取GPU资源"""
        self.gpu_semaphore.acquire()
    
    def release_gpu(self):
        """释放GPU资源"""
        self.gpu_semaphore.release()
    
    def gpu_task(self, func, *args, **kwargs):
        """执行GPU任务的包装器"""
        self.acquire_gpu()
        try:
            return func(*args, **kwargs)
        finally:
            self.release_gpu()

class PDFTranslator:
    """PDF翻译器核心类"""
    
    def __init__(self, config_path: str = "config.yaml"):
        """初始化翻译器"""
        print("🚀 初始化PDF翻译器...")
        
        # 加载配置
        self.cfg = load_config(config_path)
        
        # 初始化各个模块
        print("📚 加载翻译模块...")
        self.translator = load_translator(self.cfg['translator'])
        
        print("📄 加载布局检测模块...")
        self.layout_engine = load_layout_engine(self.cfg['layout'])
        
        print("🔍 加载OCR识别模块...")
        self.ocr_engine = load_ocr_engine(self.cfg['ocr'])
        
        print("🎨 加载字体处理模块...")
        self.font_engine = load_font_engine(self.cfg['font'])
        
        # 设置DPI
        self.DPI = self.cfg['layout'].get('DPI', 200)
        
        # 并行处理配置
        parallel_cfg = self.cfg.get('parallel', {})
        self.enable_page_parallel = parallel_cfg.get('enable_page_parallel', True)
        self.max_page_workers = parallel_cfg.get('max_page_workers', 4)
        self.enable_text_parallel = parallel_cfg.get('enable_text_parallel', True)
        
        # 资源分配配置
        resource_cfg = parallel_cfg.get('resource_allocation', {})
        self.gpu_queue_size = resource_cfg.get('gpu_queue_size', 2)
        self.cpu_intensive_workers = resource_cfg.get('cpu_intensive_workers', 6)
        
        # 初始化GPU资源管理器
        self.gpu_manager = GPUResourceManager(self.gpu_queue_size)
        
        print("🔄 并行处理配置:")
        print(f"  📄 页面级并行: {'启用' if self.enable_page_parallel else '禁用'}")
        print(f"  🧵 页面并行线程数: {self.max_page_workers}")
        print(f"  📝 文本级并行: {'启用' if self.enable_text_parallel else '禁用'}")
        print(f"  🎮 GPU队列大小: {self.gpu_queue_size}")
        print(f"  💻 CPU密集型线程数: {self.cpu_intensive_workers}")
        
        print("✅ 初始化完成!")

    def _process_single_page(self, page_data: Tuple[int, Image.Image], from_lang: str, to_lang: str, temp_path: Path, side_by_side: bool = False) -> Tuple[int, Path]:
        """处理单个页面的函数 - 支持并行调用"""
        page_index, image = page_data
        
        try:
            print(f"🔄 处理第 {page_index+1} 页...")
            
            # 1. 布局检测 (GPU任务)
            print(f"  📋 布局检测 (页面{page_index+1})...")
            layout_result = self.gpu_manager.gpu_task(self.layout_engine.get_single_layout, image)
            
            # 2. OCR识别 (GPU任务)
            print(f"  🔍 OCR识别 (页面{page_index+1})...")
            ocr_result = self.gpu_manager.gpu_task(self.ocr_engine.get_all_text, layout_result)
            
            # 3. 翻译
            print(f"  🌐 翻译 (页面{page_index+1})...")
            translated_result = self.translator.translate_all(ocr_result, from_lang, to_lang)
            
            # 4. 字体处理
            print(f"  🎨 字体处理 (页面{page_index+1})...")
            font_result = self.font_engine.get_all_fonts(translated_result)
            
            # 5. 生成翻译后的图像
            print(f"  🖼️ 生成翻译图像 (页面{page_index+1})...")
            translated_image = self._render_translated_page(image, font_result)
            
            # 6. 保存为PDF
            output_page_path = temp_path / f"page_{page_index:03d}.pdf"
            self._save_as_pdf(translated_image, output_page_path, side_by_side, image if side_by_side else None)
            
            print(f"✅ 页面 {page_index+1} 处理完成")
            return page_index, output_page_path
            
        except Exception as e:
            print(f"❌ 页面 {page_index+1} 处理失败: {e}")
            # 创建一个空的PDF页面作为备用
            empty_image = Image.new('RGB', image.size, 'white')
            output_page_path = temp_path / f"page_{page_index:03d}.pdf"
            self._save_as_pdf(empty_image, output_page_path, side_by_side, image if side_by_side else None)
            return page_index, output_page_path

    def _process_pages_parallel(self, pages_to_process: List[Tuple[int, Image.Image]], from_lang: str, to_lang: str, temp_path: Path, side_by_side: bool = False) -> List[Path]:
        """并行处理多个页面"""
        pdf_files: List[Optional[Path]] = [None] * len(pages_to_process)  # 预分配列表，保持页面顺序
        
        with ThreadPoolExecutor(max_workers=self.max_page_workers) as executor:
            # 提交所有页面处理任务
            future_to_page = {
                executor.submit(self._process_single_page, page_data, from_lang, to_lang, temp_path, side_by_side): page_data[0]
                for page_data in pages_to_process
            }
            
            # 收集处理结果
            with tqdm(total=len(pages_to_process), desc="并行处理页面") as pbar:
                for future in as_completed(future_to_page):
                    try:
                        page_index, output_path = future.result()
                        # 找到在处理列表中的位置
                        list_index = next(i for i, (idx, _) in enumerate(pages_to_process) if idx == page_index)
                        pdf_files[list_index] = output_path
                        pbar.set_postfix({"当前页": f"{page_index+1}"})
                    except Exception as e:
                        print(f"❌ 页面处理失败: {e}")
                    pbar.update(1)
        
        # 过滤掉None值
        return [f for f in pdf_files if f is not None]

    def _process_pages_sequential(self, pages_to_process: List[Tuple[int, Image.Image]], from_lang: str, to_lang: str, temp_path: Path, side_by_side: bool = False) -> List[Path]:
        """串行处理多个页面"""
        pdf_files = []
        
        for page_data in tqdm(pages_to_process, desc="串行处理页面"):
            try:
                page_index, output_path = self._process_single_page(page_data, from_lang, to_lang, temp_path, side_by_side)
                pdf_files.append(output_path)
            except Exception as e:
                print(f"❌ 页面 {page_data[0]+1} 处理失败: {e}")
        
        return pdf_files

    def _convert_pdf_to_images(self, pdf_path: Path) -> List[Image.Image]:
        """
        将PDF转换为图像列表，使用PyMuPDF
        """
        print("🔄 转换PDF为图像...")
        
        # 使用PyMuPDF转换
        if PYMUPDF_AVAILABLE:
            try:
                pdf_images = []
                pdf_document = fitz.open(pdf_path)
                
                for page_num in range(len(pdf_document)):
                    page = pdf_document[page_num]
                    
                    # 设置缩放比例以达到所需DPI
                    zoom = self.DPI / 72.0  # 72是PDF的默认DPI
                    mat = fitz.Matrix(zoom, zoom)
                    
                    # 渲染页面为图像
                    try:
                        pix = page.get_pixmap(matrix=mat)
                    except AttributeError:
                        # 处理版本兼容性问题
                        pix = page.getPixmap(matrix=mat)
                    
                    img_data = pix.tobytes("ppm")
                    
                    # 转换为PIL Image
                    from io import BytesIO
                    img = Image.open(BytesIO(img_data))
                    pdf_images.append(img)
                
                pdf_document.close()
                print(f"  ✅ PyMuPDF转换成功，共{len(pdf_images)}页")
                return pdf_images
                
            except Exception as e:
                print(f"  ❌ PyMuPDF转换失败: {e}")
        
        # 如果PyMuPDF不可用或转换失败
        raise RuntimeError(
            "PDF转换失败。请确保安装了PyMuPDF：\n"
            "pip install PyMuPDF"
        )

    def translate_pdf(
        self, 
        pdf_path: Path, 
        output_path: Path, 
        from_lang: str = "英语", 
        to_lang: str = "中文",
        page_start: int = 0,
        page_end: int = 0,
        side_by_side: bool = False
    ) -> None:
        """
        翻译PDF文件
        
        Args:
            pdf_path: 输入PDF文件路径
            output_path: 输出PDF文件路径
            from_lang: 源语言
            to_lang: 目标语言
            page_start: 起始页码（从0开始）
            page_end: 结束页码（0表示到最后一页）
            side_by_side: 是否并排显示原文和译文
        """
        print(f"📖 开始翻译PDF: {pdf_path}")
        print(f"🌍 翻译语言: {from_lang} -> {to_lang}")
        
        # 设置字体引擎的目标语言
        if hasattr(self.font_engine, 'set_target_language'):
            self.font_engine.set_target_language(to_lang)
        
        # 转换PDF为图像
        pdf_images = self._convert_pdf_to_images(pdf_path)
        
        # 创建临时目录
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # 筛选需要处理的页面
            pages_to_process = []
            for i, image in enumerate(pdf_images):
                if i < page_start:
                    continue
                if page_end > 0 and i >= page_end:
                    break
                pages_to_process.append((i, image))
            
            total_pages = len(pages_to_process)
            print(f"📄 总共需要处理 {total_pages} 页")
            
            # 决定是否使用并行处理
            if self.enable_page_parallel and total_pages > 1:
                # 页面级并行处理
                print(f"🚀 启用页面级并行处理 (使用{self.max_page_workers}个线程)")
                pdf_files = self._process_pages_parallel(pages_to_process, from_lang, to_lang, temp_path, side_by_side)
            else:
                # 串行处理
                print("🔄 使用串行处理")
                pdf_files = self._process_pages_sequential(pages_to_process, from_lang, to_lang, temp_path, side_by_side)
            
            # 7. 合并PDF
            print("📚 合并PDF文件...")
            self._merge_pdfs(pdf_files, output_path)
            
        print(f"✅ 翻译完成! 输出文件: {output_path}")

    def _get_font_path(self, font_family: str):
        """获取字体对象，支持系统字体和本地字体，包括.ttc格式"""
        if font_family == 'default':
            # 使用PIL默认字体
            return ImageFont.load_default()
        
        # 尝试多个可能的字体路径 - 增强字体文件映射
        possible_paths = [
            # 绝对路径（如果font_family是完整路径）
            font_family,
            # 本地字体目录
            f"fonts/{font_family}",
            # Windows系统字体
            f"C:/Windows/Fonts/{font_family}",
        ]
        
        # 增强字体文件映射 - 添加实际存在的字体文件
        font_mapping = {
            # 中文字体映射
            'simhei.ttf': ['fonts/simhei.ttf', 'C:/Windows/Fonts/simhei.ttf'],
            'msyh.ttc': ['fonts/msyh.ttc', 'C:/Windows/Fonts/msyh.ttc'],
            'simsun.ttc': ['fonts/simsun.ttc', 'C:/Windows/Fonts/simsun.ttc'],
            'NotoSansSC-VF.ttf': ['fonts/NotoSansSC-VF.ttf'],
            'SourceHanSerifCN-Bold.ttf': ['fonts/SourceHanSerifCN-Bold.ttf'],
            # 英文字体映射
            'TimesNewRoman.ttf': ['fonts/TimesNewRoman.ttf', 'C:/Windows/Fonts/times.ttf'],
            'FreeMono.ttf': ['fonts/FreeMono.ttf'],
            'arial.ttf': ['fonts/arial.ttf', 'C:/Windows/Fonts/arial.ttf'],
            'calibri.ttf': ['fonts/calibri.ttf', 'C:/Windows/Fonts/calibri.ttf'],
        }
        
        # 如果字体在映射中，优先使用映射的路径
        if font_family in font_mapping:
            possible_paths.extend(font_mapping[font_family])
        
        # 针对中文字体的备选方案
        if any(chinese in font_family.lower() for chinese in ['sim', 'msyh', 'hei', 'kai', 'noto', 'source']):
            possible_paths.extend([
                "fonts/msyh.ttc",                    # 微软雅黑
                "fonts/simhei.ttf",                  # 黑体
                "fonts/simsun.ttc",                  # 宋体
                "fonts/NotoSansSC-VF.ttf",           # Noto Sans SC（支持CJK）
                "fonts/SourceHanSerifCN-Bold.ttf",   # 思源宋体
                "C:/Windows/Fonts/msyh.ttc",         # 系统微软雅黑
                "C:/Windows/Fonts/simhei.ttf",       # 系统黑体
                "C:/Windows/Fonts/simsun.ttc",       # 系统宋体
            ])
        
        # 如果是NotoSans字体（支持日语），确保能找到
        if 'noto' in font_family.lower():
            possible_paths.insert(0, "fonts/NotoSansSC-VF.ttf")
        # 如果是NotoSans字体（支持日语、韩语），确保能找到
        if 'noto' in font_family.lower():
            possible_paths.insert(0, "fonts/NotoSansSC-VF.ttf")
            possible_paths.insert(0, "fonts/NotoSansCJKjp-Regular.otf")
            possible_paths.insert(0, "fonts/NotoSansCJKkr-Regular.otf")
        
        # 针对日语字体
        if 'jp' in font_family.lower() or 'japanese' in font_family.lower():
            possible_paths.insert(0, "fonts/NotoSansCJKjp-Regular.otf")
            possible_paths.insert(0, "fonts/NotoSansJP-Regular.ttf")
            
        # 针对韩语字体
        if 'kr' in font_family.lower() or 'korean' in font_family.lower():
            possible_paths.insert(0, "fonts/NotoSansCJKkr-Regular.otf")
            possible_paths.insert(0, "fonts/NotoSansKR-Regular.ttf")
        
        # 尝试加载字体
        for font_path in possible_paths:
            try:
                if os.path.exists(font_path):
                    # 对于.ttc格式的字体文件，需要特殊处理
                    if font_path.lower().endswith('.ttc'):
                        # 尝试加载.ttc文件的第一个字体
                        try:
                            return ImageFont.truetype(font_path, size=20, index=0)
                        except Exception:
                            # 如果指定索引失败，尝试不指定索引
                            return ImageFont.truetype(font_path, size=20)
                    else:
                        # 对于.ttf格式的字体文件
                        return ImageFont.truetype(font_path, size=20)
            except Exception as e:
                print(f"  ⚠️ 尝试加载字体失败: {font_path} - {e}")
                continue
        
        # 如果都失败了，使用默认字体
        print(f"  ⚠️ 无法找到字体 {font_family}，使用默认字体")
        return ImageFont.load_default()

    def _render_translated_page(self, original_image: Image.Image, layout_result: List) -> Image.Image:
        """渲染翻译后的页面 - 使用改进的自适应布局逻辑"""
        from modules.layout.adaptive_layout import AdaptiveLayoutRenderer
        
        img = np.array(original_image, dtype=np.uint8)
        
        # 创建自适应布局渲染器
        adaptive_renderer = AdaptiveLayoutRenderer()
        
        # 获取目标语言
        target_language = getattr(self.font_engine, '_target_language', '中文')
        
        for line in layout_result:
            if line.type in ["text", "list"] and line.translated_text:
                # 获取边界框
                bbox = line.bbox
                height = bbox[3] - bbox[1]
                width = bbox[2] - bbox[0]
                
                # 创建字体对象
                font = None
                try:
                    font = ImageFont.truetype('fonts/' + line.font['family'], line.font['size'])
                except:
                    try:
                        font_path = self._get_font_path(line.font["family"])
                        if hasattr(font_path, 'path'):
                            font = ImageFont.truetype(font_path.path, line.font['size'])
                        else:
                            font = ImageFont.load_default()
                    except:
                        font = ImageFont.load_default()
                
                # 使用自适应布局计算最优布局
                layout_segment = adaptive_renderer.calculate_adaptive_layout(
                    text=line.translated_text,
                    bbox=bbox,
                    font=font,
                    font_size=line.font['size'],
                    target_language=target_language
                )
                
                # 如果布局计算调整了字体大小，创建新字体
                if layout_segment.font_size != line.font['size']:
                    try:
                        # 尝试使用相同的字体文件创建新大小的字体
                        if hasattr(font, 'path'):
                            adjusted_font = ImageFont.truetype(font.path, int(layout_segment.font_size))
                        elif hasattr(font, 'filename'):
                            adjusted_font = ImageFont.truetype(font.filename, int(layout_segment.font_size))
                        else:
                            # 尝试使用原始字体家族
                            try:
                                adjusted_font = ImageFont.truetype(
                                    'fonts/' + line.font['family'], 
                                    int(layout_segment.font_size)
                                )
                            except:
                                font_path = self._get_font_path(line.font["family"])
                                if hasattr(font_path, 'path'):
                                    adjusted_font = ImageFont.truetype(font_path.path, int(layout_segment.font_size))
                                else:
                                    adjusted_font = font  # 保持原字体
                        font = adjusted_font
                    except Exception as e:
                        print(f"  ⚠️ 字体大小调整失败: {e}")
                        # 如果调整失败，继续使用原字体
                
                # 创建文本块
                new_block = Image.new("RGB", (int(width), int(height)), color=(255, 255, 255))
                draw = ImageDraw.Draw(new_block)
                
                # 使用自适应布局渲染文本
                adaptive_renderer.render_adaptive_text(
                    draw=draw,
                    text=line.translated_text,
                    layout_segment=layout_segment,
                    font=font,
                    target_language=target_language
                )
                
                # 替换原图像中的文本区域
                new_block = np.array(new_block)
                img[int(bbox[1]):int(bbox[3]), int(bbox[0]):int(bbox[2])] = new_block
        
        return Image.fromarray(img)

    def _save_as_pdf(self, image: Image.Image, output_path: Path, side_by_side: bool = False, original_image: Optional[Image.Image] = None):
        """保存图像为PDF - 支持自动扩展，不受右边距限制"""
        if side_by_side and original_image is not None:
            # 并排显示 - 根据图像实际大小动态调整
            original_width, original_height = original_image.size
            translated_width, translated_height = image.size
            
            # 计算合适的figure尺寸
            total_width = original_width + translated_width
            max_height = max(original_height, translated_height)
            
            # 根据图像比例计算figure尺寸
            dpi = self.DPI
            fig_width = total_width / dpi * 1.2  # 增加一些边距
            fig_height = max_height / dpi * 1.2
            
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(fig_width, fig_height))
            
            # 左侧显示原文
            ax1.imshow(original_image)
            ax1.set_title("原文", fontsize=14, fontweight='bold')
            ax1.axis("off")
            
            # 右侧显示译文（不受右边距限制）
            ax2.imshow(image)
            ax2.set_title("译文", fontsize=14, fontweight='bold')
            ax2.axis("off")
            
            # 调整子图间距
            plt.subplots_adjust(wspace=0.02, hspace=0.02)
            
        else:
            # 只显示翻译后的图像 - 根据图像实际大小动态调整
            img_width, img_height = image.size
            
            # 根据图像比例计算figure尺寸
            dpi = self.DPI
            fig_width = img_width / dpi * 1.1  # 增加一些边距
            fig_height = img_height / dpi * 1.1
            
            fig, ax = plt.subplots(1, 1, figsize=(fig_width, fig_height))
            ax.imshow(image)
            ax.axis("off")
        
        plt.tight_layout()
        plt.savefig(output_path, format="pdf", dpi=self.DPI, bbox_inches='tight', 
                   pad_inches=0.1, facecolor='white')
        plt.close(fig)

    def _merge_pdfs(self, pdf_files: List[Path], output_path: Path):
        """合并多个PDF文件"""
        pdf_merger = PyPDF2.PdfMerger()
        
        for pdf_file in sorted(pdf_files):
            if pdf_file.exists():
                pdf_merger.append(str(pdf_file))
        
        with open(output_path, 'wb') as output_file:
            pdf_merger.write(output_file)
        
        pdf_merger.close()

def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="PDF翻译工具 - 支持布局保持的PDF文档翻译",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  python cli.py -i document.pdf -o translated.pdf --from-lang 英语 --to-lang 中文
  python cli.py -i document.pdf -o translated.pdf --from-lang 英语 --to-lang 中文 --page-start 1 --page-end 5
  python cli.py -i document.pdf -o translated.pdf --from-lang 英语 --to-lang 中文 --side-by-side
        """
    )
    
    parser.add_argument(
        "-i", "--input", 
        type=Path, 
        required=True,
        help="输入PDF文件路径"
    )
    
    parser.add_argument(
        "-o", "--output", 
        type=Path, 
        required=True,
        help="输出PDF文件路径"
    )
    
    parser.add_argument(
        "--from-lang", 
        default="英语",
        help="源语言 (默认: 英语)"
    )
    
    parser.add_argument(
        "--to-lang", 
        default="中文",
        help="目标语言 (默认: 中文)"
    )
    
    parser.add_argument(
        "--page-start", 
        type=int, 
        default=0,
        help="起始页码，从0开始 (默认: 0)"
    )
    
    parser.add_argument(
        "--page-end", 
        type=int, 
        default=0,
        help="结束页码，0表示到最后一页 (默认: 0)"
    )
    
    parser.add_argument(
        "--side-by-side", 
        action="store_true",
        help="并排显示原文和译文"
    )
    
    parser.add_argument(
        "--config", 
        type=Path, 
        default="config.yaml",
        help="配置文件路径 (默认: config.yaml)"
    )
    
    args = parser.parse_args()
    
    # 检查输入文件
    if not args.input.exists():
        print(f"❌ 错误: 输入文件不存在: {args.input}")
        return
    
    if not args.input.suffix.lower() == '.pdf':
        print(f"❌ 错误: 输入文件必须是PDF格式: {args.input}")
        return
    
    # 创建输出目录
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # 检查配置文件
    if not args.config.exists():
        print(f"❌ 错误: 配置文件不存在: {args.config}")
        return
    
    # 检查PDF处理库
    if not PYMUPDF_AVAILABLE:
        print("❌ 错误: 没有可用的PDF处理库")
        print("请安装PyMuPDF：")
        print("pip install PyMuPDF")
        return
    
    try:
        # 初始化翻译器
        translator = PDFTranslator(str(args.config))
        
        # 执行翻译
        translator.translate_pdf(
            pdf_path=args.input,
            output_path=args.output,
            from_lang=args.from_lang,
            to_lang=args.to_lang,
            page_start=args.page_start,
            page_end=args.page_end,
            side_by_side=args.side_by_side
        )
        
    except Exception as e:
        print(f"❌ 翻译过程中发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
