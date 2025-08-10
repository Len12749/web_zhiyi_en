# 智译平台API文档

本文档详细描述了智译平台各服务的API接口、数据流程和参数规范。平台基于SSE异步架构，所有业务操作通过Server-Sent Events实现实时反馈。

## 目录

- [核心服务配置](#核心服务配置)
- [通用API流程](#通用api流程)
- [PDF解析服务](#pdf解析服务)
- [图片转Markdown服务](#图片转markdown服务)
- [Markdown翻译服务](#markdown翻译服务)
- [PDF翻译服务](#pdf翻译服务)
- [格式转换服务](#格式转换服务)
- [SSE实时状态更新](#sse实时状态更新)
- [Webhook回调](#webhook回调)

## 核心服务配置

平台的核心服务部署在以下端口：

```javascript
const CORE_SERVICES = {
  FORMAT_CONVERSION: 'http://localhost:8001',     // 格式转换
  PDF_TO_MARKDOWN: 'http://localhost:8002',       // PDF转Markdown
  MARKDOWN_TRANSLATION: 'http://localhost:8003',  // Markdown翻译
  IMAGE_TO_MARKDOWN: 'http://localhost:8004',     // 图片转Markdown
  PDF_TRANSLATION: 'http://localhost:8005',       // PDF翻译
}
```

## 通用API流程

所有文档处理服务遵循相同的API流程：

1. **文件上传**：通过`/api/files/upload`上传文件
2. **任务创建**：通过`/api/tasks/create`创建处理任务
3. **SSE连接**：通过`/api/sse/tasks/{taskId}`建立实时状态更新连接
4. **任务处理**：后端异步处理任务并通过SSE推送进度
5. **结果下载**：任务完成后通过`/api/tasks/{taskId}/download`下载结果

### 文件上传API

**端点**: `POST /api/files/upload`

**请求参数**:
- `file`: 文件数据 (FormData)
- `taskType`: 任务类型 (FormData)

**响应**:
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "storagePath": "uploads/{userId}/{taskType}/{date}/{timestamp}",
    "originalName": "example.pdf",
    "fileSize": 1024000,
    "timestamp": 1678954321000,
    "additionalInfo": {
      "pageCount": 10,
      "needsPageDetection": false,
      "pageDetectionMethod": "precise"
    }
  }
}
```

### 任务创建API

**端点**: `POST /api/tasks/create`

**请求参数**:
```json
{
  "taskType": "pdf-to-markdown",
  "inputFilename": "example.pdf",
  "inputFileSize": 1024000,
  "inputStoragePath": "uploads/{userId}/{taskType}/{date}/{timestamp}",
  "processingParams": {},
  "pageCount": 10
}
```

**响应**:
```json
{
  "success": true,
  "taskId": 123,
  "message": "任务创建成功",
  "sseUrl": "/api/sse/tasks/123",
  "requiredPoints": 50
}
```

### 任务下载API

**端点**: `GET /api/tasks/{taskId}/download`

**请求参数**: 无（路径参数taskId）

**响应**:
- 成功时: 返回文件流，同时设置适当的Content-Type和Content-Disposition头
- 失败时: 返回JSON错误信息

**积分扣除逻辑**:
- 首次下载时检查用户积分是否足够
- 如果积分足够，扣除积分并标记任务为"已下载"
- 如果积分不足，返回402状态码和错误信息
- 已下载过的文件再次下载不再扣除积分

**错误状态码**:
- 401: 用户未认证
- 402: 积分不足
- 403: 无权限访问此任务
- 404: 任务不存在或结果文件不存在
- 400: 任务尚未完成
- 500: 服务器内部错误

## PDF解析服务

将PDF文档解析为Markdown格式，支持表格处理和可选翻译。

**端口**: 8002

### 服务端点

- **解析PDF**: `POST /parse`
- **下载结果**: `GET /download/{taskId}`
- **健康检查**: `GET /health`

### 输入数据类型

**请求参数** (`/parse` 端点):
```
Content-Type: multipart/form-data
```

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| file | File | 是 | PDF文件 |
| table_mode | string | 是 | 表格处理方式，可选值：'markdown'或'image' |
| enable_translation | string | 否 | 是否启用翻译，值为'true'时启用 |
| target_language | string | 否 | 目标语言代码，如'zh'、'en'等 |
| output_options | string | 否 | 输出选项，逗号分隔，可选值：'original'、'translated'、'bilingual' |
| callback_url | string | 是 | 处理完成后的回调URL |

### 输出数据类型

**成功响应** (`/parse` 端点):
```json
{
  "task_id": "pdf-task-123456",
  "message": "任务已提交，正在处理中"
}
```

**下载响应** (`/download/{taskId}` 端点):
- 内容类型: `application/zip`
- 内容: ZIP压缩包，包含解析后的Markdown文件和图片资源

### 处理参数

```typescript
interface PDFToMarkdownParams {
  tableFormat: 'markdown' | 'image';
  enableTranslation?: boolean;
  targetLanguage?: SupportedLanguage;
  translationOutput?: ('original' | 'translated' | 'bilingual')[];
}
```

### API调用流程

1. **上传PDF文件**：通过`/api/files/upload`上传PDF文件
2. **创建任务**：通过`/api/tasks/create`创建PDF解析任务，指定表格处理方式和翻译选项
3. **解析处理**：服务将PDF解析为Markdown，处理表格，并根据需要翻译内容
4. **结果返回**：处理完成后返回包含Markdown文件的ZIP压缩包，包括:
   - 解析后的Markdown文本文件
   - 提取的图片资源
   - 表格图片(如选择image表格模式)
   - 翻译内容(如启用翻译)

## 图片转Markdown服务

将图片内容识别并转换为Markdown文本。

**端口**: 8004

### 服务端点

- **识别图片**: `POST /recognize`
- **下载结果**: `GET /download/{taskId}`
- **健康检查**: `GET /health`

### 输入数据类型

**请求参数** (`/recognize` 端点):
```
Content-Type: multipart/form-data
```

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| file | File | 是 | 图片文件(支持JPEG、PNG、GIF、WEBP) |
| callback_url | string | 是 | 处理完成后的回调URL |

### 输出数据类型

**成功响应** (`/recognize` 端点):
```json
{
  "task_id": "img-task-123456",
  "status": "processing",
  "message": "图片识别任务已提交"
}
```

**下载响应** (`/download/{taskId}` 端点):
- 内容类型: `text/markdown`
- 内容: Markdown文本文件，包含识别后的内容

### 处理参数

```typescript
interface ImageToMarkdownParams {
  // 无需额外参数
}
```

### API调用流程

1. **上传图片文件**：通过`/api/files/upload`上传图片文件(JPEG、PNG、GIF、WEBP)
2. **创建任务**：通过`/api/tasks/create`创建图片转Markdown任务
3. **图像识别**：服务识别图片中的文本内容、表格、图表等，并转换为结构化的Markdown格式
4. **结果返回**：处理完成后返回Markdown文本文件，包含:
   - 识别的文本内容
   - 表格结构(如有)
   - 列表和标题结构(如有)

## Markdown翻译服务

翻译Markdown文件内容，保留原始格式和排版。

**端口**: 8003

### 服务端点

- **翻译Markdown**: `POST /translate`
- **下载结果**: `GET /download/{taskId}`
- **健康检查**: `GET /health`

### 输入数据类型

**请求参数** (`/translate` 端点):
```
Content-Type: multipart/form-data
```

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| file | File | 是 | Markdown文件 |
| sourceLanguage | string | 是 | 源语言代码，如'zh'、'en'等 |
| targetLanguage | string | 是 | 目标语言代码，如'zh'、'en'等 |
| callback_url | string | 是 | 处理完成后的回调URL |

### 输出数据类型

**成功响应** (`/translate` 端点):
```json
{
  "task_id": "md-trans-123456",
  "message": "翻译任务已提交"
}
```

**下载响应** (`/download/{taskId}` 端点):
- 内容类型: `text/markdown`
- 内容: 翻译后的Markdown文本文件

### 处理参数

```typescript
interface MarkdownTranslationParams {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
```

### 支持的语言

```typescript
const SUPPORTED_LANGUAGES = {
  'zh': '中文',
  'en': '英语', 
  'ja': '日语',
  'ko': '韩语',
  'fr': '法语',
  'de': '德语',
  'es': '西班牙语',
  'ru': '俄语'
};
```

### API调用流程

1. **上传Markdown文件**：通过`/api/files/upload`上传Markdown文件
2. **创建任务**：通过`/api/tasks/create`创建Markdown翻译任务，指定源语言和目标语言
3. **翻译处理**：服务翻译Markdown内容，保留原始格式、链接、图片引用等结构
4. **结果返回**：处理完成后返回翻译后的Markdown文件，特点包括:
   - 保留原始Markdown语法结构
   - 保留代码块内容不翻译
   - 保留链接URL和图片路径
   - 翻译文本内容、标题、列表项等

## PDF翻译服务

翻译PDF文档内容，保留原始排版。

**端口**: 8005

### 服务端点

- **翻译PDF**: `POST /translate-pdf`
- **下载结果**: `GET /download/{taskId}`
- **健康检查**: `GET /health`

### 输入数据类型

**请求参数** (`/translate-pdf` 端点):
```
Content-Type: multipart/form-data
```

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| file | File | 是 | PDF文件 |
| sourceLanguage | string | 是 | 源语言代码，如'zh'、'en'等 |
| targetLanguage | string | 是 | 目标语言代码，如'zh'、'en'等 |
| callback_url | string | 是 | 处理完成后的回调URL |

### 输出数据类型

**成功响应** (`/translate-pdf` 端点):
```json
{
  "task_id": "pdf-trans-123456",
  "message": "PDF翻译任务已提交"
}
```

**下载响应** (`/download/{taskId}` 端点):
- 内容类型: `application/pdf`
- 内容: 翻译后的PDF文件

### 处理参数

```typescript
interface PDFTranslationParams {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
```

### API调用流程

1. **上传PDF文件**：通过`/api/files/upload`上传PDF文件
2. **创建任务**：通过`/api/tasks/create`创建PDF翻译任务，指定源语言和目标语言
3. **翻译处理**：服务翻译PDF内容，保留原始排版、图片和格式
4. **结果返回**：处理完成后返回翻译后的PDF文件，特点包括:
   - 保留原始PDF布局和排版
   - 保留原始图片和图表
   - 翻译文本内容
   - 保持字体样式和格式

## 格式转换服务

将Markdown文件转换为其他格式，如Word、HTML、PDF或LaTeX。

**端口**: 8001

### 服务端点

- **格式转换**: `POST /convert`
- **获取支持格式**: `GET /formats`
- **下载结果**: `GET /download/{taskId}`
- **健康检查**: `GET /health`

### 输入数据类型

**请求参数** (`/convert` 端点):
```
Content-Type: multipart/form-data
```

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| file | File | 是 | Markdown文件 |
| format | string | 是 | 目标格式，可选值: 'docx'(word)、'html'、'pdf'、'tex'(latex) |
| callback_url | string | 是 | 处理完成后的回调URL |

### 输出数据类型

**成功响应** (`/convert` 端点):
```json
{
  "task_id": "convert-123456",
  "status": "processing",
  "message": "格式转换任务已提交"
}
```

**支持格式响应** (`/formats` 端点):
```json
[
  "docx",
  "html",
  "pdf",
  "tex"
]
```

**下载响应** (`/download/{taskId}` 端点):
- 内容类型: 根据转换格式而定
  - Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - HTML: `text/html`
  - PDF: `application/pdf`
  - LaTeX: `application/x-tex`
- 内容: 转换后的文件

### 处理参数

```typescript
interface FormatConversionParams {
  targetFormat: 'word' | 'html' | 'pdf' | 'latex';
}
```

### 格式映射

前端格式与API格式映射关系:
```typescript
const formatMapping: Record<string, string> = {
  'word': 'docx',
  'html': 'html', 
  'pdf': 'pdf',
  'latex': 'tex'
};
```

### API调用流程

1. **上传Markdown文件**：通过`/api/files/upload`上传Markdown文件
2. **创建任务**：通过`/api/tasks/create`创建格式转换任务，指定目标格式
3. **格式转换**：服务将Markdown转换为目标格式，保留结构和样式
4. **结果返回**：处理完成后返回转换后的文件，支持以下格式:
   - Word (docx): 可编辑的Word文档
   - HTML: 网页格式，包含样式
   - PDF: 便于打印和分享的PDF文档
   - LaTeX (tex): 学术排版格式

## SSE实时状态更新

所有任务处理过程中，通过SSE（Server-Sent Events）提供实时状态更新。

**端点**: `GET /api/sse/tasks/{taskId}`

**SSE事件类型**:

1. **连接建立**:
```json
{
  "type": "connection_established",
  "data": {
    "connectionId": "abcd1234",
    "timestamp": "2023-01-01T12:00:00Z"
  }
}
```

2. **状态更新**:
```json
{
  "type": "status_update",
  "data": {
    "status": "processing",
    "progress": 45,
    "message": "正在解析第45页..."
  }
}
```

3. **心跳**:
```json
{
  "type": "heartbeat",
  "data": {
    "timestamp": "2023-01-01T12:01:00Z",
    "taskId": 123
  }
}
```

## Webhook回调

外部服务处理完成后，通过Webhook回调通知系统。

**端点**: `POST /api/tasks/webhook`

**请求参数**:
```json
{
  "externalTaskId": "ext-123456",
  "status": "completed",
  "message": "处理成功"
}
```

**响应**:
```json
{
  "success": true
}
```

---

## 文件大小和处理限制

- PDF文件：最大300MB，800页
- 图片文件：支持JPEG、PNG、GIF、WEBP格式
- Markdown文件：无特定大小限制，按字符数计费
- 处理超时：所有API请求最长处理时间为1小时