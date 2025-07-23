# Markdown 文档翻译工具

本工具用于将多种格式的文档翻译成中文或其他语言，同时保持原始格式和专业术语的准确性。

## 功能特点

- 多格式支持：支持Markdown、TXT、DOCX等多种文档格式
- 智能分块：根据语义将长文档分成合适大小的块
- 内容优化：优化文本块以确保语义完整性和格式正确性
- 专业翻译：使用 AI 模型进行高质量翻译，保持专业术语准确性
- 格式保持：保留原始格式、LaTeX 公式和表格结构
- 多语言支持：支持翻译成多种目标语言
- 统一输出：输出统一使用markdown内联latex格式

## 处理流程

整个翻译过程分为三个主要步骤：

1. **文本分块**：将长文档分割成适当大小的块，优化分块边界
2. **内容优化**：对每个文本块进行语义优化，统一为markdown内联latex格式
3. **翻译处理**：将优化后的文本块翻译成目标语言并合并

## 支持的文件格式

- **.md**：Markdown文件
- **.txt**：纯文本文件
- **.docx**：Microsoft Word文档
- **.doc**：旧版Word文档（需要先转换为.docx格式）

注意：对于DOCX文件，需要安装python-docx库：`pip install python-docx`

## 命令行使用

### 完整翻译流程

```bash
python -m markdown_translator.translator [input_file] [-o OUTPUT] [-d] [--source SOURCE] [--target TARGET] [--max-length MAX_LENGTH] [--min-length MIN_LENGTH]
```

参数:
- `input_file`: 输入文件路径（支持.md, .txt, .docx格式）
- `-o/--output`: 输出文件路径（默认为原文件名_目标语言代码.md）
- `-d/--debug`: 开启调试模式，显示详细日志和保存中间文件
- `--source`: 源语言代码，默认为 "auto"（自动检测）
- `--target`: 目标语言代码，默认为 "zh"（中文）
- `--max-length`: 最大文本块长度（默认7000）
- `--min-length`: 最小文本块长度（默认5000）
- `--list-languages`: 列出所有支持的语言代码

### 单独步骤执行

如果需要单独执行某个步骤，可以使用以下命令：

#### 文本分块

```bash
python -m markdown_translator.chunk_splitter [input_file] [-o OUTPUT] [-d] [--max-length MAX_LENGTH] [--min-length MIN_LENGTH]
```

#### 内容优化

```bash
python -m markdown_translator.content_optimizer [input_file] [-o OUTPUT] [-d]
```

## 支持的语言

使用 `--list-languages` 选项查看所有支持的语言代码：

```bash
python -m markdown_translator.translator --list-languages
```

目前支持的语言包括：
- zh: 中文
- ja: 日语
- en: 英语
- fr: 法语
- de: 德语
- es: 西班牙语
- it: 意大利语
- ru: 俄语
- ko: 韩语
- pt: 葡萄牙语
- ar: 阿拉伯语
- hi: 印地语
- auto: 自动检测（仅用于源语言）

## 示例

翻译Markdown文档：
```bash
python -m markdown_translator.translator documents/paper.md -d
```

翻译Word文档：
```bash
python -m markdown_translator.translator documents/paper.docx -o output/paper_zh.md
```

翻译文本文件到日语：
```bash
python -m markdown_translator.translator documents/paper.txt --target ja
```

将日语文档翻译成英语：
```bash
python -m markdown_translator.translator documents/paper_ja.md --source ja --target en
```

自定义块大小：
```bash
python -m markdown_translator.translator documents/paper.md --max-length 8000 --min-length 6000
```

## 注意事项

- 确保已正确配置 API 密钥和模型参数
- 翻译大文档可能需要较长时间，请耐心等待
- 开启调试模式可查看详细日志和中间处理文件
- 自动检测语言功能仅适用于源语言，目标语言必须明确指定
- 处理DOCX文件需要安装python-docx库 