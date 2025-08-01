"""
核心数据结构模块
定义了PDF处理流程中所有需要的数据类和枚举类型
"""

from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum
from datetime import datetime

@dataclass
class BoundingBox:
    """
    边界框坐标信息
    用于定位PDF页面中的元素位置和大小
    """
    x: float              # 左上角X坐标（相对于页面左上角）
    y: float              # 左上角Y坐标（相对于页面左上角）
    width: float          # 元素宽度（像素或点）
    height: float         # 元素高度（像素或点）
    page_num: int         # 所属页面号（从1开始）

class ElementType(Enum):
    """
    PDF内容元素类型枚举
    定义了版面检测模型能够识别的所有元素类型
    """
    PARAGRAPH_TITLE = "paragraph_title"      # 段落标题
    IMAGE = "image"                          # 图像
    TEXT = "text"                            # 文本
    PAGE_NUMBER = "number"                   # 页码
    ABSTRACT = "abstract"                    # 摘要
    TABLE_OF_CONTENTS = "content"            # 目录
    TABLE = "table"                          # 表格
    REFERENCE = "reference"                  # 参考文献
    DOCUMENT_TITLE = "doc_title"             # 文档标题
    FOOTNOTE = "footnote"                    # 脚注
    HEADER = "header"                        # 页眉
    ALGORITHM = "algorithm"                  # 算法
    CODE_BLOCK = "code"                      # 代码块
    CHEMICAL_FORMULA = "chemical_formula"    # 化学式
    FOOTER = "footer"                        # 页脚
    CHART = "chart"                          # 数据统计类图表
    FIGURE_CAPTION = "figure_title"          # 图像标题（注释）
    TABLE_CAPTION = "table_title"            # 表格标题（注释）
    CHART_CAPTION = "chart_title"            # 图表（统计图）标题（注释）
    ASIDE_TEXT = "aside_text"                # 侧边文本

@dataclass
class PDFPage:
    """
    PDF页面信息
    包含页面基本属性和检测到的语言
    """
    page_num: int                           # 页面编号（从1开始）
    width: float                            # 页面宽度（点或像素）
    height: float                           # 页面高度（点或像素）
    dpi: int                                # 图像分辨率（每英寸点数）
    rotation: int                           # 页面旋转角度（0, 90, 180, 270度）
    detected_language: Optional[str]         # 检测到的主要语言代码（如"en", "zh"）
    image_path: Optional[str] = None        # 页面转换后的图像文件路径（调试模式）

@dataclass
class LayoutElement:
    """
    版面检测结果元素
    经过版面检测模型分析后，具有语义类型的元素
    """
    element_id: str                         # 全局唯一标识符（格式：page_num-element_index）
    element_type: ElementType               # 元素语义类型（如标题、段落、表格等）
    bbox: BoundingBox                       # 元素边界框
    confidence: float                       # 版面检测的置信度 (0.0-1.0)

@dataclass
class LayoutDetectionResult:
    """
    单页版面检测结果
    包含该页面所有检测到的布局元素
    """
    page_num: int                           # 页面编号
    elements: List[LayoutElement]           # 检测到的布局元素列表
    processing_time: float                  # 处理耗时（秒）

@dataclass
class ReadingOrderElement:
    """
    阅读顺序元素
    为布局元素分配阅读顺序
    """
    element_id: str                         # 对应的布局元素ID
    order_index: int                        # 在当前页面的阅读顺序索引（从0开始）
    confidence: float                       # 阅读顺序预测的置信度 (0.0-1.0)

@dataclass
class ReadingOrderResult:
    """
    单页阅读顺序分析结果
    包含该页面元素的完整阅读顺序信息
    """
    page_num: int                           # 页面编号
    ordered_elements: List[ReadingOrderElement]  # 按阅读顺序排列的元素列表
    processing_time: float                  # 处理耗时（秒）

@dataclass
class DebugInfo:
    """
    调试信息
    记录处理过程的关键信息
    """
    stage_name: str                         # 处理阶段名称
    processing_time: float                  # 处理耗时（秒）
    memory_usage: float                     # 内存使用量（MB）
    success: bool                           # 是否成功
    page_num: Optional[int] = None          # 页面编号（如果适用）
    element_id: Optional[str] = None        # 相关元素ID（如果适用）
    error_message: Optional[str] = None     # 错误信息（如果有）
    timestamp: datetime = field(default_factory=datetime.now)  # 时间戳

@dataclass
class ProcessingState:
    """
    处理状态
    跟踪整个文档处理的进度和状态
    """
    pdf_path: str = ""                      # 输入PDF文件路径
    current_stage: str = ""                 # 当前处理阶段
    completed_stages: List[str] = field(default_factory=list)  # 已完成的阶段列表
    
    # 进度信息
    total_pages: int = 0                    # 总页数
    processed_pages: int = 0                # 已处理页数
    progress_percentage: float = 0.0        # 进度百分比（0.0-100.0）
    
    # 调试信息（仅调试模式）
    debug_enabled: bool = False             # 是否启用调试模式
    debug_info: List[DebugInfo] = field(default_factory=list)  # 调试信息列表
    
    # 时间统计
    start_time: datetime = field(default_factory=datetime.now)  # 开始处理时间
    estimated_completion: Optional[datetime] = None  # 预计完成时间

