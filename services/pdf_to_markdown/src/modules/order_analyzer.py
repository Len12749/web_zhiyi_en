#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
阅读顺序分析器
使用LayoutLMv3模型分析PDF页面中元素的阅读顺序
"""

import os
import sys
import time
import cv2
import torch
import psutil
import threading
from collections import defaultdict
from typing import List, Tuple, Dict, Any, Optional, Union

# 条件导入transformers相关模块
try:
    import torch.nn as nn
    import torch.utils.checkpoint
    from torch.nn import CrossEntropyLoss
    from transformers.modeling_outputs import TokenClassifierOutput
    from transformers import LayoutLMv3PreTrainedModel, LayoutLMv3Model
    TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    print(f"警告：transformers相关模块导入失败: {e}")
    TRANSFORMERS_AVAILABLE = False
    # 创建占位类以避免定义错误
    class nn:
        class Module: pass
        class Linear: pass
        class Dropout: pass
    class LayoutLMv3PreTrainedModel: pass
    class TokenClassifierOutput: pass

# 项目内部导入
from ..core.data_structures import (
    LayoutDetectionResult, ReadingOrderResult, ReadingOrderElement,
    ElementType, ProcessingState, DebugInfo
)

# Token常量定义
CLS_TOKEN_ID = 0
UNK_TOKEN_ID = 3
EOS_TOKEN_ID = 2


class ClassificationHead(nn.Module):
    """分类头模块，用于LayoutLMv3的序列分类任务"""
    
    def __init__(self, config):
        super().__init__()
        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        classifier_dropout = (
            config.classifier_dropout if config.classifier_dropout is not None else config.hidden_dropout_prob
        )
        self.dropout = nn.Dropout(classifier_dropout)
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, x):
        x = self.dropout(x)
        x = self.dense(x)
        x = torch.tanh(x)
        x = self.dropout(x)
        x = self.out_proj(x)
        return x


class LayoutLMv3ForBboxClassification(LayoutLMv3PreTrainedModel):
    """基于LayoutLMv3的边界框分类模型，用于阅读顺序分析"""
    
    def __init__(self, config):
        super().__init__(config)
        self.num_labels = config.num_labels
        self.layoutlmv3 = LayoutLMv3Model(config)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        self.classifier = ClassificationHead(config)

        self.init_weights()

    def forward(
            self,
            input_ids: Optional[torch.LongTensor] = None,
            bbox: Optional[torch.LongTensor] = None,
            attention_mask: Optional[torch.FloatTensor] = None,
            token_type_ids: Optional[torch.LongTensor] = None,
            position_ids: Optional[torch.LongTensor] = None,
            head_mask: Optional[torch.FloatTensor] = None,
            inputs_embeds: Optional[torch.FloatTensor] = None,
            labels: Optional[torch.LongTensor] = None,
            output_attentions: Optional[bool] = None,
            output_hidden_states: Optional[bool] = None,
            return_dict: Optional[bool] = None,
            pixel_values: Optional[torch.LongTensor] = None,
    ) -> Union[Tuple, TokenClassifierOutput]:
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict

        outputs = self.layoutlmv3(
            input_ids,
            bbox=bbox,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            position_ids=position_ids,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
            pixel_values=pixel_values,
        )
        if input_ids is not None:
            input_shape = input_ids.size()
        else:
            input_shape = inputs_embeds.size()[:-1]

        seq_length = input_shape[1]
        sequence_output = outputs[0][:, :seq_length]
        sequence_output = self.dropout(sequence_output)
        logits = self.classifier(sequence_output)

        loss = None
        if labels is not None:
            loss_fct = CrossEntropyLoss()
            loss = loss_fct(logits.view(-1, self.num_labels), labels.view(-1))

        if not return_dict:
            output = (logits,) + outputs[1:]
            return ((loss,) + output) if loss is not None else output

        return TokenClassifierOutput(
            loss=loss,
            logits=logits,
            hidden_states=outputs.hidden_states,
            attentions=outputs.attentions,
        )


class OrderAnalyzer:
    """
    阅读顺序分析器
    
    分析PDF页面中布局元素的阅读顺序，确定文档的自然阅读流程。
    使用预训练的LayoutLMv3模型进行序列预测，能够准确识别文档中
    各个区域（段落、标题、图表等）的逻辑顺序关系。
    """
    
    # 类级别的模型加载锁，确保并发安全
    _model_lock = threading.Lock()
    _global_model_cache = {}
    
    def __init__(self, model_dir: str = None, use_gpu: bool = False, debug_mode: bool = False):
        """
        初始化阅读顺序分析器
        Args:
            model_dir: 模型目录路径，如果为None则使用默认路径
            use_gpu: 是否使用GPU
            debug_mode: 是否启用调试模式
        """
        # 设置模型路径 - 直接指向包含权重和配置的目录
        if model_dir is None:
            self.base_model_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                "models", "order"
            )
            # 根据开发手册要求，直接使用包含权重和配置的目录
            self.model_path = os.path.join(self.base_model_dir, "layoutlmv3_reading_order")
        else:
            self.model_path = model_dir
        
        self.use_gpu = use_gpu and torch.cuda.is_available()
        self.debug_mode = debug_mode
        self.device = torch.device("cuda" if self.use_gpu else "cpu")
        self.reader_model = None
        self.model_loaded = False
        
        # 元素类型映射
        self.name2element_type = {
            'Text': ElementType.TEXT,
            'Title': ElementType.PARAGRAPH_TITLE,
            'Figure': ElementType.IMAGE,
            'Figure caption': ElementType.FIGURE_CAPTION,
            'Table': ElementType.TABLE,
            'Table caption': ElementType.TABLE_CAPTION,
            'Header': ElementType.HEADER,
            'Footer': ElementType.FOOTER,
            'Reference': ElementType.REFERENCE,
            'Equation': ElementType.CHEMICAL_FORMULA
        }
        
        # 加载模型
        self.load_model()
    
    def _get_memory_usage(self) -> float:
        """获取当前进程的内存使用量（MB）"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024
    
    def load_model(self) -> bool:
        """
        线程安全的模型加载方法
        
        使用类级别锁和模型缓存，避免并发加载冲突
        
        Returns:
            bool: 是否成功加载模型
        """
        # 如果模型已加载，直接返回
        if self.model_loaded and hasattr(self, 'reader_model'):
            return True
        
        # 创建模型缓存键
        cache_key = f"{self.model_path}_{self.device}"
        
        # 使用类级别锁保证线程安全
        with self._model_lock:
            # 双重检查：锁内再次检查是否已加载
            if self.model_loaded and hasattr(self, 'reader_model'):
                return True
                
            # 检查全局缓存中是否已有相同配置的模型
            if cache_key in self._global_model_cache:
                print(f"从缓存加载阅读顺序模型...")
                self.reader_model = self._global_model_cache[cache_key]
                self.model_loaded = True
                print(f"阅读顺序模型加载成功（缓存）")
                return True
            
            try:
                print(f"加载阅读顺序模型...")
                print(f"从 {self.model_path} 加载模型...")
                
                # 检查模型路径是否存在
                if not os.path.exists(self.model_path):
                    raise FileNotFoundError(f"模型路径不存在: {self.model_path}")
                
                # 检查必要的模型文件
                config_path = os.path.join(self.model_path, "config.json")
                model_safetensors_path = os.path.join(self.model_path, "model.safetensors")
                
                if not os.path.exists(config_path):
                    raise FileNotFoundError(f"配置文件不存在: {config_path}")
                if not os.path.exists(model_safetensors_path):
                    raise FileNotFoundError(f"权重文件不存在: {model_safetensors_path}")
                
                # 使用from_pretrained方法加载模型（会自动处理配置和权重）
                self.reader_model = LayoutLMv3ForBboxClassification.from_pretrained(self.model_path)
                self.reader_model.to(self.device)
                self.reader_model.eval()
                
                # 将模型添加到全局缓存
                self._global_model_cache[cache_key] = self.reader_model
                
                self.model_loaded = True
                print(f"阅读顺序模型加载成功")
                
                if self.debug_mode:
                    print(f"模型设备: {self.device}")
                    print(f"模型参数数量: {sum(p.numel() for p in self.reader_model.parameters())}")
                    print(f"内存使用: {self._get_memory_usage():.2f} MB")
                
                return True
            except Exception as e:
                print(f"加载阅读顺序模型失败: {str(e)}")
                self.model_loaded = False
                return False
    
    def BboxesMasks(self, boxes):
        """
        为边界框创建模型输入
        Args:
            boxes: 边界框列表，格式为[[left, top, right, bottom], ...]
        Returns:
            模型输入字典
        """
        bbox = [[0, 0, 0, 0]] + boxes + [[0, 0, 0, 0]]
        input_ids = [CLS_TOKEN_ID] + [UNK_TOKEN_ID] * len(boxes) + [EOS_TOKEN_ID]
        attention_mask = [1] + [1] * len(boxes) + [1]
        return {
            "bbox": torch.tensor([bbox]),
            "attention_mask": torch.tensor([attention_mask]),
            "input_ids": torch.tensor([input_ids]),
        }
    
    def decode(self, logits, length):
        """
        解析模型输出的logits，获取阅读顺序
        Args:
            logits: 模型输出的logits
            length: 边界框数量
        Returns:
            阅读顺序列表
        """
        logits = logits[1: length + 1, :length]
        orders = logits.argsort(descending=False).tolist()
        ret = [o.pop() for o in orders]
        while True:
            order_to_idxes = defaultdict(list)
            for idx, order in enumerate(ret):
                order_to_idxes[order].append(idx)
            order_to_idxes = {k: v for k, v in order_to_idxes.items() if len(v) > 1}
            if not order_to_idxes:
                break
            for order, idxes in order_to_idxes.items():
                idxes_to_logit = {}
                for idx in idxes:
                    idxes_to_logit[idx] = logits[idx, order]
                idxes_to_logit = sorted(
                    idxes_to_logit.items(), key=lambda x: x[1], reverse=True
                )
                for idx, _ in idxes_to_logit[1:]:
                    ret[idx] = orders[idx].pop()
        return ret
    
    def layoutreader(self, bboxes):
        """
        使用LayoutReader模型预测阅读顺序
        Args:
            bboxes: 边界框列表，格式为[[left, top, right, bottom], ...]
        Returns:
            阅读顺序列表
        """
        inputs = self.BboxesMasks(bboxes)
        # 将输入移动到设备上
        for k, v in inputs.items():
            inputs[k] = v.to(self.device)
        
        # 推理
        with torch.no_grad():
            logits = self.reader_model(**inputs).logits.cpu().squeeze(0)
        
        # 解析结果
        orders = self.decode(logits, len(bboxes))
        return orders
    
    def analyze_page_order(self, layout_result: LayoutDetectionResult) -> ReadingOrderResult:
        """
        分析单个页面的布局元素阅读顺序
        Args:
            layout_result: 版面检测结果
        Returns:
            阅读顺序分析结果
        """
        start_time = time.time()
        
        # 确保模型已加载
        if not self.model_loaded:
            if not self.load_model():
                return ReadingOrderResult(
                    page_num=layout_result.page_num,
                    ordered_elements=[],
                    processing_time=0.0
                )
        
        # 检查是否有布局元素
        if not layout_result.elements:
            print(f"页面 {layout_result.page_num} - 没有布局元素，无法进行阅读顺序分析")
            return ReadingOrderResult(
                page_num=layout_result.page_num,
                ordered_elements=[],
                processing_time=0.0
            )
        
        # 检查图像路径是否存在
        image_path = f"File/temp/page_{layout_result.page_num}.png"
        if not os.path.exists(image_path):
            print(f"页面 {layout_result.page_num} - 未找到图像文件: {image_path}，无法进行阅读顺序分析")
            return ReadingOrderResult(
                page_num=layout_result.page_num,
                ordered_elements=[],
                processing_time=0.0
            )
        
        # 读取图像获取尺寸
        img = cv2.imread(image_path)
        if img is None:
            print(f"无法读取图像: {image_path}")
            return ReadingOrderResult(
                page_num=layout_result.page_num,
                ordered_elements=[],
                processing_time=0.0
            )
        
        # 获取图像尺寸
        page_height, page_width = img.shape[:2]
        
        print(f"页面 {layout_result.page_num} - 使用版面检测结果进行阅读顺序分析，共 {len(layout_result.elements)} 个元素")
        
        # 准备边界框
        boxes = []
        
        # 从布局元素中提取边界框
        for element in layout_result.elements:
            bbox = element.bbox
            x1 = bbox.x
            y1 = bbox.y
            x2 = bbox.x + bbox.width
            y2 = bbox.y + bbox.height
            
            # 确保坐标在图像范围内
            x1 = max(0, min(x1, page_width))
            y1 = max(0, min(y1, page_height))
            x2 = max(0, min(x2, page_width))
            y2 = max(0, min(y2, page_height))
            
            # 缩放到1000x1000范围（LayoutReader模型的输入要求）
            x_scale = 1000.0 / page_width
            y_scale = 1000.0 / page_height
            
            left = round(x1 * x_scale)
            top = round(y1 * y_scale)
            right = round(x2 * x_scale)
            bottom = round(y2 * y_scale)
            
            # 确保坐标有效
            left = max(0, min(left, 1000))
            top = max(0, min(top, 1000))
            right = max(left + 1, min(right, 1000))
            bottom = max(top + 1, min(bottom, 1000))
            
            boxes.append([left, top, right, bottom])
        
        # 如果没有有效的边界框，返回空结果
        if not boxes:
            print(f"页面 {layout_result.page_num} - 没有有效的边界框，无法进行阅读顺序分析")
            return ReadingOrderResult(
                page_num=layout_result.page_num,
                ordered_elements=[],
                processing_time=0.0
            )
        
        # 获取阅读顺序
        orders = self.layoutreader(boxes)
        print(f"页面 {layout_result.page_num} - 阅读顺序: {orders}")
        
        # 创建阅读顺序元素列表
        ordered_elements = []
        for i, order_idx in enumerate(orders):
            if order_idx < len(layout_result.elements):
                element_id = layout_result.elements[order_idx].element_id
                ordered_elements.append(
                    ReadingOrderElement(
                        element_id=element_id,
                        order_index=i,
                        confidence=1.0  # 当前模型不提供置信度，默认为1.0
                    )
                )
        
        # 记录阅读顺序
        print(f"页面 {layout_result.page_num} - 阅读顺序已分析，共 {len(ordered_elements)} 个元素")
        
        processing_time = time.time() - start_time
        
        return ReadingOrderResult(
            page_num=layout_result.page_num,
            ordered_elements=ordered_elements,
            processing_time=processing_time
        )
    
    def analyze_document_order(self, layout_results: List[LayoutDetectionResult], state) -> Tuple[List[ReadingOrderResult], Any]:
        """
        分析整个文档的阅读顺序
        Args:
            layout_results: 版面检测结果列表
            state: 处理状态
        Returns:
            Tuple[List[ReadingOrderResult], Any]: 阅读顺序分析结果列表和更新后的状态
        """
        start_time = time.time()
        
        print(f"步骤3/7: 阅读顺序分析 - 开始处理，总页数: {len(layout_results)}")
        
        state.current_stage = "reading_order_analysis"
        order_results = []
        
        for page_idx, layout_result in enumerate(layout_results):
            page_start_time = time.time()
            
            # 分析页面阅读顺序
            order_result = self.analyze_page_order(layout_result)
            order_results.append(order_result)
            
            # 更新处理状态
            state.processed_pages = page_idx + 1
            state.progress_percentage = (state.processed_pages / state.total_pages) * 100
            
            # 记录调试信息
            if self.debug_mode:
                debug_info = DebugInfo(
                    stage_name="reading_order_analysis",
                    page_num=layout_result.page_num,
                    processing_time=time.time() - page_start_time,
                    memory_usage=self._get_memory_usage(),
                    success=True
                )
                state.debug_info.append(debug_info)
        
        # 完成阅读顺序分析阶段
        state.completed_stages.append("reading_order_analysis")
        
        print(f"步骤3/7: 阅读顺序分析 - 完成，总耗时: {time.time() - start_time:.2f}秒")
            
        return order_results, state
    
    def visualize_reading_order(self, pdf_page, layout_result: LayoutDetectionResult, order_result: ReadingOrderResult, output_path: str = None) -> str:
        """
        可视化阅读顺序
        Args:
            pdf_page: PDF页面信息
            layout_result: 版面检测结果
            order_result: 阅读顺序分析结果
            output_path: 输出路径，如果为None则自动生成
        Returns:
            可视化结果的保存路径
        """
        if not output_path:
            os.makedirs("File/pdf_to_markdown/debug/order", exist_ok=True)
            output_path = f"File/pdf_to_markdown/debug/order/page_{layout_result.page_num}_order.png"
        
        # 读取图像
        image_path = f"File/temp/page_{layout_result.page_num}.png"
        
        if not os.path.exists(image_path):
            print(f"页面 {layout_result.page_num} - 未找到图像文件，无法可视化阅读顺序")
            return None
            
        # 读取图像
        img = cv2.imread(image_path)
        if img is None:
            print(f"无法读取图像: {image_path}")
            return None
        
        # 创建一个更鲜明的颜色映射（BGR格式）- 内部填充颜色
        fill_colors = {
            'TEXT': (255, 165, 0),         # 橙色
            'PARAGRAPH_TITLE': (0, 255, 0), # 绿色
            'HEADER': (255, 0, 255),       # 洋红色
            'FOOTER': (255, 255, 0),       # 青色
            'IMAGE': (0, 0, 255),          # 红色
            'TABLE': (0, 165, 255),        # 橙色
            'FIGURE_CAPTION': (255, 0, 0),  # 蓝色
            'TABLE_CAPTION': (0, 255, 128), # 浅绿色
            'REFERENCE': (128, 0, 255),     # 紫色
            'CHEMICAL_FORMULA': (0, 255, 255) # 黄色
        }
        
        # 统一的边框颜色 - 红色
        border_color = (0, 0, 255)  # BGR格式的红色
        
        # 创建元素ID到阅读顺序的映射
        element_id_to_order = {}
        for order_elem in order_result.ordered_elements:
            element_id_to_order[order_elem.element_id] = order_elem.order_index
        
        # 首先处理所有元素，确保每个元素都有边界框
        for element in layout_result.elements:
            bbox = element.bbox
            x, y, w, h = int(bbox.x), int(bbox.y), int(bbox.width), int(bbox.height)
            
            # 获取元素类型对应的颜色
            fill_color = fill_colors.get(element.element_type.name, (255, 255, 255))
            
            # 绘制半透明填充
            overlay = img.copy()
            cv2.rectangle(overlay, (x, y), (x + w, y + h), fill_color, -1)
            img = cv2.addWeighted(overlay, 0.2, img, 0.8, 0)
            
            # 绘制统一红色边界框
            cv2.rectangle(img, (x, y), (x + w, y + h), border_color, 3)
            
            # 在边界框上方添加元素类型标签
            font = cv2.FONT_HERSHEY_SIMPLEX
            label = element.element_type.name
            label_size = cv2.getTextSize(label, font, 0.6, 1)[0]
            cv2.rectangle(img, (x, y - label_size[1] - 5), (x + label_size[0] + 5, y), fill_color, -1)
            cv2.putText(img, label, (x + 2, y - 5), font, 0.6, (0, 0, 0), 1)
        
        # 创建阅读顺序索引到元素的映射
        order_to_element = {}
        for element in layout_result.elements:
            if element.element_id in element_id_to_order:
                order_idx = element_id_to_order[element.element_id]
                order_to_element[order_idx] = element
        
        # 确保序号连续
        max_order = max(order_to_element.keys()) if order_to_element else -1
        ordered_elements = []
        centers = []
        
        # 按顺序处理元素，添加序号
        for i in range(max_order + 1):
            if i in order_to_element:
                element = order_to_element[i]
                ordered_elements.append(element)
                
                bbox = element.bbox
                x, y, w, h = int(bbox.x), int(bbox.y), int(bbox.width), int(bbox.height)
                
                # 计算中心点
                center_x = x + w // 2
                center_y = y + h // 2
                centers.append((center_x, center_y))
                
                # 创建更醒目的序号显示
                # 绘制白色背景圆形
                cv2.circle(img, (center_x, center_y), 20, (255, 255, 255), -1)
                # 绘制红色边框
                cv2.circle(img, (center_x, center_y), 20, border_color, 2)
                # 绘制序号文本（黑色加粗）
                text = str(i + 1)  # 序号从1开始
                text_size = cv2.getTextSize(text, font, 0.8, 2)[0]
                text_x = center_x - text_size[0] // 2
                text_y = center_y + text_size[1] // 2
                cv2.putText(img, text, (text_x, text_y), font, 0.8, (0, 0, 0), 2)
        
        # 绘制阅读顺序连线
        if len(centers) > 1:
            for i in range(len(centers) - 1):
                # 使用统一的红色连线
                self._draw_arrow_line(img, centers[i], centers[i+1], border_color, 2, 15)
        
        # 添加图例
        legend_x = 50
        legend_y = 50
        for i, (type_name, color) in enumerate(fill_colors.items()):
            y_offset = i * 30
            # 绘制颜色方块
            cv2.rectangle(img, (legend_x, legend_y + y_offset), (legend_x + 20, legend_y + y_offset + 20), color, -1)
            # 绘制红色边框
            cv2.rectangle(img, (legend_x, legend_y + y_offset), (legend_x + 20, legend_y + y_offset + 20), border_color, 1)
            # 绘制类型名称
            cv2.putText(img, type_name, (legend_x + 30, legend_y + y_offset + 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        
        # 保存结果
        try:
            cv2.imwrite(output_path, img)
            print(f"页面 {layout_result.page_num} - 阅读顺序可视化结果已保存: {output_path}")
            return output_path
        except Exception as e:
            print(f"保存可视化结果失败: {str(e)}")
            return None
    
    def _draw_arrow_line(self, img, pt1, pt2, color, thickness=1, arrow_size=10):
        """
        绘制带箭头的线
        Args:
            img: 图像
            pt1: 起点
            pt2: 终点
            color: 颜色
            thickness: 线条粗细
            arrow_size: 箭头大小
        """
        # 绘制主线
        cv2.line(img, pt1, pt2, color, thickness)
        
        # 计算方向向量
        dx = pt2[0] - pt1[0]
        dy = pt2[1] - pt1[1]
        
        # 计算向量长度
        magnitude = (dx**2 + dy**2)**0.5
        
        # 归一化
        if magnitude > 0:
            dx = dx / magnitude
            dy = dy / magnitude
            
            # 计算箭头点
            arrow_pt1_x = int(pt2[0] - arrow_size * (dx + 0.3 * dy))
            arrow_pt1_y = int(pt2[1] - arrow_size * (dy - 0.3 * dx))
            arrow_pt2_x = int(pt2[0] - arrow_size * (dx - 0.3 * dy))
            arrow_pt2_y = int(pt2[1] - arrow_size * (dy + 0.3 * dx))
            
            # 绘制箭头
            cv2.line(img, pt2, (arrow_pt1_x, arrow_pt1_y), color, thickness)
            cv2.line(img, pt2, (arrow_pt2_x, arrow_pt2_y), color, thickness) 