import os
import time
import numpy as np
import paddlex
import threading
from typing import List, Optional, Dict, Tuple
import cv2
import psutil
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import matplotlib.patches as patches
import inspect

from ..core.data_structures import (
    PDFPage, 
    BoundingBox, 
    ElementType, 
    LayoutElement, 
    LayoutDetectionResult, 
    ProcessingState, 
    DebugInfo
)

class LayoutDetector:
    """
    版面检测器 (Layout Detector)
    
    负责检测和识别PDF页面中的各种布局元素，如文本、标题、图表、表格等。
    基于深度学习模型实现高精度的版面分析，能够准确划分文档的逻辑结构。
    支持多种元素类型的检测和分类，为后续内容解析和阅读顺序分析提供基础。
    可选择GPU加速以提高处理大型文档的速度。
    """
    
    # 类级别的模型加载锁，确保并发安全
    _model_lock = threading.Lock()
    _global_model_cache = {}
    
    def __init__(self, model_dir: str = None, use_gpu: bool = False, confidence_threshold: float = 0.5, debug_mode: bool = False):
        """
        初始化版面检测器
        
        创建并配置版面检测器实例，设置模型路径、运行设备和检测参数。
        支持自动查找默认模型路径，简化配置过程。
        
        Args:
            model_dir: 模型目录路径，包含推理所需的模型文件。如果为None，则自动使用项目内置的默认模型
            use_gpu: 是否使用GPU进行推理加速，建议在处理大型文档或批量处理时启用
            confidence_threshold: 检测结果的置信度阈值，低于此阈值的预测将被过滤，范围0-1
            debug_mode: 是否启用调试模式，开启后会输出详细的中间过程信息和性能统计
        """
        # 如果未指定模型目录，使用默认路径
        if model_dir is None:
            # 使用相对于项目根目录的路径
            self.model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                         "models", "layout")
        else:
            self.model_dir = model_dir
            
        self.use_gpu = use_gpu
        self.confidence_threshold = confidence_threshold
        self.debug_mode = debug_mode
        self.predictor = None
        
        # 模型输出类别到我们的ElementType的映射
        self.category_mapping = {
            "text": ElementType.TEXT,
            "paragraph_title": ElementType.PARAGRAPH_TITLE,
            "image": ElementType.IMAGE,
            "figure_title": ElementType.FIGURE_CAPTION,
            "table": ElementType.TABLE,
            "table_title": ElementType.TABLE_CAPTION,
            "header": ElementType.HEADER,
            "footer": ElementType.FOOTER,
            "reference": ElementType.REFERENCE,
            "chemical_formula": ElementType.CHEMICAL_FORMULA,
            "number": ElementType.PAGE_NUMBER,
            "code": ElementType.CODE_BLOCK,
            "list": ElementType.TEXT,  # 列表映射为文本
            "abstract": ElementType.ABSTRACT,
            "content": ElementType.TABLE_OF_CONTENTS,
            "doc_title": ElementType.DOCUMENT_TITLE,
            "footnote": ElementType.FOOTNOTE,
            "algorithm": ElementType.ALGORITHM,
            "chart": ElementType.CHART,
            "chart_title": ElementType.CHART_CAPTION,
            "aside_text": ElementType.ASIDE_TEXT,
            "footer_image": ElementType.FOOTER,  # 将footer_image映射到FOOTER
            # 添加一些可能的变体映射
            "title": ElementType.PARAGRAPH_TITLE,
            "figure": ElementType.IMAGE,
            "figure_caption": ElementType.FIGURE_CAPTION,
            "table_caption": ElementType.TABLE_CAPTION,
            "equation": ElementType.CHEMICAL_FORMULA,
            "page-number": ElementType.PAGE_NUMBER,
        }
        
    def _get_memory_usage(self) -> float:
        """获取当前进程的内存使用量（MB）"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
    
    def load_model(self) -> bool:
        """
        线程安全的版面检测模型加载方法
        
        使用类级别锁和模型缓存，避免并发加载冲突
        
        Returns:
            bool: 是否成功加载模型
        """
        # 如果模型已加载，直接返回
        if hasattr(self, 'predictor') and self.predictor:
            return True
        
        # 创建模型缓存键
        device = 'gpu' if self.use_gpu else 'cpu'
        cache_key = f"PP-DocLayout-L_{self.model_dir}_{device}"
        
        # 使用类级别锁保证线程安全
        with self._model_lock:
            # 双重检查：锁内再次检查是否已加载
            if hasattr(self, 'predictor') and self.predictor:
                return True
                
            # 检查全局缓存中是否已有相同配置的模型
            if cache_key in self._global_model_cache:
                print(f"从缓存加载版面检测模型...")
                self.predictor = self._global_model_cache[cache_key]
                print(f"版面检测模型加载成功（缓存）")
                return True
            
            start_time = time.time()
            try:
                print(f"加载版面检测模型...")
                self.predictor = paddlex.create_predictor('PP-DocLayout-L', self.model_dir, device=device)
                
                # 将模型添加到全局缓存
                self._global_model_cache[cache_key] = self.predictor
                
                if self.debug_mode:
                    print(f"版面检测模型加载成功，耗时: {time.time() - start_time:.2f}秒")
                else:
                    print(f"版面检测模型加载成功")
                return True
            except Exception as e:
                print(f"版面检测模型加载失败: {str(e)}")
                return False
    
    def detect_layout(self, pages_info: List[PDFPage], state: ProcessingState) -> Tuple[List[LayoutDetectionResult], ProcessingState]:
        """
        对PDF页面进行版面检测
        
        分析PDF文档中的每个页面，识别其中的各类布局元素并返回检测结果。
        处理过程中会自动更新全局处理状态，包括进度和调试信息。
        对每个页面的处理结果包含位置坐标、元素类型和置信度等信息。
        
        Args:
            pages_info: PDF页面信息对象列表，包含图像路径和页面元数据
            state: 全局处理状态对象，用于跟踪进度和记录处理信息
            
        Returns:
            Tuple[List[LayoutDetectionResult], ProcessingState]: 
                第一项为版面检测结果列表，每个页面对应一个检测结果对象
                第二项为更新后的处理状态对象
                
        Raises:
            Exception: 当模型加载失败时抛出异常
            ValueError: 当页面图像无法读取时抛出异常
        """
        if not self.predictor and not self.load_model():
            raise Exception("版面检测模型未加载")
        
        start_time = time.time()
        
        print(f"步骤2/7: 版面检测 - 开始处理，总页数: {len(pages_info)}")
        
        state.current_stage = "layout_detection"
        detection_results = []
        
        for page_idx, page_info in enumerate(pages_info):
            page_start_time = time.time()
            
            # 添加当前处理页数的日志输出
            print(f"正在处理第 {page_idx + 1}/{len(pages_info)} 页...")
            
            if self.debug_mode:
                print(f"正在处理页面 {page_info.page_num}/{len(pages_info)}...")
            
            # 加载页面图像
            if not page_info.image_path:
                raise ValueError(f"页面 {page_info.page_num} 没有对应的图像路径")
            
            try:
                # 使用cv2.imdecode以支持中文路径
                cv_image = cv2.imdecode(np.fromfile(page_info.image_path, dtype=np.uint8), cv2.IMREAD_COLOR)
                if cv_image is None:
                    raise ValueError(f"无法读取页面图像: {page_info.image_path}")
                
                # 进行版面检测
                raw_results = self._detect_single_page(cv_image)
                
                # 解析检测结果
                elements = self._parse_detection_results(raw_results, page_info.page_num)
                
                # 创建检测结果对象
                result = LayoutDetectionResult(
                    page_num=page_info.page_num,
                    elements=elements,
                    processing_time=time.time() - page_start_time
                )
                detection_results.append(result)
                
                # 更新处理状态
                state.processed_pages = page_idx + 1
                state.progress_percentage = (state.processed_pages / state.total_pages) * 100
                
                # 记录调试信息
                if self.debug_mode:
                    debug_info = DebugInfo(
                        stage_name="layout_detection",
                        page_num=page_info.page_num,
                        processing_time=time.time() - page_start_time,
                        memory_usage=self._get_memory_usage(),
                        success=True
                    )
                    state.debug_info.append(debug_info)
                    
            except Exception as e:
                if self.debug_mode:
                    print(f"页面 {page_info.page_num} 版面检测失败: {str(e)}")
                    debug_info = DebugInfo(
                        stage_name="layout_detection",
                        page_num=page_info.page_num,
                        processing_time=time.time() - page_start_time,
                        memory_usage=self._get_memory_usage(),
                        success=False,
                        error_message=str(e)
                    )
                    state.debug_info.append(debug_info)
        
        # 完成版面检测阶段
        state.completed_stages.append("layout_detection")
        
        print(f"步骤2/7: 版面检测 - 完成，总耗时: {time.time() - start_time:.2f}秒")
        
        return detection_results, state
    
    def _detect_single_page(self, cv_image) -> List[Dict]:
        """
        检测单个页面的布局元素
        Args:
            cv_image: OpenCV格式的图像
        Returns:
            检测结果列表
        """
        try:
            # 添加BGR到RGB的颜色空间转换
            rgb_image = cv2.cvtColor(cv_image.copy(), cv2.COLOR_BGR2RGB)
            if self.debug_mode:
                print("已对输入图像进行BGR->RGB颜色空间转换")
            
            # 使用RGB图像进行预测
            raw_pred = self.predictor.predict(rgb_image)
            return self._parse_prediction(raw_pred)
        except Exception as e:
            print(f"单张图像检测错误: {e}")
            return []
    
    def _parse_prediction(self, raw_pred_results) -> List[Dict]:
        """
        解析模型预测结果
        Args:
            raw_pred_results: 模型原始预测结果
        Returns:
            解析后的检测框列表
        """
        parsed_boxes = []
        if not raw_pred_results:
            if self.debug_mode:
                print("警告: 预测结果为空")
            return parsed_boxes

        # 转换生成器为列表
        if inspect.isgenerator(raw_pred_results):
            results_list = list(raw_pred_results)
        else:
            results_list = raw_pred_results if isinstance(raw_pred_results, list) else [raw_pred_results]
        
        if self.debug_mode:
            print(f"原始预测结果类型: {type(results_list)}, 结果数量: {len(results_list)}")

        if not results_list:
            return parsed_boxes

        if self.debug_mode:
            print(f"第一个预测结果的类型: {type(results_list[0])}")
            
        # 处理不同的预测结果格式
        data_item = results_list[0]
        boxes_source = None
        
        # 1. 尝试直接解析PaddleX输出格式
        if isinstance(data_item, dict) and 'boxes' in data_item:
            boxes_source = data_item.get('boxes', [])
            if self.debug_mode:
                print(f"检测到PaddleX字典格式输出，包含 {len(boxes_source)} 个边界框")
                
        # 2. 尝试解析对象属性格式
        elif hasattr(data_item, 'boxes'):
            boxes_source = data_item.boxes
            if self.debug_mode:
                print(f"检测到对象属性格式，包含 {len(boxes_source)} 个边界框")
                
        # 3. 处理直接返回列表的情况
        elif isinstance(data_item, list) and all(isinstance(i, dict) for i in data_item):
            # 检查是否包含所需的键
            if all(all(k in i for k in ['category', 'score', 'bbox']) for i in data_item):
                boxes_source = data_item
                if self.debug_mode:
                    print(f"检测到直接列表格式，包含 {len(boxes_source)} 个边界框")
                
                # 直接处理这种格式
                for box_dict in boxes_source:
                    if box_dict['score'] >= self.confidence_threshold:
                        if 'bbox' in box_dict and isinstance(box_dict['bbox'], (list, tuple)) and len(box_dict['bbox']) == 4:
                            # 直接使用现有字典，确保包含所需字段
                            parsed_boxes.append({
                                'category': box_dict['category'],
                                'score': box_dict['score'],
                                'bbox': box_dict['bbox']
                            })
                return parsed_boxes
                
        # 4. 处理数据列表中第一个元素包含所有边界框的情况
        elif isinstance(results_list, list) and len(results_list) > 0:
            # 可能是更复杂的结构，尝试查找边界框数据
            if self.debug_mode:
                print(f"尝试从复杂结构中解析边界框")
            # 这里可以添加更多的结构解析逻辑
        
        # 解析找到的边界框源
        if isinstance(boxes_source, list):
            for box_idx, box_obj in enumerate(boxes_source):
                entry = {}
                category = None
                score = 0.0
                coordinate = []

                # 调试前几个框的处理
                if self.debug_mode and box_idx < 3:
                    print(f"处理框 {box_idx}: 类型={type(box_obj)}")
                
                # 处理对象属性格式
                if hasattr(box_obj, 'label') and hasattr(box_obj, 'score') and hasattr(box_obj, 'coordinate'):
                    category = box_obj.label
                    score = box_obj.score
                    coordinate = box_obj.coordinate
                    if self.debug_mode and box_idx < 3:
                        print(f"  对象属性格式: 类别={category}, 得分={score:.2f}, 坐标={coordinate}")
                        
                # 处理键值对格式 1
                elif isinstance(box_obj, dict) and all(k in box_obj for k in ['label', 'score', 'coordinate']):
                    category = box_obj['label']
                    score = box_obj['score']
                    coordinate = box_obj['coordinate']
                    if self.debug_mode and box_idx < 3:
                        print(f"  键值对格式1: 类别={category}, 得分={score:.2f}, 坐标={coordinate}")
                        
                # 处理键值对格式 2
                elif isinstance(box_obj, dict) and all(k in box_obj for k in ['category', 'score', 'bbox']):
                    category = box_obj['category']
                    score = box_obj['score']
                    coordinate = box_obj['bbox']
                    if self.debug_mode and box_idx < 3:
                        print(f"  键值对格式2: 类别={category}, 得分={score:.2f}, 坐标={coordinate}")
                
                # 判断是否有效并添加到结果
                if category and score >= self.confidence_threshold and isinstance(coordinate, (list, tuple)) and len(coordinate) == 4:
                    entry = {'category': category, 'score': score, 'bbox': list(coordinate)}
                    parsed_boxes.append(entry)
                    if self.debug_mode and box_idx < 3:
                        print(f"  有效框: 已添加到结果列表")
                elif category and score >= self.confidence_threshold:
                    if self.debug_mode:
                        print(f"  警告: 类别 {category} (得分 {score:.2f}) 的坐标无效或格式不正确: {coordinate}")
        
        if self.debug_mode:
            print(f"解析完成，得到 {len(parsed_boxes)} 个有效边界框")
            
        return parsed_boxes
    
    def _parse_detection_results(self, detection_results: List[Dict], page_num: int) -> List[LayoutElement]:
        """
        将检测结果转换为LayoutElement对象列表
        Args:
            detection_results: 解析后的检测结果
            page_num: 页面编号
        Returns:
            LayoutElement对象列表
        """
        elements = []
        
        for idx, res in enumerate(detection_results):
            if res['score'] < self.confidence_threshold:
                continue
                
            category = res['category']
            coord = res['bbox']
            
            # 调试信息
            if self.debug_mode and idx < 3:
                print(f"处理元素 {idx}: 类别={category}, 原始坐标={coord}")
            
            # 确保坐标是浮点数列表，长度为4
            if not isinstance(coord, (list, tuple)) or len(coord) != 4:
                if self.debug_mode:
                    print(f"警告: 坐标格式错误: {coord}")
                continue
            
            # 尝试将坐标转换为浮点数
            try:
                coord = [float(c) for c in coord]
            except (TypeError, ValueError):
                if self.debug_mode:
                    print(f"警告: 无法将坐标转换为浮点数: {coord}")
                continue
            
            # 处理不同的坐标格式
            x1, y1, x2_or_w, y2_or_h = coord
            
            # 如果坐标是归一化的（都在0-1之间），转换为绝对坐标
            if all(0 <= c <= 1 for c in coord):
                # 获取图像尺寸（这里需要一些预设的默认值）
                # 由于我们没有图像尺寸，假设1000x1000
                img_w, img_h = 1000, 1000
                x1, y1 = x1 * img_w, y1 * img_h
                x2_or_w, y2_or_h = x2_or_w * img_w, y2_or_h * img_h
                if self.debug_mode and idx < 3:
                    print(f"  检测到归一化坐标，缩放到 {img_w}x{img_h}")
            
            # 确定是 [x1,y1,x2,y2] 还是 [x,y,w,h] 格式
            # 如果 x2 < x1 或 y2 < y1，那么可能是 [x,y,w,h] 格式
            if x2_or_w < x1 or y2_or_h < y1:
                # 是 [x,y,w,h] 格式
                x, y, w, h = x1, y1, x2_or_w, y2_or_h
                if self.debug_mode and idx < 3:
                    print(f"  检测到[x,y,w,h]格式: x={x}, y={y}, w={w}, h={h}")
            else:
                # 是 [x1,y1,x2,y2] 格式
                x1, y1, x2, y2 = x1, y1, x2_or_w, y2_or_h
                w, h = x2 - x1, y2 - y1
                if self.debug_mode and idx < 3:
                    print(f"  检测到[x1,y1,x2,y2]格式: 计算w={w}, h={h}")
            
            # 确保宽度和高度为正
            w, h = max(1.0, w), max(1.0, h)
            
            # 映射类别到我们的ElementType
            element_type = self._map_category_to_element_type(category)
            
            # 如果没有对应的映射，跳过此元素
            if element_type is None:
                if self.debug_mode:
                    print(f"警告: 未知类别 '{category}'，已跳过")
                continue
            
            # 创建边界框
            bbox = BoundingBox(
                x=x1,
                y=y1,
                width=w,
                height=h,
                page_num=page_num
            )
            
            # 创建布局元素
            element_id = f"{page_num}-{idx}"
            element = LayoutElement(
                element_id=element_id,
                element_type=element_type,
                bbox=bbox,
                confidence=float(res['score'])
            )
            
            elements.append(element)
            
            if self.debug_mode and idx < 3:
                print(f"  最终元素: id={element_id}, 类型={element_type.name}, 边界框=[{bbox.x},{bbox.y},{bbox.width},{bbox.height}]")
        
        return elements
    
    def _map_category_to_element_type(self, category: str) -> Optional[ElementType]:
        """
        将模型输出的类别映射到我们的ElementType
        Args:
            category: 模型输出的类别名称
        Returns:
            对应的ElementType，如果没有映射则返回None
        """
        return self.category_mapping.get(category.lower())
    
    def visualize_layout(self, image_path: str, layout_result: LayoutDetectionResult, output_path: str = None) -> str:
        """
        将检测到的版面元素可视化
        Args:
            image_path: 原始图像路径
            layout_result: 版面检测结果
            output_path: 输出图像路径，如果为None则自动生成
        Returns:
            输出图像路径
        """
        # 读取原始图像
        try:
            image = cv2.imdecode(np.fromfile(image_path, dtype=np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError(f"无法读取图像: {image_path}")
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # 转换为RGB
            img_h, img_w = image.shape[:2]
            if self.debug_mode:
                print(f"可视化图像尺寸: {img_w}x{img_h}")
        except Exception as e:
            print(f"读取图像失败: {e}")
            return None
            
        # 创建图形
        fig, ax = plt.subplots(figsize=(12, 12))
        ax.imshow(image)
        
        # 为不同类型的元素分配不同的颜色
        colors = list(mcolors.TABLEAU_COLORS.values())
        element_type_colors = {}
        
        # 绘制每个检测到的元素
        for i, element in enumerate(layout_result.elements):
            bbox = element.bbox
            element_type = element.element_type
            
            # 确保边界框在图像范围内
            x = max(0, min(img_w - 1, bbox.x))
            y = max(0, min(img_h - 1, bbox.y))
            width = max(1, min(img_w - x, bbox.width))
            height = max(1, min(img_h - y, bbox.height))
            
            if self.debug_mode and i < 3:
                print(f"绘制元素 {i}: 类型={element_type.name}, 边界框=[{x},{y},{width},{height}]")
            
            # 为元素类型分配颜色
            if element_type not in element_type_colors:
                element_type_colors[element_type] = colors[len(element_type_colors) % len(colors)]
                
            color = element_type_colors[element_type]
            
            # 绘制矩形
            rect = patches.Rectangle(
                (x, y), width, height, 
                linewidth=2, edgecolor=color, facecolor='none', alpha=0.8
            )
            ax.add_patch(rect)
            
            # 添加标签
            label = f"{element_type.name}: {element.confidence:.2f}"
            plt.text(
                x, y - 5, label, 
                color='white', fontsize=8, bbox={'facecolor': color, 'alpha': 0.8, 'pad': 2}
            )
        
        # 添加图例
        legend_elements = [
            patches.Patch(color=color, label=element_type.name)
            for element_type, color in element_type_colors.items()
        ]
        ax.legend(handles=legend_elements, loc='upper right')
        
        # 设置图像标题
        plt.title(f"Page {layout_result.page_num} Layout Detection ({len(layout_result.elements)} elements)")
        plt.axis('off')
        
        # 保存图像
        if output_path is None:
            os.makedirs("File/pdf_to_markdown/debug/layout", exist_ok=True)
            output_path = f"File/pdf_to_markdown/debug/layout/page_{layout_result.page_num}_layout.png"
            
        plt.savefig(output_path, bbox_inches='tight', dpi=300)
        plt.close()
        
        if self.debug_mode:
            print(f"版面检测可视化结果已保存至: {output_path}")
            
        return output_path 