#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片转Markdown后台服务
基于FastAPI的HTTP服务，支持手写图片内容识别并转换为Markdown格式文本
"""

import os
import tempfile
import base64
from pathlib import Path
from typing import Optional
import uuid
import asyncio
from datetime import datetime
import aiohttp
import json
import re

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from PIL import Image
import io

# 创建FastAPI应用
app = FastAPI(title="图片转Markdown服务", description="手写图片内容识别转换为Markdown格式API", version="1.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI API配置 - 使用与PDF解析相同的Docker AI服务
AI_API_BASE_URL = os.getenv("AI_API_BASE_URL", "http://localhost:4000/v1")
AI_API_KEY = os.getenv("AI_API_KEY", "sk-litellm-master-key-2024")

# 支持的图片格式
SUPPORTED_IMAGE_FORMATS = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'
}

@app.get("/")
async def root():
    """服务健康检查"""
    return {
        "service": "图片转Markdown服务",
        "version": "1.0.0",
        "status": "running",
        "supported_formats": list(SUPPORTED_IMAGE_FORMATS),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

def clean_markdown_tags(content: str) -> str:
    """
    清理markdown标记，移除```markdown代码块标记
    
    Args:
        content: 原始内容
        
    Returns:
        str: 清理后的内容
    """
    # 移除```markdown和```标记
    markdown_pattern = re.compile(r'^```markdown\s*([\s\S]*?)```\s*$', re.MULTILINE)
    match = markdown_pattern.match(content)
    if match:
        content = match.group(1).strip()
        print("检测到markdown标记，已提取内容")
    
    # 移除其他可能的代码块标记
    code_block_pattern = re.compile(r'^```\s*([\s\S]*?)```\s*$', re.MULTILINE)
    match = code_block_pattern.match(content)
    if match:
        content = match.group(1).strip()
        print("检测到代码块标记，已提取内容")
    
    return content

async def process_image_with_ai(image_bytes: bytes, image_format: str) -> str:
    """
    使用AI API处理图片并返回识别的文本
    """
    try:
        # 将图片转换为base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # 构建请求数据
        payload = {
            "model": "Qwen/Qwen2.5-VL-32B-Instruct",  # 使用与PDF解析相同的视觉模型
            "messages": [
                {
                    "role": "system",
                    "content": "你是一位专业的图片文字识别专家，具备精准的文本、数学公式、表格和代码识别能力。你需要将输入的图片转换为标准的Markdown格式，确保所有内容都能被正确识别和格式化。"
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": get_comprehensive_image_recognition_prompt()
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{image_format};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 4000,
            "temperature": 0.1
        }
        
        # 发送请求到AI API
        async with aiohttp.ClientSession() as session:
            headers = {
                "Content-Type": "application/json"
            }
            if AI_API_KEY:
                headers["Authorization"] = f"Bearer {AI_API_KEY}"
            
            async with session.post(
                f"{AI_API_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=3600)  # 1小时超时
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=500,
                        detail=f"AI API请求失败: {response.status} - {error_text}"
                    )
                
                result = await response.json()
                
                # 提取识别结果
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    # 清理markdown标记
                    cleaned_content = clean_markdown_tags(content.strip())
                    return cleaned_content
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="AI API返回了无效的响应格式"
                    )
    
    except aiohttp.ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"网络请求失败: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"图片识别处理失败: {str(e)}"
        )

def validate_image(image_bytes: bytes, content_type: str) -> tuple[bool, str]:
    """
    验证图片格式和内容
    """
    try:
        # 检查content type
        if content_type not in SUPPORTED_IMAGE_FORMATS:
            return False, f"不支持的图片格式: {content_type}"
        
        # 使用PIL验证图片内容
        image = Image.open(io.BytesIO(image_bytes))
        
        # 检查图片尺寸
        width, height = image.size
        if width < 50 or height < 50:
            return False, "图片尺寸过小，最小尺寸为50x50像素"
        
        if width > 4096 or height > 4096:
            return False, "图片尺寸过大，最大尺寸为4096x4096像素"
        
        return True, "图片验证通过"
    
    except Exception as e:
        return False, f"图片格式验证失败: {str(e)}"

@app.post("/recognize")
async def recognize_image(
    file: UploadFile = File(..., description="要识别的图片文件")
):
    """
    识别图片中的文字内容并转换为Markdown格式
    """
    try:
        # 检查文件类型
        if not file.content_type or file.content_type not in SUPPORTED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型。支持的格式: {', '.join(SUPPORTED_IMAGE_FORMATS)}"
            )
        
        # 读取文件内容
        image_bytes = await file.read()
        
        # 检查文件大小（限制为10MB）
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="文件大小超过限制（最大10MB）"
            )
        
        # 验证图片
        is_valid, validation_message = validate_image(image_bytes, file.content_type)
        if not is_valid:
            raise HTTPException(status_code=400, detail=validation_message)
        
        # 使用AI API识别图片
        recognized_text = await process_image_with_ai(image_bytes, file.content_type)
        
        # 生成结果文件名
        original_name = file.filename or "image"
        result_filename = original_name.rsplit('.', 1)[0] + '_recognized.md'
        
        # 返回识别结果（JSON格式，与其他服务保持一致）
        return JSONResponse(
            content={
                "success": True,
                "markdown_content": recognized_text,
                "processing_time": 0.0,  # 处理时间（如需要可以计算实际时间）
                "original_filename": file.filename or "unknown",
                "result_filename": result_filename,
                "timestamp": datetime.now().isoformat()
            },
            headers={
                "X-Original-Filename": file.filename or "unknown",
                "X-Recognition-Timestamp": datetime.now().isoformat(),
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"图片识别处理失败: {str(e)}"
        )

def get_comprehensive_image_recognition_prompt() -> str:
    """
    获取综合的图片识别提示词，整合了PDF解析中的各种专业提示词
    重点强调只输出识别内容，避免说明文字
    """
    return r"""**主要目标:**
请精确地识别并转录所提供图像中的所有文本和数学公式，并输出为 Markdown 内联LaTeX（`$...$`）格式。在处理过程中，务必严格区分"行内公式"与"块级/陈列公式"的结构，并遵循下述格式化指令。

**重要说明：**
- 如果图片中包含纯图片内容（如图表、照片、图标等），请忽略这些纯图片内容，只输出文本部分
- 如果是表格等可解析的内容则输出
- 如果图片中完全没有文本内容，请输出空内容
- 只关注和转录图片中的文字、数字、符号和数学公式
- **重要：如果确定是纯图片（无任何文字内容），请直接输出空内容，不要输出任何占位符、说明文字或提示信息**

**格式化指令:**

1.  **通用文本:**
    *   所有常规文本需逐字转录。
    *   保留原始的段落换行。
    *   使用 Markdown 语法复现原文的文本样式，注意某些在markdown语法中有含义的符号（如星号 `*`）需要显示时需要转义 `\*`
    *   请使用markdown语法结构表示排版信息，如标题使用井号进行分级。
    *   重要原则:直接输出识别结果，避免任何图片中没有的任何输出，避免任何解释性输出。

2.  **标题分级处理:**
    *   根据标题的语义重要性和层级关系进行分级，使用1-6级标题（1级为最高级别）
    *   文档总标题通常为1级（使用 `#`）
    *   章节标题通常为2-3级（使用 `##` 或 `###`）
    *   小节标题通常为3-4级（使用 `###` 或 `####`）
    *   段落标题通常为4-5级（使用 `####` 或 `#####`）
    *   具体内容标题通常为5-6级（使用 `#####` 或 `######`）
    *   请按照标题的语义重要性和层级关系进行分级，确保层级结构合理

