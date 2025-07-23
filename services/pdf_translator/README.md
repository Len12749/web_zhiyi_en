# PDF翻译工具

一个支持布局保持的PDF文档翻译工具，使用AI进行智能翻译。

## ✨ 特性

- 🔍 **智能布局检测**: 自动识别PDF中的文本、标题、列表等元素
- 🎯 **精准OCR识别**: 准确提取PDF中的文本内容
- 🌐 **AI智能翻译**: 支持多种语言的高质量翻译
- 📄 **布局保持**: 翻译后保持原文档的版式和格式
- 🎨 **字体适配**: 自动调整字体大小和样式
- 🖥️ **命令行界面**: 简单易用的命令行操作

## 🚀 安装

### 1. 创建虚拟环境

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置AI API服务

确保你的LiteLLM AI API服务正在运行：

```bash
# 启动AI API服务（需要在doc/ai_api_server中配置）
docker-compose up -d
```

## 📋 使用方法

### 基本用法

```bash
python cli.py -i input.pdf -o output.pdf
```

### 指定翻译语言

```bash
python cli.py -i input.pdf -o output.pdf --from-lang 英语 --to-lang 中文
```

### 翻译特定页面

```bash
# 翻译第1-5页（从0开始计数）
python cli.py -i input.pdf -o output.pdf --page-start 0 --page-end 5
```

### 并排显示原文和译文

```bash
python cli.py -i input.pdf -o output.pdf --side-by-side
```

### 使用自定义配置

```bash
python cli.py -i input.pdf -o output.pdf --config custom_config.yaml
```

## ⚙️ 配置文件

默认配置文件 `config.yaml`:

```yaml
translator:
  type: litellm
  base_url: http://localhost:4000/v1
  api_key: sk-litellm-master-key-2024
  model: deepseek-ai/DeepSeek-V3

layout:
  type: 'dit'
  device: 'cpu'
  DPI: 200

ocr:
  type: 'paddle'
  device: 'cpu'

font:
  type: 'simple'
```

## 🌍 支持的语言

- 中文、英语、日语、韩语
- 法语、德语、西班牙语、意大利语
- 葡萄牙语、俄语、阿拉伯语
- 更多语言...

## 📁 项目结构

```
pdf_translator/
├── cli.py              # 命令行入口
├── config.yaml         # 配置文件
├── modules/            # 核心模块
│   ├── translate/      # 翻译模块
│   ├── layout/         # 布局检测模块
│   ├── ocr/            # OCR模块
│   └── font/           # 字体处理模块
├── utils/              # 工具函数
├── fonts/              # 字体文件
├── models/             # AI模型
└── requirements.txt    # 依赖文件
```

## 🔧 故障排除

### 1. 模型加载错误

确保模型文件完整：
- `models/unilm/` - 布局检测模型
- `models/paddle-ocr/` - OCR模型

### 2. API连接错误

检查AI API服务是否运行：
```bash
curl http://localhost:4000/v1/models
```

### 3. 字体显示问题

确保字体文件存在。项目支持多种字体格式：

**中文字体：**
- `fonts/simhei.ttf` - 黑体
- `fonts/msyh.ttc` - 微软雅黑
- `fonts/simsun.ttc` - 宋体
- `fonts/NotoSansSC-VF.ttf` - Noto Sans SC
- `fonts/SourceHanSerifCN-Bold.ttf` - 思源宋体

**英文字体：**
- `fonts/TimesNewRoman.ttf` - Times New Roman
- `fonts/FreeMono.ttf` - FreeMono
- `fonts/arial.ttf` - Arial
- `fonts/calibri.ttf` - Calibri

**字体格式支持：**
- 支持 `.ttf` 格式字体文件
- 支持 `.ttc` 格式字体集合文件
- 自动检测和加载系统字体作为备选
- 智能字体选择，根据目标语言自动匹配合适的字体

### 4. 文本渲染优化

项目已优化文本渲染逻辑：
- 智能文本换行，避免超出边界框
- 基于实际字体尺寸计算文本布局
- 自动调整字体大小以适应文本框
- 支持多行文本的正确缩进和对齐

## 📖 使用示例

### 翻译学术论文

```bash
python cli.py -i research_paper.pdf -o translated_paper.pdf \
  --from-lang 英语 --to-lang 中文 \
  --side-by-side
```

### 批量翻译（可写脚本）

```bash
for file in *.pdf; do
  python cli.py -i "$file" -o "translated_$file" \
    --from-lang 英语 --to-lang 中文
done
```

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个工具。

## 📄 许可证

MIT License

