import os
import time
import fitz  # PyMuPDF
import numpy as np
from PIL import Image
import psutil
from typing import List, Tuple, Optional, Dict, Union
import langdetect

from ..core.data_structures import PDFPage, ProcessingState, DebugInfo
from ..config.model_config import ModelConfig
from .rotation_detector import RotationDetector

class PDFPreprocessor:
    """PDF预处理器，负责PDF文件的基本处理和页面图像生成"""
    
    def __init__(self, model_config: Optional[ModelConfig] = None, api_config: Dict = None, debug_mode: bool = False):
        """
        初始化预处理器
        Args:
            model_config: 模型配置信息
            api_config: API配置信息
            debug_mode: 是否启用调试模式
        """
        self.debug_mode = debug_mode
        self.model_config = model_config
        
        # 初始化旋转检测器，只有当model_config不为None时才初始化
        if model_config is not None:
            # 使用新的RotationDetector接口，从配置中获取参数
            rotation_model_dir = getattr(model_config, 'rotation_model_dir', None)
            rotation_use_gpu = getattr(model_config, 'rotation_use_gpu', False)
            
            self.rotation_detector = RotationDetector(
                model_dir=rotation_model_dir,
                use_gpu=rotation_use_gpu,
                debug_mode=debug_mode
            )
            if self.debug_mode:
                print("初始化旋转检测器成功")
        else:
            self.rotation_detector = None
            if self.debug_mode:
                print("旋转检测已禁用")
        
    def _get_memory_usage(self) -> float:
        """获取当前进程的内存使用量（MB）"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
        
    def _detect_language(self, text: str) -> str:
        """
        检测文本语言
        Args:
            text: 待检测的文本
        Returns:
            语言代码（如"en", "zh-cn"等）
        """
        try:
            # 如果文本太短，可能无法准确检测
            if len(text.strip()) < 10:
                return "unknown"
                
            # 使用langdetect检测语言
            lang = langdetect.detect(text)
            
            # 对于中文，统一返回zh-cn
            if lang.startswith('zh'):
                return "zh-cn"
                
            # 检测是否包含中文字符
            has_chinese = any('\u4e00' <= char <= '\u9fff' for char in text)
            has_english = any('a' <= char.lower() <= 'z' for char in text)
            
            # 如果同时包含中文和英文，返回混合语言代码
            if has_chinese and has_english:
                return "zh-en-mixed"
                
            return lang
        except Exception as e:
            if self.debug_mode:
                print(f"语言检测失败: {str(e)}")
            return "unknown"
            
    def _convert_page_to_image(self, page: 'fitz.Page', dpi: int = 300) -> Tuple[np.ndarray, str]:
        """
        将PDF页面转换为图像，并处理旋转
        Args:
            page: PDF页面对象
            dpi: 图像分辨率
        Returns:
            (图像数组, 临时文件路径)
        """
        # 获取页面旋转角度
        rotation = page.rotation
        
        # 创建转换矩阵，处理DPI和旋转
        matrix = fitz.Matrix(dpi/72, dpi/72)
        if rotation != 0:
            # 根据旋转角度调整矩阵
            matrix.prerotate(rotation)
        
        # 获取页面像素图（已包含旋转）
        pix = page.get_pixmap(matrix=matrix)  # type: ignore
        
        # 转换为PIL图像
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # 始终保存图像，以确保后续处理可以访问
        os.makedirs("File/temp", exist_ok=True)
        image_path = f"File/temp/page_{page.number + 1}.png"
        img.save(image_path)
        return np.array(img), image_path
        
    def process_pdf(self, pdf_path: str) -> Tuple[List[PDFPage], ProcessingState]:
        """
        处理PDF文件
        Args:
            pdf_path: PDF文件路径
        Returns:
            (页面信息列表, 处理状态)
        """
        start_time = time.time()
        
        # 初始化处理状态
        state = ProcessingState(
            pdf_path=pdf_path,
            current_stage="preprocessing",
            completed_stages=[],
            total_pages=0,
            debug_enabled=self.debug_mode
        )
        
        try:
            # 打开PDF文件
            doc = fitz.open(pdf_path)
            state.total_pages = len(doc)
            pages_info = []
            
            print(f"步骤1/7: 预处理 - 开始处理PDF文件: {pdf_path}, 总页数: {state.total_pages}")
            
            # 收集所有页面的文本用于语言检测
            all_text = ""
            for i in range(doc.page_count):
                page = doc.load_page(i)
                page_text = page.get_text()  # type: ignore
                if page_text.strip():
                    all_text += page_text + "\n"
            
            # 检测整个文档的主要语言
            document_language = "zh-cn"  # 默认为中文
            if all_text.strip():
                document_language = self._detect_language(all_text)
                print(f"检测到文档主要语言: {document_language}")
            
            # 处理每一页
            for i in range(doc.page_count):
                page = doc.load_page(i)
                page_start_time = time.time()
                
                print(f"页面 {i+1}/{state.total_pages} - 开始处理")
                
                # 获取页面基本信息
                rotation = page.rotation
                width, height = page.rect.width, page.rect.height
                
                # 转换为图像
                image, image_path = self._convert_page_to_image(page)
                
                # 提取文本用于语言检测
                text = page.get_text()  # type: ignore
                # 使用页面自己的语言，如果检测不到则使用文档的主要语言
                page_language = self._detect_language(text) if text.strip() else document_language
                if page_language == "unknown":
                    page_language = document_language
                
                # 创建页面信息对象
                page_info = PDFPage(
                    page_num=i+1,
                    width=width,
                    height=height,
                    dpi=300,  # 固定DPI
                    rotation=rotation,
                    detected_language=page_language,
                    image_path=image_path
                )
                
                # 如果启用了旋转检测，检测并处理页面旋转
                if self.rotation_detector is not None and image_path:
                    try:
                        detected_angle, page_info = self.rotation_detector.detect_rotation(page_info, state)
                        if detected_angle != 0:
                            print(f"页面 {i+1}/{state.total_pages} - 检测到旋转角度: {detected_angle}°，已自动旋转")
                        else:
                            print(f"页面 {i+1}/{state.total_pages} - 未检测到旋转")
                    except Exception as e:
                        print(f"页面 {i+1}/{state.total_pages} - 旋转检测失败: {str(e)}")
                else:
                    if self.rotation_detector is None:
                        print(f"页面 {i+1}/{state.total_pages} - 旋转检测已禁用")
                
                pages_info.append(page_info)
                
                # 更新处理状态
                state.processed_pages += 1
                state.progress_percentage = (state.processed_pages / state.total_pages) * 100
                
                # 记录调试信息
                if self.debug_mode:
                    debug_info = DebugInfo(
                        stage_name="preprocessing",
                        page_num=i+1,
                        processing_time=time.time() - page_start_time,
                        memory_usage=self._get_memory_usage(),
                        success=True
                    )
                    state.debug_info.append(debug_info)
                    
                page_time = time.time() - page_start_time
                print(f"页面 {i+1}/{state.total_pages} - 处理完成，耗时: {page_time:.2f}秒")
                    
            # 完成预处理
            state.completed_stages.append("preprocessing")
            total_time = time.time() - start_time
            
            print(f"步骤1/7: 预处理 - 完成，总耗时: {total_time:.2f}秒")
            print(f"处理页数: {state.processed_pages}/{state.total_pages}")
            
            # 清理旋转检测器内存
            if self.rotation_detector is not None:
                self.rotation_detector.cleanup()
                if self.debug_mode:
                    print("旋转检测器内存已清理")
                
            return pages_info, state
            
        except Exception as e:
            # 清理旋转检测器内存
            if self.rotation_detector is not None:
                self.rotation_detector.cleanup()
                if self.debug_mode:
                    print("旋转检测器内存已清理（异常情况）")
                    
            if self.debug_mode:
                debug_info = DebugInfo(
                    stage_name="preprocessing",
                    processing_time=time.time() - start_time,
                    memory_usage=self._get_memory_usage(),
                    success=False,
                    error_message=str(e)
                )
                state.debug_info.append(debug_info)
            print(f"步骤1/7: 预处理 - 失败: {str(e)}")
            raise Exception(f"PDF预处理失败: {str(e)}") 