3.  **行内公式 (Inline Math):**
    *   对于那些嵌入在文本行**内部**的数学变量、符号或简短表达式（例如："...函数值 $\phi = f(x)$..."），请使用**单美元符号** (`$...$`) 将其包裹！！！

4.  **块级/陈列公式 (Display Math) :**
    *   对于任何**居中显示、独立成行、作为一个完整区块**呈现的方程式，你**必须**使用**双美元符号** (`$$...$$`) 将其格式化为块级公式，并且双美元符号单独成行
    *   **处理公式编号:** 如果图像中的块级公式带有编号（如 `(1.2)`），请务必使用 `\tag{...}` 命令将该编号放置在 `$$...$$` 数学环境的**内部**。

5.  **LaTeX 语法规范:**
    *   使用标准的 LaTeX 命令来表示所有数学符号（如 `\phi`, `\varepsilon`, `\sigma_n`）、运算符（如 `\prod`）以及特殊字体（如 `\mathcal{N}` 代表花体，`\mathbf{y}` 代表粗体）。
    *   确保正确使用特定符号，例如用 `\mid` 表示条件概率中的竖线。

6.  **重要提示:**
    *  请你反复确保：当没有使用美元号囊括时，不要使用LaTeX语法！！！

7.  **表格处理:**
    *   分析并复现层级结构，特别是多级表头
    *   识别合并单元格并正确体现分组关系
    *   使用精确的科学与数学符号，数学符号用 `$` 包裹
    *   确保数据完整性，精确转录所有文本和数字
    *   处理空白单元格，保持与原表格相同的维度
    *   使用适当的对齐方式（例如 `| :---: |` 居中对齐）
    *   确保每行 `|` 的数量一致