@dataclass
class ImageInfo:
    """
    图像信息
    记录图像处理和存储的相关信息（包括表格、化学式的图像形式）
    """
    element_id: str                        # 对应的元素ID
    original_bbox: BoundingBox             # 在原PDF中的位置
    saved_path: str                        # 保存的图像文件路径（相对于images目录）
    width: int                             # 图像宽度（像素）
    height: int                            # 图像高度（像素）
    format: str                            # 图像格式（如"PNG", "JPEG"）
    file_size: int                         # 文件大小（字节）

@dataclass
class ContentBlock:
    """
    内容块
    解析后的内容元素，包含Markdown格式的内容
    """
    element_id: str                        # 对应的布局元素ID
    element_type: ElementType              # 元素类型
    
    # 核心内容
    raw_markdown: str                      # 纯markdown格式的内容，保持原始格式
    
    # 翻译内容（仅在要求翻译时使用）
    trans_markdown: Optional[str] = None   # 翻译后的markdown内容
    
    # 图像信息（IMAGE、TABLE、CHEMICAL_FORMULA类型使用）
    image_info: Optional[ImageInfo] = None  # 图像信息（用于图像、表格、化学式）
    confidence: float = 1.0                 # 内容解析置信度

@dataclass
class ContentParsingResult:
    """
    单页内容解析结果
    包含该页面所有元素的解析结果
    """
    page_num: int                          # 页面编号
    content_blocks: List[ContentBlock]     # 内容块列表
    processing_time: float                 # 总处理耗时（秒）
    success_count: int                     # 成功解析的元素数量
    failed_elements: List[str]             # 解析失败的元素ID列表

@dataclass
class HeadingLevel:
    """
    标题级别信息
    记录LLM模型重新分级后的标题级别
    """
    element_id: str                        # 对应的元素ID
    original_level: int                    # 原始级别（文档标题=1，段落标题=2）
    semantic_level: int                    # LLM语义分级后的级别（1-6）
    confidence: float                      # 分级的置信度 (0.0-1.0)

@dataclass
class HeadingLevelingResult:
    """
    标题分级结果
    包含所有标题的语义分级信息
    """
    heading_levels: List[HeadingLevel]     # 标题级别列表（按文档顺序）
    processing_time: float                 # 处理耗时（秒）
    total_headings: int                    # 总标题数量

@dataclass
class AssembledDocument:
    """
    组装完成的文档
    包含完整的文档结构和内容
    """
    # 基本信息
    detected_language: str                 # 检测到的主要语言
    total_pages: int                       # 总页数
    
    # 有序内容（按阅读顺序排列）
    ordered_content_blocks: List[ContentBlock]  # 按全局阅读顺序排列的内容块
    
    # 标题分级信息
    heading_levels: List[HeadingLevel]     # 标题分级结果
    
    # 图像列表
    images: List[ImageInfo]                # 所有图像信息（包括表格、化学式的图像形式）
    
    # 翻译设置
    translation_enabled: bool = False      # 是否启用了翻译
    target_language: Optional[str] = None  # 目标语言（如果启用翻译）
    
    # 处理统计
    total_elements: int = 0                    # 总元素数
    successful_elements: int = 0               # 成功处理的元素数
    failed_elements: List[str] = field(default_factory=list)             # 失败元素的ID列表
    total_processing_time: float = 0.0           # 总处理时间（秒）

@dataclass
class OutputConfiguration:
    """
    输出配置
    定义输出格式和选项
    """
    output_dir: str = ""                   # 输出目录路径
    base_filename: str = ""                # 基础文件名（不含扩展名）
    include_translation: bool = False      # 是否包含翻译
    target_language: str = "zh-CN"         # 目标语言
    translated_only: bool = False          # 只输出翻译
    bilingual_output: bool = True          # 双语输出
    table_as_image: bool = False           # 表格作为图像输出
    debug_mode: bool = False               # 是否启用调试模式
    original_output_options: list[str] = field(default_factory=list)  # 原始输出选项列表

@dataclass
class OutputFile:
    """
    输出文件信息
    记录生成的文件详情
    """
    file_type: str                         # 文件类型："original_md", "translated_md", "combined_md"
    file_path: str                         # 文件完整路径
    size_bytes: int                        # 文件大小（字节）
    created_at: datetime                   # 创建时间

@dataclass
class OutputResult:
    """
    输出结果
    记录完整的输出信息和状态
    """
    output_files: List[OutputFile]         # 生成的文件列表
    image_paths: List[str]                 # 图像文件路径列表
    processing_time: float                 # 处理时间（秒）
    errors: List[str] = field(default_factory=list)  # 错误信息列表
    warnings: List[str] = field(default_factory=list)  # 警告信息列表
    output_directory: str = ""             # 输出目录路径
    
    @property
    def success(self) -> bool:
        """是否成功完成"""
        return len(self.errors) == 0
    
    @property
    def output_path(self) -> Optional[str]:
        """获取主要输出文件路径"""
        if self.output_files and self.success:
            return self.output_files[0].file_path
        return None
    
    @property
    def error_message(self) -> Optional[str]:
        """获取错误信息"""
        if not self.success and self.errors:
            return "; ".join(self.errors)
        return None 