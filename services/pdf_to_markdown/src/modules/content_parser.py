import os
import time
import logging
import subprocess
import tempfile
import shutil
import requests
import base64
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
from PIL import Image
import cv2
import numpy as np
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed

from ..core.data_structures import (
    ContentBlock, 
    ContentParsingResult,
    LayoutDetectionResult,
    ReadingOrderResult,
    ReadingOrderElement,
    LayoutElement,
    ElementType,
    ImageInfo,
    BoundingBox,
    ProcessingState,
    PDFPage
)
from ..config.model_config import ModelConfig, ModelType, load_model_config_from_file
from ..core.model_interface import ModelInterface, create_model_interface, ModelInterfaceError
from ..utils.logger import setup_logger

class ContentParsingError(Exception):
    """内容解析过程中的错误"""
    pass

class ContentParser:
    """
    内容解析器 (Content Parser)
    
    负责将识别出的PDF布局元素转换为结构化的Markdown内容。
    使用先进的AI视觉模型理解各类文档元素，包括文本、表格、图像、公式等，
    提取其中的信息并转换为标准Markdown格式。支持多线程并行处理以提高效率，
    能够处理复杂的学术论文、技术文档和多媒体富文本内容。
    作为PDF解析流程的核心组件，确保原始文档的内容和格式得到准确保留。
    """
    
    def __init__(
        self,
        model_config: Optional[ModelConfig] = None,
        model_config_path: Optional[str] = None,
        temp_dir: Optional[str] = None,
        debug_mode: bool = False,
        log_level: int = logging.INFO,
        max_parallel: Optional[int] = None,
        table_as_image: bool = False
    ):
        """
        初始化内容解析器
        
        Args:
            model_config: 模型配置，如果为None则尝试从model_config_path加载
            model_config_path: 模型配置文件路径，默认为src/config/model_config.json
            temp_dir: 临时文件目录
            debug_mode: 是否启用调试模式
            log_level: 日志级别
            max_parallel: 最大并行处理数，默认为model_config.max_concurrent
            table_as_image: 是否将表格保存为图像
        """
        # 加载模型配置
        if model_config is None:
            if model_config_path is None:
                model_config_path = os.path.join("src", "config", "model_config.json")
            
            if os.path.exists(model_config_path):
                self.model_config = load_model_config_from_file(model_config_path)
            else:
                raise ContentParsingError(f"模型配置文件不存在: {model_config_path}")
        else:
            self.model_config = model_config
        
        # 创建模型接口
        self.model_interface = create_model_interface(self.model_config)
        
        # 设置最大并行处理数，默认使用模型配置中的并发数
        self.max_parallel = max_parallel if max_parallel is not None else self.model_config.max_concurrent
        
        self.temp_dir = temp_dir or tempfile.mkdtemp(prefix="content_parser_")
        self.debug_mode = debug_mode
        self.table_as_image = table_as_image
        
        # 设置日志
        self.logger = setup_logger("ContentParser", log_level)
        
        self.logger.info(f"ContentParser initialized with model: {self.model_config.content_model_name}, type: {self.model_config.content_model_type.value}")
        self.logger.info(f"最大并行处理数: {self.max_parallel}, Docker AI服务: {self.model_config.base_url}")
        self.logger.info(f"Using temporary directory: {self.temp_dir}")
        self.logger.info(f"表格处理方式: {'图像' if table_as_image else 'Markdown'}")

    def parse_document(
        self,
        pdf_pages: List[PDFPage],
        layout_results: List[LayoutDetectionResult],
        order_results: List[ReadingOrderResult],
        output_dir: str,
        state: ProcessingState
    ) -> Tuple[List[ContentParsingResult], ProcessingState]:
        """
        解析整个文档
        
        处理整个PDF文档的所有页面和元素，将检测到的布局元素转换为结构化Markdown内容。
        按照页面顺序依次处理，对每个页面按照其阅读顺序分析内容。
        对特殊元素如图像、表格和公式等进行专门处理，确保格式转换的准确性。
        在处理过程中会持续更新全局状态，以便跟踪进度和记录中间结果。
        
        Args:
            pdf_pages: 包含各页面信息的PDF页面对象列表
            layout_results: 版面检测阶段生成的布局元素结果列表
            order_results: 阅读顺序分析阶段生成的元素顺序结果列表
            output_dir: 输出目录路径，用于存储解析后的内容和图像
            state: 全局处理状态对象，用于跟踪进度和中间状态
            
        Returns:
            Tuple[List[ContentParsingResult], ProcessingState]: 
                第一项为所有页面的内容解析结果列表
                第二项为更新后的处理状态对象
        """
        content_results = []
        
        start_time = time.time()
        
        print(f"步骤4/7: 内容解析 - 开始处理，总页数: {len(pdf_pages)}")
        
        # 确保输出目录存在
        debug_output_dir = os.path.join(output_dir, "debug")
        content_debug_dir = os.path.join(debug_output_dir, "content")
        os.makedirs(content_debug_dir, exist_ok=True)
        
        # 更新处理状态
        state.current_stage = "content_parsing"
        
        # 遍历所有页面
        for i, (page, layout_result, order_result) in enumerate(zip(pdf_pages, layout_results, order_results)):
            self.logger.info(f"解析第 {i+1}/{len(pdf_pages)} 页...")
            
            # 解析页面
            content_result = self.parse_page(
                page=page,
                layout_result=layout_result,
                reading_order_result=order_result,
                output_dir=output_dir
            )
            
            content_results.append(content_result)
            
            # 更新处理状态
            state.processed_pages += 1
            state.progress_percentage = (state.processed_pages / state.total_pages) * 60  # 内容解析占总进度的60%
            
            # 保存调试信息
            if state.debug_enabled:
                debug_file = os.path.join(content_debug_dir, f"page_{i+1}_content.json")
                self._save_debug_info(content_result, debug_file)
        
        # 更新处理状态
        state.completed_stages.append("content_parsing")
        
        print(f"步骤4/7: 内容解析 - 完成，总耗时: {time.time() - start_time:.2f}秒")
        
        return content_results, state

    def parse_page(
        self,
        page: PDFPage,
        layout_result: LayoutDetectionResult,
        reading_order_result: ReadingOrderResult,
        output_dir: str
    ) -> ContentParsingResult:
        """
        解析单个页面中的所有元素
        
        Args:
            page: PDF页面对象
            layout_result: 版面检测结果
            reading_order_result: 阅读顺序结果
            output_dir: 输出目录（用于存储图像）
            
        Returns:
            ContentParsingResult: 内容解析结果
        """
        start_time = time.time()
        page_num = layout_result.page_num
        page_image_path = page.image_path
        
        # 确保输出目录存在
        images_dir = os.path.join(output_dir, "images")
        os.makedirs(images_dir, exist_ok=True)
        
        # 创建临时目录用于存储裁剪的元素图像
        temp_elements_dir = os.path.join(self.temp_dir, f"page_{page_num}_elements")
        os.makedirs(temp_elements_dir, exist_ok=True)
        
        # 读取页面图像
        if not page_image_path:
            raise ContentParsingError(f"Page image path is None for page {page_num}")
        page_image = cv2.imread(str(page_image_path))
        if page_image is None:
            raise ContentParsingError(f"Failed to read page image: {page_image_path}")
        
        # 创建元素ID到LayoutElement的映射
        element_map = {elem.element_id: elem for elem in layout_result.elements}
        
        # 用于保存处理结果
        content_blocks_map = {}  # 使用映射来保存处理后的内容块，以便按阅读顺序重组
        success_count = 0
        failed_elements = []
        
        # 按阅读顺序处理元素 - 用于批处理
        elements_to_process = []
        
        # 首先按照阅读顺序处理所有元素
        for order_elem in reading_order_result.ordered_elements:
            element_id = order_elem.element_id
            
            if element_id not in element_map:
                self.logger.warning(f"Element ID {element_id} not found in layout elements")
                failed_elements.append(element_id)
                continue
            
            layout_element = element_map[element_id]
            
            # 检查是否需要跳过该元素类型
            if self._should_skip_element(layout_element.element_type):
                self.logger.info(f"Skipping element {element_id} of type {layout_element.element_type}")
                success_count += 1  # 跳过也算成功处理
                continue
            
            # 裁剪元素图像
            element_image = self._crop_element_image(page_image, layout_element.bbox)
            element_image_path = os.path.join(temp_elements_dir, f"{element_id}.png")
            cv2.imwrite(element_image_path, element_image)
            
            # 判断元素是否需要通过API处理
            if not self._should_save_as_image(layout_element.element_type, self.table_as_image):
                # 需要通过API处理的元素，添加到处理队列
                elements_to_process.append((layout_element, element_image_path, order_elem.order_index))
            else:
                # 直接保存为图像的元素
                try:
                    content_block = self._process_image_element(
                        layout_element, 
                        element_image, 
                        element_image_path, 
                        images_dir
                    )
                    
                    # 对图像标题进行连字符处理
                    if layout_element.element_type in [ElementType.FIGURE_CAPTION, 
                                                     ElementType.TABLE_CAPTION, 
                                                     ElementType.CHART_CAPTION]:
                        content_block.raw_markdown = self._process_hyphenated_text(content_block.raw_markdown)
                    
                    # 保存到映射中，键为阅读顺序索引
                    content_blocks_map[order_elem.order_index] = content_block
                    success_count += 1
                except Exception as e:
                    self.logger.error(f"Failed to process image element {element_id}: {str(e)}")
                    failed_elements.append(element_id)
        
        # 并行处理需要API处理的元素
        if elements_to_process:
            self.logger.info(f"并行处理 {len(elements_to_process)} 个元素...")
            
            # 按批次处理元素
            batch_size = min(self.max_parallel, len(elements_to_process))
            self.logger.info(f"批处理大小: {batch_size}")
            
            for i in range(0, len(elements_to_process), batch_size):
                batch = elements_to_process[i:i+batch_size]
                
                # 准备并行处理参数
                image_paths = []
                user_prompts = []
                batch_elements = []
                order_indices = []  # 保存阅读顺序索引
                
                for layout_element, element_image_path, order_index in batch:
                    user_prompt = self._get_prompts_for_element_type(layout_element.element_type)
                    image_paths.append(element_image_path)
                    user_prompts.append(user_prompt)
                    batch_elements.append(layout_element)
                    order_indices.append(order_index)  # 保存阅读顺序索引
                
                # 创建系统提示词列表
                system_prompts = [""] * len(image_paths)
                
                # 并行处理
                results = self.model_interface.process_images_in_parallel(
                    image_paths, system_prompts, user_prompts
                )
                
                # 处理结果
                for layout_element, markdown_content, order_index in zip(batch_elements, results, order_indices):
                    element_id = layout_element.element_id
                    
                    if markdown_content is None:
                        self.logger.error(f"Failed to process element {element_id}")
                        failed_elements.append(element_id)
                        continue

                    element_type = layout_element.element_type

                    # 对文本类型的内容进行连字符处理
                    if element_type in [ElementType.TEXT, ElementType.PARAGRAPH_TITLE, 
                                       ElementType.DOCUMENT_TITLE, ElementType.ABSTRACT]:
                        markdown_content = self._process_hyphenated_text(markdown_content)
                    
                    # 保存到映射中，键为阅读顺序索引
                    content_blocks_map[order_index] = ContentBlock(
                        element_id=element_id,
                        element_type=element_type,
                        raw_markdown=markdown_content
                    )
                    success_count += 1
        
        # 按阅读顺序重组内容块
        content_blocks = []
        for order_index in sorted(content_blocks_map.keys()):
            content_blocks.append(content_blocks_map[order_index])
        
        # 创建内容解析结果
        result = ContentParsingResult(
            page_num=page_num,
            content_blocks=content_blocks,  # 已按阅读顺序排序
            processing_time=time.time() - start_time,
            success_count=success_count,
            failed_elements=failed_elements
        )
        
        return result

    def _should_skip_element(self, element_type: ElementType) -> bool:
        """
        判断元素是否应该跳过处理
        
        Args:
            element_type: 元素类型
            
        Returns:
            bool: 是否跳过处理
        """
        # 这些类型的元素应该跳过处理
        skip_types = [
            ElementType.PAGE_NUMBER,  # 页码
            ElementType.HEADER,       # 页眉
            ElementType.FOOTER        # 页脚
        ]
        
        return element_type in skip_types
    
    def _should_save_as_image(self, element_type: ElementType, table_as_image: bool = False) -> bool:
        """
        判断元素是否应该保存为图像
        
        Args:
            element_type: 元素类型
            table_as_image: 是否将表格保存为图像
            
        Returns:
            bool: 是否保存为图像
        """
        # 这些类型的元素直接保存为图像
        image_types = [
            ElementType.IMAGE,
            ElementType.CHART,
            ElementType.CHEMICAL_FORMULA,
        ]
        
        # 表格根据配置决定是否保存为图像
        if element_type == ElementType.TABLE and table_as_image:
            return True
            
        return element_type in image_types
    
    def _crop_element_image(self, page_image: np.ndarray, bbox: BoundingBox) -> np.ndarray:
        """
        裁剪元素图像
        
        Args:
            page_image: 页面图像
            bbox: 边界框
            
        Returns:
            np.ndarray: 裁剪后的元素图像
        """
        # 获取图像尺寸
        height, width = page_image.shape[:2]
        
        # 计算裁剪区域（确保在图像范围内）
        x1 = max(0, int(bbox.x))
        y1 = max(0, int(bbox.y))
        x2 = min(width, int(bbox.x + bbox.width))
        y2 = min(height, int(bbox.y + bbox.height))
        
        # 裁剪图像
        cropped = page_image[y1:y2, x1:x2]
        
        return cropped
    
    def _process_image_element(
        self, 
        layout_element: LayoutElement, 
        element_image: np.ndarray,
        element_image_path: str,
        images_dir: str
    ) -> ContentBlock:
        """
        处理需要保存为图像的元素
        
        Args:
            layout_element: 布局元素
            element_image: 元素图像
            element_image_path: 元素图像路径
            images_dir: 图像输出目录
            
        Returns:
            ContentBlock: 内容块
        """
        element_id = layout_element.element_id
        element_type = layout_element.element_type
        
        # 保存图像到输出目录
        image_filename = f"{element_id}.png"
        image_save_path = os.path.join(images_dir, image_filename)
        
        # 确保输出目录存在
        os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
        
        # 复制图像文件
        shutil.copy(element_image_path, image_save_path)
        
        # 获取图像信息
        height, width = element_image.shape[:2]
        file_size = os.path.getsize(image_save_path)
        
        # 创建图像信息，确保路径使用正确的分隔符，并始终以 "images/" 开头
        image_path = f"images/{image_filename}"
        
        image_info = ImageInfo(
            element_id=element_id,
            original_bbox=layout_element.bbox,
            saved_path=image_path,
            width=width,
            height=height,
            format="PNG",
            file_size=file_size
        )
        
        # 生成HTML格式的图片标记，默认缩放50%，居中对齐
        # 直接使用相对路径，不添加./前缀
        raw_markdown = f'<div style="text-align:center;"><img src="{image_path}" style="zoom:50%;" /></div>'
        
        return ContentBlock(
            element_id=element_id,
            element_type=element_type,
            raw_markdown=raw_markdown,
            image_info=image_info
        )
    
    def _get_prompts_for_element_type(self, element_type: ElementType) -> str:
        """
        根据元素类型获取适合的提示词
        
        Args:
            element_type: 元素类型
            
        Returns:
            str: 用户提示词
        """
        # 默认提示词
        default_user_prompt = r"""**主要目标:**
请精确地识别并转录所提供图像中的所有文本和数学公式，并输出为 Markdown 内联LaTeX（`$...$`）格式。在处理过程中，务必严格区分"行内公式"与"块级/陈列公式"的结构，并遵循下述格式化指令。

**格式化指令:**

1.  **通用文本:**
    *   所有常规文本需逐字转录。
    *   保留原始的段落换行。
    *   使用 Markdown 语法复现原文的文本样式，注意某些在markdown语法中有含义的符号（如星号 `*`）需要显示时需要转义 `\*`
    *   请使用markdown语法结构表示排版信息，如标题使用井号进行分级。
    *   重要原则:直接输出识别结果，避免任何图片中没有的任何输出，避免任何解释性输出。
2.  **行内公式 (Inline Math):**
    *   对于那些嵌入在文本行**内部**的数学变量、符号或简短表达式（例如："...函数值 $\phi = f(x)$..."），请使用**单美元符号** (`$...$`) 将其包裹！！！
3.  **块级/陈列公式 (Display Math) :**
    *   对于任何**居中显示、独立成行、作为一个完整区块**呈现的方程式，你**必须**使用**双美元符号** (`$$...$$`) 将其格式化为块级公式，并且双美元符号单独成行
    *   **处理公式编号:** 如果图像中的块级公式带有编号（如 `(1.2)`），请务必使用 `\tag{...}` 命令将该编号放置在 `$$...$$` 数学环境的**内部**。
4.  **LaTeX 语法规范:**
    *   使用标准的 LaTeX 命令来表示所有数学符号（如 `\phi`, `\varepsilon`, `\sigma_n`）、运算符（如 `\prod`）以及特殊字体（如 `\mathcal{N}` 代表花体，`\mathbf{y}` 代表粗体）。
    *   确保正确使用特定符号，例如用 `\mid` 表示条件概率中的竖线。
5.  **重要提示:**
    *  请你反复确保：当没有使用美元号囊括时，不要使用LaTeX语法！！！

直接生成图片中的内容，避免任何其他无关信息,另外坚决不要用'''代码块的格式！！！

"""
        
        # 根据元素类型选择不同的提示词
        if element_type == ElementType.TABLE:
            user_prompt = r"""你是一位专业的表格数据转录专家，尤其擅长从图片中解析结构复杂的学术和科学表格。你的任务是将我提供的表格图片，转换为一个**结构完美、高保真度**的 Markdown 表格。

请严格遵守以下核心指令，以确保输出质量达到最高标准：

1. 分析并复现层级结构：

*   **多级表头处理：** 仔细观察表格的表头部分。如果存在多级或层级关系的表头，**请勿**将其"扁平化"处理成一个单行表头。你必须使用多个 Markdown 表头行来精确地复现这种层级关系。
*   **合并单元格识别：** 识别那些视觉上跨越多列的表头（即合并单元格），并在你的多行表头结构中正确体现这种分组。例如，一个顶层标题应位于第一个表头行，其下属的子标题应位于其正下方的第二个表头行中。

2. 使用精确的科学与数学符号转录所有数学符号以及希腊字母时，必须使用 Markdown 兼容的 LaTeX 语法（即用 `$` 符号包裹）。

3. 确保数据与内容的完整性：

*   **精确转录：** 完全按照原文转录所有文本和数字数据，确保负号（`-`）、圆括号（`()`）和方括号（`[]`）等符号的准确无误。
*   **处理空白单元格：** 如果原始表格中的单元格是空的，或仅包含一个破折号（`-`），请在最终的 Markdown 表格中也将其表示为相应的空白单元格。

**4. 保持整体结构一致性：**

*   **保留维度：** 最终生成的 Markdown 表格必须与原始图片包含相同数量的数据行。
*   **对齐方式：** 如果原始表格有明显的主导对齐方式（例如，整体居中对齐），请在表头分隔行中使用相应的 Markdown 语法（例如 `| :---: | :---: |`）来复现它，注意确保每行 | 的数量一致，确保xetex可以正常渲染。

你的输出应该是一个**单一、纯净的 Markdown 表格**，其中包含完整且结构准确的表格。**请勿**在前后添加任何额外的解释性文字。

示例输出如下（你不应该加'''这种代码块的格式！！！）：
|                | Standard regressions |                |             |      | State-dependent regressions |              |                  |                  |          |       |          |             |
| :------------: | :------------------: | :------------: | :---------: | :--: | :-------------------------: | :----------: | :--------------: | :--------------: | :------: | :---: | :------: | :---------: |
|                |      $\alpha_1$      | $SE(\alpha_1)$ | $R^2_{adj}$ | $T$  |         Minus-plus          |              |                  |                  |          |       |  Cubic   |             |
|                |                      |                |             |      |         $\alpha_1$          | $\alpha_1^+$ | $SE(\alpha_1^-)$ | $SE(\alpha_1)^+$ | $Wald^a$ | $T^+$ | $Wald^b$ | $R^2_{adj}$ |
|  Switzerland   |         1.05         |     (0.60)     |    0.87     | 1163 |            3.17             |    -2.01     |      (2.61)      |      (0.78)      |  [0.09]  |  950  |  [0.44]  |    1.23     |
......"""
        
        elif element_type == ElementType.CODE_BLOCK:
            user_prompt = r"""你是一位专业的代码图像识别专家，具备精准的编程语言语法和代码结构识别能力。将输入的代码图片转换为标准的markdown代码块格式，精确识别结构元素，确保语法、缩进、符号和代码逻辑完全准确。

**输出要求**

1. **唯一输出**：仅输出markdown代码块格式的代码，不包含任何解释、描述或其他文本
2. **格式规范**：使用标准markdown代码块语法 ```language
3. **语言识别**：准确识别编程语言并标注在代码块开头
4. **保持原样**：完全保留原始代码的格式、缩进、注释和空行

**输出格式模板**

```[编程语言]
[完整代码内容]
```"""
        
        elif element_type == ElementType.ALGORITHM:
            user_prompt = r"""你是一位专业的算法图像识别专家，具备精准的数学公式和算法结构识别能力。将输入的算法图片转换为标准的markdown内联LaTeX格式，确保数学符号、算法结构和排版完全准确。

输出要求

1. **唯一输出**：仅输出markdown内联LaTeX格式的算法，不包含任何解释、描述或其他文本
2. **格式规范**：使用 `$$ ... $$` 包围完整算法块
3. **结构完整**：精准识别算法的所有要素（标题、输入、输出、步骤、条件分支等）
4. **重要要求**：确保输出可以被xetex正常渲染

输出格式模板

$$
\begin{aligned} 
\hline 
&\textbf{[算法名称]} \\[5pt] 
\hline \\[-10pt] 
\textbf{Input:} &\ \text{[输入参数描述]} \\ 
\textbf{Output:} &\ \text{[输出结果描述]} \\[5pt] 
\hline \\[-10pt] 
&[步骤编号]. \quad \text{[算法步骤内容]} \\ 
&[继续其他步骤...] \\[5pt] 
\hline 
\end{aligned}
$$

示例：

$$
\begin{aligned}
\hline
&\textbf{Algorithm 2: Active learning loop with a BNN} \\[5pt]
\hline \\[-10pt]
1. &\ \textbf{while } U \neq  \varnothing \textbf{ and } \mathop{\sum }\limits_{{\mathbf{y} \mid  {\mathbf{x}}_{\max }, D}} < \text{threshold and } C < \operatorname{MaxC} \textbf{ do} \\
2. &\quad \text{Draw } \Theta  = \left\{  {{\theta }_{i} \sim  p\left( {\theta  \mid  D}\right)  \mid  i \in  \lbrack 0, N)}\right\} \\ 
3. &\quad \textbf{for } \mathbf{x} \in  U \textbf{ do} \\
4. &\quad \quad \mathop{\sum }\limits_{{\mathbf{y} \mid  \mathbf{x}, D}} = \frac{1}{\left| \Theta \right|  - 1}\mathop{\sum }\limits_{{{\theta }_{i} \in  \Theta }}\left( {{\Phi }_{{\theta }_{i}}\left( \mathbf{x}\right)  - \widehat{\mathbf{y}}}\right) {\left( {\Phi }_{{\theta }_{i}}\left( \mathbf{x}\right)  - \widehat{\mathbf{y}}\right) }^{\top } \\ 
5. &\quad \quad \textbf{if } {\sum }_{\mathbf{y} \mid  \mathbf{x}, D} > {\sum }_{\mathbf{y} \mid  {\mathbf{x}}_{\max }, D} \textbf{ then} \\
6. &\quad \quad \quad {\mathbf{x}}_{\max } = {\mathbf{x}}_{r} \\ 
7. &\quad \quad \textbf{end if} \\
8. &\quad \textbf{end for} \\
9. &\quad {D}_{x} = {D}_{x} \cup  \left\{  {x}_{\max }\right\} \\
10. &\quad {D}_{y} = {D}_{y} \cup  \left\{  {\operatorname{Oracle}\left( {x}_{\max }\right) }\right\} \\ 
11. &\quad U = U \smallsetminus  \left\{  {x}_{\max }\right\} \\
12. &\quad C = C + 1 \\ 
13. &\ \textbf{end while} \\[5pt]
\hline
\end{aligned}
$$

关键注意事项

- 精确识别所有数学符号、下标、上标
- 保持原有的缩进和对齐结构
- 正确处理条件语句（if-then-else）和循环结构
- 确保分隔线（\hline）和间距（\[5pt]）的准确性
- 变量名和函数名需完全一致，包括粗体、斜体格式"""
        
        elif element_type == ElementType.TABLE_OF_CONTENTS:
            user_prompt = r"""你是一位专业的文档目录识别专家，具备精准的文档结构分析和层级关系识别能力。将输入的目录图片转换为标准的markdown目录格式，确保层级结构、页码信息和标题内容完全准确。

输出要求

1. **唯一输出**：仅输出markdown格式的目录，不包含任何解释、描述或其他文本
2. **层级保持**：完全保留原始目录的层级结构
3. **信息完整**：包含所有标题、子标题和对应页码

输出格式模板：

目录

第一章 章节标题 ........................ 1
	1.1 一级小节标题 ...................... 5
		1.1.1 二级小节标题 .................. 8
		1.1.2 另一个二级小节标题 ............ 12
	1.2 另一个一级小节标题 ............... 15

第二章 另一个章节标题 ................. 20
	2.1 小节标题 ......................... 23
	2.2 小节标题 ......................... 28
......"""
        
        else:
            # 使用默认提示词
            user_prompt = default_user_prompt
        
        return user_prompt
    
    def _save_debug_info(self, result: ContentParsingResult, output_file: str):
        """
        保存调试信息
        
        Args:
            result: 内容解析结果
            output_file: 输出文件路径
        """
        import json
        from typing import Any, Dict
        
        # 创建可序列化的结果字典
        result_dict: Dict[str, Any] = {
            "page_num": result.page_num,
            "processing_time": result.processing_time,
            "success_count": result.success_count,
            "failed_elements": result.failed_elements,
            "content_blocks": []
        }
        
        for block in result.content_blocks:
            block_dict: Dict[str, Any] = {
                "element_id": block.element_id,
                "element_type": block.element_type.value,
                "raw_markdown": block.raw_markdown
            }
            
            if block.image_info:
                block_dict["image_info"] = {
                    "saved_path": block.image_info.saved_path,
                    "width": block.image_info.width,
                    "height": block.image_info.height,
                    "format": block.image_info.format,
                    "file_size": block.image_info.file_size
                }
            
            result_dict["content_blocks"].append(block_dict)
        
        # 保存为JSON文件
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result_dict, f, indent=2, ensure_ascii=False)
    
    def __del__(self):
        """析构函数，清理临时目录"""
        if hasattr(self, 'temp_dir') and not self.debug_mode:
            try:
                if os.path.exists(self.temp_dir):
                    shutil.rmtree(self.temp_dir)
            except Exception as e:
                if hasattr(self, 'logger'):
                    self.logger.warning(f"Failed to clean up temporary directory: {str(e)}") 

    def _process_hyphenated_text(self, text: str) -> str:
        """
        处理文本中的连字符分割单词，合并行末尾带连字符的单词
        特别处理学术文本中的特殊情况
        
        Args:
            text: 原始文本内容
            
        Returns:
            str: 处理后的文本
        """
        # 检查是否存在连字符问题
        if '-\n' not in text and not any(line.endswith('-') for line in text.splitlines()):
            return text
        
        # 分割为行
        lines = text.splitlines()
        result_lines = []
        
        # 处理每一行
        i = 0
        while i < len(lines):
            current_line = lines[i].rstrip()
            
            # 检查当前行是否以连字符结尾
            if current_line.endswith('-') and i + 1 < len(lines):
                next_line = lines[i + 1].lstrip()
                
                # 检查是否是真正的连字符分割单词，而不是特殊符号或公式
                # 学术文本中常见的不应合并的情况：数学符号、引用、特殊标点等
                skip_merge = False
                
                # 检查连字符前面的字符
                if len(current_line) > 1:
                    char_before_hyphen = current_line[-2]
                    # 连字符前是数字、特殊符号，可能是数学表达式或引用，不合并
                    if (char_before_hyphen.isdigit() or 
                        char_before_hyphen in '\\${}[]()^_*'):
                        skip_merge = True
                
                # 检查下一行的第一个字符
                if next_line and not skip_merge:
                    first_char = next_line[0]
                    # 下一行首字符是特殊字符，可能不是分割的单词
                    if not first_char.isalpha() and first_char not in "'":
                        skip_merge = True
                
                if not skip_merge:
                    # 获取下一行的第一个单词（不含空格）
                    next_first_word = next_line.split(' ')[0] if next_line else ""
                    
                    # 移除当前行末尾的连字符并与下一行的第一个单词合并
                    merged_line = current_line[:-1] + next_first_word
                    result_lines.append(merged_line)
                    
                    # 更新下一行，移除已合并的单词
                    next_line_parts = next_line.split(' ', 1)
                    if len(next_line_parts) > 1:
                        lines[i + 1] = next_line_parts[1]
                    else:
                        lines[i + 1] = ""
                else:
                    # 不合并的情况，保留原样
                    result_lines.append(current_line)
            else:
                # 当前行不需要处理，直接添加
                result_lines.append(current_line)
            
            i += 1
        
        # 过滤掉空行
        result_lines = [line for line in result_lines if line.strip()]
        
        # 重新合并为文本，保持段落格式
        # 如果有两个连续的空行，则认为是段落分隔
        result = []
        current_paragraph = []
        
        for line in result_lines:
            if not line.strip():
                if current_paragraph:
                    result.append(" ".join(current_paragraph))
                    current_paragraph = []
            else:
                current_paragraph.append(line)
        
        if current_paragraph:
            result.append(" ".join(current_paragraph))
        
        return "\n\n".join(result) 