8.  **代码块处理:**
    *   准确识别编程语言并标注
    *   使用标准markdown代码块语法 ```language
    *   完全保留原始代码的格式、缩进、注释和空行
    *   确保语法、符号和代码逻辑完全准确

9.  **算法块处理:**
    *   使用 `$$ ... $$` 包围完整算法块
    *   精准识别算法的所有要素（标题、输入、输出、步骤、条件分支等）
    *   保持原有的缩进和对齐结构
    *   正确处理条件语句和循环结构
    *   确保所有数学符号、下标、上标的准确性

10. **目录处理:**
    *   完全保留原始目录的层级结构
    *   包含所有标题、子标题和对应页码
    *   使用适当的缩进表示层级关系

11. **纯图片内容处理:**
    *   如果图片中包含纯图片内容（如图表、照片、图标、装饰性图案等），请忽略这些内容
    *   只转录图片中的文字、数字、符号和数学公式
    *   如果是表格等可解析的内容则输出
    *   如果图片中完全没有文本内容，请输出空内容
    *   **绝对不要输出任何占位符、说明文字或提示信息**

直接生成图片中的内容，避免任何其他无关信息,另外坚决不要用'''代码块的格式！！！

请开始识别图片内容："""

def generate_mock_result(filename: str) -> str:
    """
    生成模拟的识别结果（当AI API不可用时使用）
    """
    # 根据文件名提供不同类型的示例内容
    if any(keyword in filename.lower() for keyword in ['math', 'formula', 'equation', '公式', '数学']):
        return """# 数学公式识别示例

## 基本方程

给定函数 $f(x) = ax^2 + bx + c$，其中 $a \neq 0$，我们可以通过配方法求解二次方程。

二次方程的求根公式为：

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\tag{1}$$

当判别式 $\\Delta = b^2 - 4ac$ 时：
- 若 $\\Delta > 0$，方程有两个不等实根
- 若 $\\Delta = 0$，方程有两个相等实根  
- 若 $\\Delta < 0$，方程有两个共轭复根

## 微积分基础

函数 $f(x)$ 在点 $x_0$ 处的导数定义为：

$$f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h} \\tag{2}$$

常见函数的导数：
- $(x^n)' = nx^{n-1}$
- $(\\sin x)' = \\cos x$
- $(e^x)' = e^x$
- $(\\ln x)' = \\frac{1}{x}$"""
    
    elif any(keyword in filename.lower() for keyword in ['table', 'chart', '表格', '图表']):
        return """# 表格数据识别示例

## 实验数据统计

| 实验组 | 样本数量 | 平均值 | 标准差 | $p$ 值 |
|:------:|:--------:|:------:|:------:|:------:|
| 对照组 | 30 | 85.2 | 12.4 | - |
| 实验组A | 28 | 92.7 | 10.8 | 0.032 |
| 实验组B | 32 | 88.9 | 11.2 | 0.156 |
| 实验组C | 29 | 94.1 | 9.6 | 0.018 |

## 结果分析

从上表可以看出：
1. 实验组A和实验组C的结果具有统计学意义（$p < 0.05$）
2. 实验组B与对照组相比无显著差异
3. 实验组C表现出最佳效果，标准差最小"""
    
    elif any(keyword in filename.lower() for keyword in ['code', 'program', '代码', '程序']):
        return """# 代码识别示例

## Python 函数定义

```python
def calculate_statistics(data):
    \"\"\"
    计算数据的基本统计量
    
    Args:
        data (list): 输入数据列表
        
    Returns:
        dict: 包含均值、中位数、标准差的字典
    \"\"\"
    import statistics
    
    if not data:
        return None
    
    result = {
        'mean': statistics.mean(data),
        'median': statistics.median(data),
        'stdev': statistics.stdev(data) if len(data) > 1 else 0
    }
    
    return result

# 使用示例
sample_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
stats = calculate_statistics(sample_data)
print(f"统计结果: {stats}")
```

## 算法复杂度分析

时间复杂度：$O(n)$  
空间复杂度：$O(1)$"""
    
    else:
        # 默认文本识别示例
        return f"""# 图片文字识别结果

## 主要内容

这是一段从图片中识别出的文本内容。图片识别技术可以将图像中的文字转换为可编辑的文本格式，支持多种语言和字体。

### 技术特点

- **高精度识别**：采用先进的光学字符识别（OCR）技术
- **多语言支持**：支持中文、英文等多种语言混合识别  
- **格式保持**：尽可能保持原始文档的排版和格式
- **智能纠错**：自动识别和纠正常见的识别错误

### 应用场景

1. 文档数字化处理
2. 手写笔记转换
3. 图片中的文字提取
4. 古籍文献数字化

### 注意事项

为了获得最佳的识别效果，建议：
- 确保图片清晰度足够
- 避免过度倾斜或扭曲
- 光线充足，对比度良好
- 字体大小适中，不要过小

---

*文件名：{filename}*  
*识别时间：{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}*"""

if __name__ == "__main__":
    print("=" * 60)
    print("图片转Markdown后台服务")
    print("=" * 60)
    print("服务地址: http://localhost:8004")
    print("API文档: http://localhost:8004/docs")
    print("Swagger UI: http://localhost:8004/redoc")
    print("-" * 60)
    print("支持的功能:")
    print("  • 手写文字识别")
    print("  • 印刷文字提取")
    print("  • 数学公式转换")
    print("  • 图表和表格识别")
    print("  • AI智能识别")
    print("  • Markdown格式输出")
    print("-" * 60)
    print("按 Ctrl+C 停止服务")
    print("=" * 60)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info",
        access_log=True
    ) 