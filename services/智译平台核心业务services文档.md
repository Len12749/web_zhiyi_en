# 智译平台核心业务services文档

## 概述

智译平台是一个基于Next.js 15 + SSE异步架构的文档处理服务平台，集成了多种文档处理功能。平台后端由五个核心微服务组成，每个服务负责特定的文档处理功能。所有服务均采用FastAPI框架开发，支持异步处理和实时状态反馈。

## 服务架构

智译平台采用微服务架构，各服务独立运行，通过HTTP API进行通信。核心业务服务包括：

1. **PDF解析服务**：将PDF文档转换为Markdown格式
2. **图片转Markdown服务**：识别图片中的文字内容并转换为Markdown格式
3. **Markdown翻译服务**：翻译Markdown文档，保留原格式
4. **PDF翻译服务**：翻译PDF文档，保留原排版
5. **格式转换服务**：将Markdown文档转换为其他格式(Word、HTML、PDF、LaTeX)

所有服务均支持异步任务处理和SSE（Server-Sent Events）实时状态推送，确保用户能够获得即时的处理进度反馈。

## 服务详情

### 1. PDF解析服务 (pdf_to_markdown)

**功能**：将PDF文档解析为Markdown格式，支持表格处理和多语言翻译。

**技术特点**：
- 基于版面分析和OCR技术提取PDF内容
- 智能识别文档结构，包括标题、段落、列表和表格
- 支持表格以Markdown或图片形式输出
- 可选翻译功能，支持多种语言
- 支持多种输出选项：原文、译文、双语对照

**API端点**：
- `POST /parse`：上传PDF并开始解析任务
- `GET /status/{task_id}`：查询任务状态
- `GET /download/{task_id}`：下载解析结果

**服务端口**：8002

### 2. 图片转Markdown服务 (image-to-markdown)

**功能**：识别图片中的文字、公式、表格等内容，转换为Markdown格式。

**技术特点**：
- 基于大型视觉语言模型进行图像识别
- 支持手写文字、印刷体、数学公式识别
- 支持表格和代码块的结构化识别
- 输出标准Markdown格式

**API端点**：
- `POST /recognize`：上传图片并开始识别任务
- `GET /status/{task_id}`：查询任务状态
- `GET /download/{task_id}`：下载识别结果

**服务端口**：8004

### 3. Markdown翻译服务 (md_translate)

**功能**：翻译Markdown文档，保留原始格式和结构。

**技术特点**：
- 智能分块处理，保持Markdown结构完整
- 支持多种语言翻译
- 保留代码块、表格、链接等特殊元素格式
- 内容优化处理，提高翻译质量

**API端点**：
- `POST /translate`：上传Markdown文件并开始翻译任务
- `GET /status/{task_id}`：查询任务状态
- `GET /download/{task_id}`：下载翻译结果

**服务端口**：8003

### 4. PDF翻译服务 (pdf_translator)

**功能**：翻译PDF文档，保留原始排版和布局。

**技术特点**：
- 保留原PDF排版和布局
- 支持多种语言翻译
- 可选并排显示原文和译文
- 适用于论文、报告等格式要求严格的文档

**API端点**：
- `POST /translate-pdf`：上传PDF文件并开始翻译任务
- `GET /status/{task_id}`：查询任务状态
- `GET /download/{task_id}`：下载翻译结果

**服务端口**：8005

### 5. 格式转换服务 (format-conversion)

**功能**：将Markdown文档转换为其他格式，如Word、HTML、PDF和LaTeX。

**技术特点**：
- 基于Pandoc实现高质量格式转换
- 支持多种输出格式：Word、HTML、PDF、LaTeX
- PDF输出支持多种主题样式
- 保留文档结构和格式

**API端点**：
- `POST /convert`：上传Markdown文件并指定目标格式
- `GET /status/{task_id}`：查询任务状态
- `GET /download/{task_id}`：下载转换结果
- `GET /formats`：获取支持的格式和主题列表

**服务端口**：8001

## 服务通信流程

所有服务遵循相同的通信模式：

1. **任务提交**：前端通过POST请求提交文件和处理参数
2. **任务创建**：服务创建唯一任务ID，初始化任务状态
3. **异步处理**：任务在后台异步处理，不阻塞主线程
4. **状态查询**：前端通过SSE连接或轮询获取实时处理状态
5. **结果下载**：处理完成后，前端获取处理结果文件

## 支持的语言

平台支持以下语言的翻译和处理：

- 中文 (zh)
- 英语 (en)
- 日语 (ja)
- 韩语 (ko)
- 法语 (fr)
- 德语 (de)
- 西班牙语 (es)
- 俄语 (ru)

## 服务启动管理

所有服务都可以通过项目根目录下的`scripts/services`文件夹中的批处理文件启动：

- `start-pdf-to-markdown.bat`：启动PDF解析服务
- `start-image-to-markdown.bat`：启动图片转Markdown服务
- `start-markdown-translation.bat`：启动Markdown翻译服务
- `start-pdf-translation.bat`：启动PDF翻译服务
- `start-format-conversion.bat`：启动格式转换服务
- `service-manager.bat`：统一管理所有服务的启动和停止

## 错误处理与恢复

所有服务都实现了完善的错误处理机制：

1. **任务状态记录**：任务处理过程中的状态和错误信息会被记录
2. **错误通知**：处理失败时，通过SSE或回调通知前端
3. **资源清理**：任务完成或失败后，临时文件会被清理
4. **重试机制**：部分服务支持失败任务的重试



## 注意事项

1. 所有服务都有文件大小限制，超过限制的文件会被拒绝处理
2. PDF解析和翻译服务对PDF页数有限制
3. 服务之间相互独立，一个服务的故障不会影响其他服务
4. 所有处理结果默认保留7天，之后自动清理