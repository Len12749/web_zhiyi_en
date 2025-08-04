import os
import time
import cv2
import numpy as np
import logging
import psutil
import paddlex
import threading
from typing import Tuple, Optional, Dict, Union, List

from ..core.data_structures import PDFPage, DebugInfo, ProcessingState
from ..config.model_config import ModelConfig
from ..utils.logger import setup_logger

class RotationDetector:
    """PDF页面旋转检测器，使用本地PP-LCNet_x1_0_doc_ori_infer模型检测页面方向"""
    
    # 类级别的模型加载锁，确保并发安全
    _model_lock = threading.Lock()
    _global_model_cache = {}
    
    def __init__(self, model_dir: Optional[str] = None, use_gpu: bool = False, debug_mode: bool = False):
        """
        初始化旋转检测器
        
        Args:
            model_dir: 模型目录路径，如果为None则使用默认路径
            use_gpu: 是否使用GPU进行推理
            debug_mode: 是否启用调试模式
        """
        self.debug_mode = debug_mode
        self.use_gpu = use_gpu
        
        # 设置模型路径
        if model_dir is None:
            # 使用相对于项目根目录的路径
            self.model_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                "models", "rotation", "PP-LCNet_x1_0_doc_ori_infer"
            )
        else:
            self.model_dir = model_dir
            
        self.predictor = None
        self.model_loaded = False
        
        # 初始化日志
        self.logger = setup_logger("RotationDetector", logging.INFO if not debug_mode else logging.DEBUG)
        
        # 旋转角度映射
        self.angle_labels = ['0', '90', '180', '270']
        self.label_to_angle = {
            '0': 0,
            '90': 90,
            '180': 180,
            '270': 270
        }
        
        if self.debug_mode:
            self.logger.info(f"旋转检测器初始化，模型路径: {self.model_dir}")
    
    def _get_memory_usage(self) -> float:
        """获取当前进程的内存使用量（MB）"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
    
    def load_model(self) -> bool:
        """
        线程安全的旋转检测模型加载方法
        
        使用类级别锁和模型缓存，避免并发加载冲突
        
        Returns:
            bool: 加载是否成功
        """
        # 如果模型已加载，直接返回
        if self.model_loaded:
            return True
        
        # 创建模型缓存键
        device = 'gpu' if self.use_gpu else 'cpu'
        cache_key = f"PP-LCNet_x1_0_doc_ori_{self.model_dir}_{device}"
        
        # 使用类级别锁保证线程安全
        with self._model_lock:
            # 双重检查：锁内再次检查是否已加载
            if self.model_loaded:
                return True
                
            # 检查全局缓存中是否已有相同配置的模型
            if cache_key in self._global_model_cache:
                self.logger.info(f"从缓存加载旋转检测模型...")
                self.predictor = self._global_model_cache[cache_key]
                self.model_loaded = True
                self.logger.info(f"旋转检测模型加载成功（缓存）")
                return True
            
            start_time = time.time()
            try:
                # 检查模型路径是否存在
                if not os.path.exists(self.model_dir):
                    raise FileNotFoundError(f"模型路径不存在: {self.model_dir}")
                
                # 检查必要的模型文件
                required_files = ['inference.yml', 'inference.json', 'inference.pdiparams']
                for file_name in required_files:
                    file_path = os.path.join(self.model_dir, file_name)
                    if not os.path.exists(file_path):
                        raise FileNotFoundError(f"模型文件不存在: {file_path}")
                
                # 使用paddlex加载模型
                self.predictor = paddlex.create_predictor(
                    'PP-LCNet_x1_0_doc_ori', 
                    self.model_dir, 
                    device=device
                )
                
                # 将模型添加到全局缓存
                self._global_model_cache[cache_key] = self.predictor
                
                self.model_loaded = True
                load_time = time.time() - start_time
                
                self.logger.info(f"旋转检测模型加载成功，耗时: {load_time:.2f}秒")
                
                if self.debug_mode:
                    self.logger.info(f"模型设备: {device}")
                    self.logger.info(f"内存使用: {self._get_memory_usage():.2f} MB")
                
                return True
                
            except Exception as e:
                self.logger.error(f"旋转检测模型加载失败: {str(e)}")
                return False
    
    def detect_rotation(self, page: PDFPage, state: Optional[ProcessingState] = None) -> Tuple[int, PDFPage]:
        """
        检测PDF页面的旋转角度
        
        Args:
            page: PDF页面信息
            state: 处理状态
            
        Returns:
            Tuple[int, PDFPage]: (旋转角度, 更新后的页面信息)
        """
        if not page.image_path or not os.path.exists(page.image_path):
            raise ValueError(f"页面图像路径无效: {page.image_path}")
            
        # 确保模型已加载
        if not self.model_loaded and not self.load_model():
            raise RuntimeError("旋转检测模型加载失败")
            
        start_time = time.time()
        rotation_angle = 0
        page_num = page.page_num if hasattr(page, 'page_num') else "未知"
        total_pages = state.total_pages if state and hasattr(state, 'total_pages') else "未知"
        
        self.logger.info(f"旋转检测 - 页面 {page_num}/{total_pages}")
        
        try:
            # 读取图像进行预测
            img = cv2.imread(page.image_path)
            if img is None:
                raise ValueError(f"无法读取图像: {page.image_path}")
            
            # 使用模型进行预测
            if self.predictor is None:
                raise RuntimeError("预测器未初始化")
            result = self.predictor.predict(page.image_path)
            
            # 从预测结果中提取旋转角度
            rotation_angle = self._extract_rotation_angle(result, page_num, total_pages)
            
            # 根据用户要求，直接使用模型结果，不进行其他操作
            if rotation_angle != 0:
                self.logger.info(f"页面 {page_num}/{total_pages} - 检测到旋转角度: {rotation_angle}°")
                
                # 根据检测到的角度旋转图像
                rotated_img = self._rotate_image(img, rotation_angle)
                
                # 保存旋转后的图像
                cv2.imwrite(page.image_path, rotated_img)
                
                # 更新页面旋转信息
                page.rotation = (page.rotation + rotation_angle) % 360
                self.logger.info(f"页面 {page_num}/{total_pages} - 旋转完成")
            else:
                self.logger.info(f"页面 {page_num}/{total_pages} - 无需旋转")
                
            # 记录处理时间和调试信息
            processing_time = time.time() - start_time
            if state and self.debug_mode:
                debug_info = DebugInfo(
                    stage_name="rotation_detection",
                    page_num=page.page_num,
                    processing_time=processing_time,
                    memory_usage=self._get_memory_usage(),
                    success=True
                )
                state.debug_info.append(debug_info)
                
            self.logger.info(f"页面 {page_num}/{total_pages} - 旋转检测完成，耗时: {processing_time:.2f}秒")
            return rotation_angle, page
            
        except Exception as e:
            processing_time = time.time() - start_time
            if state and self.debug_mode:
                debug_info = DebugInfo(
                    stage_name="rotation_detection",
                    page_num=page.page_num,
                    processing_time=processing_time,
                    memory_usage=self._get_memory_usage(),
                    success=False,
                    error_message=str(e)
                )
                state.debug_info.append(debug_info)
            self.logger.error(f"页面 {page_num}/{total_pages} - 旋转检测失败: {str(e)}")
            return 0, page
    
    def detect_batch_rotation(self, pages: List[PDFPage], state: Optional[ProcessingState] = None) -> List[Tuple[int, PDFPage]]:
        """
        批量检测多个页面的旋转角度
        
        Args:
            pages: PDF页面信息列表
            state: 处理状态
            
        Returns:
            List[Tuple[int, PDFPage]]: 每个页面的(旋转角度, 更新后的页面信息)
        """
        # 确保模型已加载
        if not self.model_loaded and not self.load_model():
            raise RuntimeError("旋转检测模型加载失败")
            
        results = []
        
        for page in pages:
            try:
                rotation_angle, updated_page = self.detect_rotation(page, state)
                results.append((rotation_angle, updated_page))
            except Exception as e:
                self.logger.error(f"页面 {page.page_num} 旋转检测失败: {str(e)}")
                results.append((0, page))
                
        return results
    
    def _extract_rotation_angle(self, result, page_num, total_pages) -> int:
        """
        从模型预测结果中提取旋转角度
        
        Args:
            result: 模型预测结果（generator对象）
            page_num: 页面编号
            total_pages: 总页面数
            
        Returns:
            int: 旋转角度
        """
        try:
            # PaddleX返回的是generator，需要迭代获取实际结果
            if hasattr(result, '__iter__'):
                # 获取第一个结果
                actual_result = next(iter(result))
                
                if self.debug_mode:
                    self.logger.info(f"页面 {page_num}/{total_pages} - 实际结果类型: {type(actual_result)}")
                    self.logger.info(f"页面 {page_num}/{total_pages} - 实际结果内容: {actual_result}")
                
                # 检查是否有label_names属性（支持属性和字典两种方式）
                label_names = None
                class_ids = None
                scores = None
                
                # 尝试属性方式访问
                if hasattr(actual_result, 'label_names'):
                    label_names = actual_result.label_names
                    class_ids = getattr(actual_result, 'class_ids', None)
                    scores = getattr(actual_result, 'scores', None)
                # 尝试字典方式访问
                elif isinstance(actual_result, dict):
                    label_names = actual_result.get('label_names', None)
                    class_ids = actual_result.get('class_ids', None)
                    scores = actual_result.get('scores', None)
                
                if self.debug_mode:
                    self.logger.info(f"页面 {page_num}/{total_pages} - 提取的数据: label_names={label_names}, class_ids={class_ids}, scores={scores}")
                
                # 使用label_names进行预测
                if label_names is not None and len(label_names) > 0:
                    predicted_label = label_names[0]  # 获取第一个（最可能的）标签
                    
                    # 获取置信度信息
                    confidence = 0.0
                    if scores is not None and len(scores) > 0:
                        confidence = float(scores[0])
                    
                    if self.debug_mode:
                        self.logger.info(f"页面 {page_num}/{total_pages} - 预测标签: {predicted_label}, 置信度: {confidence:.4f}")
                    
                    # 将标签转换为角度
                    rotation_angle = self.label_to_angle.get(str(predicted_label), 0)
                    
                    # 根据用户要求，如果检测到180度旋转，则忽略它
                    if rotation_angle == 180:
                        self.logger.info(f"页面 {page_num}/{total_pages} - 检测到180度旋转，根据要求忽略此旋转")
                        rotation_angle = 0
                        
                    return rotation_angle
                
                # 使用class_ids进行预测（备用方案）
                elif class_ids is not None and len(class_ids) > 0:
                    class_id = int(class_ids[0])
                    
                    # 根据class_id映射到角度
                    class_to_angle = {0: 0, 1: 90, 2: 180, 3: 270}
                    rotation_angle = class_to_angle.get(class_id, 0)
                    
                    # 获取置信度信息
                    confidence = 0.0
                    if scores is not None and len(scores) > 0:
                        confidence = float(scores[0])
                    
                    if self.debug_mode:
                        self.logger.info(f"页面 {page_num}/{total_pages} - 预测类别ID: {class_id}, 对应角度: {rotation_angle}°, 置信度: {confidence:.4f}")
                    
                    # 根据用户要求，如果检测到180度旋转，则忽略它
                    if rotation_angle == 180:
                        self.logger.info(f"页面 {page_num}/{total_pages} - 检测到180度旋转，根据要求忽略此旋转")
                        rotation_angle = 0
                        
                    return rotation_angle
                    
                else:
                    self.logger.warning(f"页面 {page_num}/{total_pages} - 结果中没有找到有效的label_names或class_ids数据")
                    return 0
                    
            else:
                self.logger.warning(f"页面 {page_num}/{total_pages} - 预测结果不是可迭代对象: {type(result)}")
                return 0
                
        except Exception as e:
            self.logger.error(f"页面 {page_num}/{total_pages} - 解析预测结果失败: {str(e)}")
            if self.debug_mode:
                import traceback
                self.logger.error(f"详细错误信息: {traceback.format_exc()}")
            return 0
    
    def _rotate_image(self, img: np.ndarray, detected_angle: int) -> np.ndarray:
        """
        根据检测到的旋转角度进行反向旋转来还原图像
        
        Args:
            img: 输入图像
            detected_angle: 检测到的旋转角度 (0, 90, 180, 270)
                          表示图像当前相对于正常状态的旋转角度
            
        Returns:
            np.ndarray: 还原后的图像
        """
        if detected_angle == 0:
            # 图像已经是正常方向，无需旋转
            return img
        elif detected_angle == 90:
            # 图像顺时针旋转了90度，需要逆时针90度还原
            return cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
        elif detected_angle == 180:
            # 图像旋转了180度，需要180度还原
            return cv2.rotate(img, cv2.ROTATE_180)
        elif detected_angle == 270:
            # 图像逆时针旋转了90度（或顺时针270度），需要顺时针90度还原
            return cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        else:
            self.logger.warning(f"不支持的旋转角度: {detected_angle}度，返回原图像")
            return img
    
    def cleanup(self):
        """
        清理模型和释放内存
        """
        if self.predictor is not None:
            # PaddleX预测器可能没有显式的清理方法，但我们可以删除引用
            del self.predictor
            self.predictor = None
            self.model_loaded = False
            
            if self.debug_mode:
                self.logger.info(f"旋转检测模型已清理，当前内存使用: {self._get_memory_usage():.2f} MB")
    
    def __del__(self):
        """
        析构函数，确保模型被清理
        """
        self.cleanup() 