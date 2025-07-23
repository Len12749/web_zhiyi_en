#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
streaming.py - 滚动窗口翻译处理器

版本: 4.1.0
作者: Liu Jingkang
最后更新: 2025-01-26
许可证: MIT

使用说明:
- 默认情况下，系统使用标准翻译流程，不进行内容优化检测
- 如需启用内容优化检测（检测算法重构、表格转换、代码优化等），
  可在调用函数时设置 enable_optimization_detection=True

示例用法:
1. 标准翻译（默认）:
   await translate_file(file_path)
   
2. 启用优化检测:
   await translate_file(file_path, enable_optimization_detection=True)
   
3. 批量处理启用优化:
   await process_files(files, output_dir, enable_optimization_detection=True)
"""
import asyncio
import os
import time
import json
from pathlib import Path
# 已移除OpenAI客户端依赖，现在使用SimpleLLMClient
from concurrent.futures import ThreadPoolExecutor
from typing import List, Tuple, Dict, Optional, Any
import httpx
import re
import sys

# 添加项目根目录到Python路径以解决导入问题
sys.path.insert(0, str(Path(__file__).parent.parent))

# 导入必要模块
from utils.segmenter import MarkdownSegmenter
# 已移除utils.content_optimizer，统一使用markdown_translator.content_optimizer
from utils.table_handler import TableHandler
from api_manager.config import load_config, get_data_dirs, get_task_config
from api_manager import get_client

# 获取数据目录
data_dirs = get_data_dirs()
WORK_DIR = data_dirs["workmd"]
OUTPUT_DIR = data_dirs["outputmd"]
ERROR_DIR = data_dirs["errormd"]
LOGS_DIR = data_dirs["logs"]

# 在OUTPUT_DIR下方添加日志目录
CHATLOG_DIR = OUTPUT_DIR / "chatlogs"
CHATLOG_DIR.mkdir(exist_ok=True, parents=True)
ERROR_DIR.mkdir(exist_ok=True, parents=True)

# 系统提示词
SYSTEM_PROMPT = r"""您是中英学术翻译专家，正在进行分段滚动翻译。  
【强制要求】 逐字逐句翻译，不能进行任何程度的精简。
对于表格，可能会有表格主体、表注、表题三个部分，表格主体使用"[TABLE_ID_数字]"格式的占位符，请在翻译中原样保留这些占位符，不要修改其ID或结构。对于其他表格结构，保持原html形式进行翻译，确保翻译和原文的表格数量、结构完全一致。
【翻译原则】准确、专业翻译，确保不生成无关内容。仍使用markdown内联latex的格式正文使用中文全角标点符号，数学文本中使用英文半角标点符号。插入图片的代码和表格形式保持原状不要作任何改动。
对于翻译文本的数学表达，双美元符公式块'$$'统一成单独成行，行内的内联公式'$'统一成前后空格。
你的翻译应该是在理解了语义的基础上的，对于原文中的数学符号，根据上下文理解，进行正确的修正翻译，例如对于不同的字母的字体"\mathrm"、"\mathbb"等，根据原文语义和管用写法，统一符号一致性。
注释内容规范：原文本数据中可能有并非标准的引注写法(可能是正文中突兀的数字)，
   - 对于判断为脚注/引注的内容，应使用Markdown的标准引注写法 `[^n]: 内容`，对应的脚注是`[^n]: 内容`。
   -  由于脚注和参考文献引用具有类似的文本解析的特征，因此需要根据语义进行判断、识别，区分参考文献引用和脚注：对于正文文本中有脚注特征的文本（可能是正文中突兀的数字），需要根据语义进行判断、识别是否有对应的脚注文本内容，如果没有很可能是参考文献引用，使用参考文献引用的写法(例如$^[1]$)，如果脚注可以找到对应正文，则使用脚注的写法(例如[...[^1] ...)
   - 对于判断为脚注文本，但是对应序号缺失的，使用 `[^]: 内容` 格式
   - 分析可能错误地将多个脚注放到一个块中的情况，根据语义拆分
【翻译的细节】
0. 对于翻译文本应保持连贯性，对于原文中破坏连贯性的注释等内容，在合适的位置保留并翻译但确保不要遗漏或重复，保持译文的连续性，。
1. 英文的长句翻译通常不会直接对应中文句式，你需要作出逻辑叙述的调整。
2. 为照顾汉语的习惯，采用一词两译的做法。例如"set"在汉语中有时译成"集合"有时译成"集"，单独使用时常译成"集合"，而在与其他词汇连用时则译成"集"（如可数集等）。
3. 汉语"是"通常有两种含义，一是"等于"，二是"属于"。在本书中"是"只表示等于的意思，而属于的意思则用"是一个"来表示。例如，不说"X是拓扑空间"，而说"X是一个拓扑空间"。
4. 在汉语中常难于区别单数和复数，而在英语的表达中又常常对于名词的复数形式与集合名词不加区别。对于这种情形，你需要宁可啰嗦一点，以保证不被误解
5. 将数学符号latex代码更优雅、正确表示，并可以根据原文理解修正符号表示或修正不恰当的转义，但不能修改任何形式上的表示如合并、缩略公式。并确保公式如有编号，使用'\tag{}'表示，且必须与原文一致。
例如对于
$$+y_{t}\right]=exp\left{-\rac{1}{2}(\frac{v_{1}^{2}h_{z,t}}{\phi}-ln\phi)-h_{y,t}(e^{-v_{y}0+v_{y}^{2}\pmb{\delta}^{2}/2}-1)\right}$$
(8)
根据上下文，可以修正为
$$
\left.+y_{t}\right]  = \exp\left\{ -\frac{1}{2}\left( \frac{v_{1}^{2}h_{z,t}}{\phi} - \ln\phi \right) - h_{y,t}\left( e^{-v_{y}\theta + v_{y}^{2}\delta^{2}/2} - 1 \right) \right\} \tag{8}
$$
"""

# R1模型的额外指令
R1_EXTRA_INSTRUCTIONS = r"""
翻译过程中对原文本可能的优化：

1.算法（伪代码）重构
例如：
对于一些算法，原文的样式如下
---

Given VG parameter $\sigma ,\nu ,\\theta$

For time $T$ and spot ${S}_{0}$

Set $N$ and calculate $h = T/N$

calculate $\\omega  = \\frac{1}{\\nu }\\log \\left( {1 - {\\theta \\nu } - {\\sigma }_{w}^{2}\\nu /2}\\right)$

for $i = 1,\\ldots , N$ do

	$z \\sim  \\mathcal{N}\\left( {0,1}\\right)$
	
	$g \\sim  \\mathrm{G}\\left( {h/\\nu ,\\nu }\\right)$
	
	${X}_{i} = {\\theta g} + \sigma \sqrt{g}z$
	
	$\\log {S}_{i} = \\log {S}_{i - 1} + \\left( {r - q}\\right) h + {\\omega h} + {X}_{i}$

end for

---

可以重写为：

$$
\begin{aligned}
\\hline
&\\textbf{[算法名,没有则留空]}\\[5pt]
\\hline \\[-10pt]
\\textbf{input:}  &\\text{参数 } \sigma, \\nu, \\theta, \\text{时间 } T, \\text{现货价 } S_0 \\\\
\\textbf{output:}  &\\text{对数价格路径 }  \\{\\log S_i\\}_{i=1}^N \\[5pt]
\\hline \\[-10pt]
&1. \\text{Set } N, \\text{calculate } h = T/N \\\\
&2. \\quad \\text{calculate } \\omega = \\frac{1}{\\nu}\\ln\\big(1 - \\theta\\nu - \\sigma^2\\nu/2\\big) \\\\
&3. \\quad \\textbf{for } i = 1 ,\\ldots N  \\\\
&4. \\quad \\quad z \\sim \\mathcal{N}(0,1) \\\\
&5. \\quad \\quad g \\sim \\mathrm{Gamma}(h/\\nu, \\nu) \\\\
&6. \\quad \\quad X_i = \\theta g + \\sigma\\sqrt{g}z \\\\
&7. \\quad \\quad \\ln S_i = \\ln S_{i-1} + (r - q)h + \\omega h + X_i \\\\
&8. \\quad \\textbf{endfor} \\[5pt]
\\hline
\\end{aligned}
$$

2.代码优化
翻译过程中碰到类似代码的语言（注意区别伪代码和代码，伪代码使用算法框），可以通过上下文或代码风格判断代码语言（这个示例是R语言，也可能是其他语言）
---

   tsplot(cbind(gtemp_land, gtemp_ocean), spaghetti=TRUE,

   	col=astsa.col(c(4,2),.7), pch=c(20,18), type="o", ylab="\\u00BOC",
   	
   	main="Global Surface Temperature Anomalies", addLegend=TRUE,
   	
   	location="topleft", legend=c("Land Surface","Sea Surface"))

---

   规范化如下：

   ```R
tsplot(cbind(gtemp_land, gtemp_ocean), 
       spaghetti=TRUE,
       col=astsa.col(c(4,2),.7), 
       pch=c(20,18), 
       type="o", 
       ylab="\u00B0C",
       main="Global Surface Temperature Anomalies", 
       addLegend=TRUE,
       location="topleft", 
       legend=c("Land Surface","Sea Surface"))
   ```
"""

def extract_partial_text(text: str, is_front_half: bool, max_ratio: float = 0.3) -> str:
    """
    提取文本的部分内容，用于构建历史消息
    
    Args:
        text: 原始文本
        is_front_half: 是否提取前半部分，True为前半部分，False为后半部分
        max_ratio: 提取的最大比例，默认0.3
    
    Returns:
        提取的部分文本
    """
    # 预编译正则表达式
    formula_block = re.compile(r'^\s*\$\$(.*?)\$\$\s*$', re.MULTILINE | re.DOTALL)
    code_block = re.compile(r'^```[^\n]*\n.*?^```', re.MULTILINE | re.DOTALL)
    html_table = re.compile(r'<table>.*?</table>', re.DOTALL)
    md_table = re.compile(r'^\|.*\|$\n^\|[-:\s|]*\|$(\n^\|.*\|$)*', re.MULTILINE)
    
    # 识别特殊块
    special_blocks = []
    
    # 查找所有公式块
    for match in formula_block.finditer(text):
        special_blocks.append({
            'start': match.start(),
            'end': match.end(),
            'text': match.group(0),
            'type': 'formula'
        })
    
    # 查找所有代码块
    for match in code_block.finditer(text):
        special_blocks.append({
            'start': match.start(),
            'end': match.end(),
            'text': match.group(0),
            'type': 'code'
        })
    
    # 查找所有HTML表格
    for match in html_table.finditer(text):
        special_blocks.append({
            'start': match.start(),
            'end': match.end(),
            'text': match.group(0),
            'type': 'table'
        })
    
    # 查找所有Markdown表格
    for match in md_table.finditer(text):
        special_blocks.append({
            'start': match.start(),
            'end': match.end(),
            'text': match.group(0),
            'type': 'table'
        })
    
    # 按位置排序特殊块
    special_blocks.sort(key=lambda x: x['start'])
    
    # 使用双换行符分段，同时保护特殊块
    paragraphs = []
    last_end = 0
    
    for block in special_blocks:
        # 处理特殊块前的普通文本
        if block['start'] > last_end:
            normal_text = text[last_end:block['start']]
            normal_paragraphs = [p for p in normal_text.split("\n\n") if p.strip()]
            paragraphs.extend(normal_paragraphs)
        
        # 添加特殊块作为单独段落
        paragraphs.append(block['text'])
        last_end = block['end']
    
    # 处理最后一个特殊块后的普通文本
    if last_end < len(text):
        normal_text = text[last_end:]
        normal_paragraphs = [p for p in normal_text.split("\n\n") if p.strip()]
        paragraphs.extend(normal_paragraphs)
    
    # 如果没有找到特殊块，直接按双换行符分段
    if not special_blocks:
        paragraphs = [p for p in text.split("\n\n") if p.strip()]
    
    # 如果只有一段，直接按比例处理
    if len(paragraphs) <= 1:
        total_len = len(text)
        max_chars = int(total_len * max_ratio)
        if is_front_half:
            return text[:max_chars]
        else:
            return text[-max_chars:]
    
    # 计算总长度和目标长度
    total_len = len(text)
    target_len = int(total_len * max_ratio)
    
    # 根据前半部分或后半部分选择不同的处理方式
    result_paragraphs = []
    current_len = 0
    
    if is_front_half:
        # 提取前半部分：从开始到目标长度
        for p in paragraphs:
            p_len = len(p) + 2  # +2 是考虑段落间的换行符
            if current_len + p_len <= target_len or not result_paragraphs:
                result_paragraphs.append(p)
                current_len += p_len
            else:
                break
    else:
        # 提取后半部分：从后向前直到达到目标长度
        for p in reversed(paragraphs):
            p_len = len(p) + 2  # +2 是考虑段落间的换行符
            if current_len + p_len <= target_len or not result_paragraphs:
                result_paragraphs.insert(0, p)
                current_len += p_len
            else:
                break
    
    return "\n\n".join(result_paragraphs)

def build_initial_user_prompt(text1: str, text2: str, use_r1: bool = False) -> str:
    """构建第一次调用的用户提示词"""
    # 对text2进行部分分割，只取前面部分
    partial_text2 = extract_partial_text(text2, True, 0.5) if text2 else ""
    
    base_prompt = f"""{SYSTEM_PROMPT}

我给出了[text1]和[text2]两段连续文本。
<text1>
{text1}
</text1>
<text2>
{partial_text2}
</text2>
你需要严格根据上述要求，仅翻译目标文本块[text1]，使上下文连贯
将所有原markdown文本都阅读并理解，翻译在目标文本块[text1]末尾附近结束，使上下文连贯的自然结束，使段落语义完整，代码块或公式块完整。[text2]仅作为提供下文理解和补充可能的被截断的信息的目的，避免过度翻译。
直接输出翻译后的文本。"""

    # 如果使用R1模型，添加额外指令
    if use_r1:
        return base_prompt + "\n\n" + R1_EXTRA_INSTRUCTIONS
    else:
        return base_prompt

def build_history_message(prev_text: str, current_text: str, next_text: str, prev_trans: str, use_r1: bool = False) -> Tuple[List[Dict], str]:
    """
    构建历史消息和下一个用户提示
    
    Args:
        prev_text: 前一段文本
        current_text: 当前要翻译的文本
        next_text: 下一段文本，可能为空
        prev_trans: 前一段的翻译结果
        use_r1: 是否使用R1模型
    
    Returns:
        (历史消息列表, 下一个用户提示词)
    """
    # 提取部分文本作为历史上下文
    partial_prev_text = extract_partial_text(prev_text, False) if prev_text else ""
    partial_prev_trans = extract_partial_text(prev_trans, False) if prev_trans else ""
    partial_next_text = extract_partial_text(next_text, True) if next_text else ""
    
    # 构建历史消息的提示词
    if next_text:
        history_prompt = f"""{SYSTEM_PROMPT}

我给出了[text1]、[text2]、[text3]三段连续文本，

<text1>
{partial_prev_text}
</text1>
<text2>
{current_text}
</text2>
<text3>
{partial_next_text}
</text3>

结合下文，严格按照上述指令翻译目标文本块[text1]。
在目标文本块[text1]末尾附近结束上下文连贯的自然结束，使段落语义完整，代码块或公式块完整。
直接输出翻译文本。"""
    else:
        history_prompt = f"""{SYSTEM_PROMPT}

我给出了[text1]、[text2]两段连续文本，

<text1>
{partial_prev_text}
</text1>
<text2>
{current_text}
</text2>

你需要严格根据上述要求，仅翻译目标文本块[text1]，使上下文连贯,逐字逐句翻译，不能进行任何程度的精简。
将所有原markdown文本都阅读并理解，翻译在目标文本块[text1]末尾附近结束，使上下文连贯的自然结束，使段落语义完整，代码块或公式块完整。[text2]仅作为提供下文理解和补充可能的被截断的信息的目的，避免过度翻译。
直接输出翻译后的文本。"""
    
    # 如果使用R1模型，添加额外指令
    if use_r1:
        history_prompt += "\n\n" + R1_EXTRA_INSTRUCTIONS
    
    # 构建历史消息列表
    history_messages = [
        {"role": "user", "content": history_prompt},
        {"role": "assistant", "content": partial_prev_trans}
    ]
    
    # 构建下一个用户提示词
    next_prompt = f"""{SYSTEM_PROMPT}

紧接着前文[text1]的翻译，结合上下文，严格按照上述指令翻译目标文本块[text2]。
从你上次回答结束的地方紧接翻译，避免遗漏或重复。在目标文本块[text2]末尾后结束，使段落完整，代码块或公式块完整。[text3]仅作为提供上下文理解和补充可能的被截断的信息的目的，避免过度翻译[text3]的内容。
直接输出翻译文本。
"""
    
    # 如果是最后一段，修改提示词
    if not next_text:
        next_prompt = f"""{SYSTEM_PROMPT}

紧接着你前文的翻译，严格按照上述指令翻译目标文本块[text2],直接输出翻译文本"""
    
    # 如果使用R1模型，添加额外指令
    if use_r1:
        next_prompt += "\n\n" + R1_EXTRA_INSTRUCTIONS
    
    return history_messages, next_prompt

def process_stream(stream):
    """处理流式响应并返回完整响应"""
    full_response = ""
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            content = chunk.choices[0].delta.content
            full_response += content
    return full_response

async def translate_segment(
    client,
    text: str,
    prev_text: str,
    next_text: str,
    prev_trans: str,
    is_first_segment: bool,
    is_last_segment: bool,
    log_file: Path,
    task_config: Optional[Dict[str, Any]] = None,
    enable_optimization_detection: bool = False
) -> Tuple[str, bool]:
    """
    翻译单个段落（新的滚动翻译逻辑）
    
    Args:
        client: 简化的LLM客户端
        text: 要翻译的文本
        prev_text: 前一段文本
        next_text: 下一段文本
        prev_trans: 前一段的翻译结果
        is_first_segment: 是否是第一段
        is_last_segment: 是否是最后一段
        log_file: 日志文件路径
        task_config: 任务配置，如果为None则使用默认配置
        enable_optimization_detection: 是否启用内容优化检测，默认False直接使用标准翻译流程
    
    Returns:
        (翻译结果, 是否使用了原文)
    """
    max_retries = 3
    retry_count = 0
    
    # 获取任务配置
    if task_config is None:
        task_config = get_task_config("streaming_translation")
    
    model_params = task_config.get("params", {})
    default_model = task_config.get("model", "deepseek-ai/DeepSeek-V3")
    
    while retry_count < max_retries:
        try:
            # 根据参数决定是否进行内容优化检测
            use_r1 = False
            if enable_optimization_detection:
                # 当启用优化检测时，可以在这里添加内容分析逻辑
                # 检测内容是否需要优化（算法重构、表格转换、代码优化等）
                detection_content = f"{prev_text}\n{text}\n{next_text}"
                # TODO: 在这里添加实际的优化检测逻辑
                # 例如：use_r1 = await detect_optimization_needed(detection_content)
                use_r1 = False  # 暂时保持为False，等待具体实现
                
                # 记录优化检测信息到日志
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"启用优化检测: 内容长度 {len(detection_content)} 字符\n")
                    f.write(f"检测结果: {'需要优化' if use_r1 else '标准翻译'}\n")
            else:
                # 默认情况下不进行优化检测，直接使用标准翻译流程
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write("跳过优化检测，使用标准翻译流程\n")

            # 动态模型选择
            if use_r1:
                model_name = task_config.get("r1_model", "deepseek-ai/DeepSeek-R1")
            else:
                model_name = default_model
                
            # 记录模型选择到日志
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"模型选择: {model_name}\n")
                f.write(f"优化需求: {use_r1}\n")

            # 构建消息
            if is_first_segment:
                if is_last_segment:
                    # 只有一个段落的情况
                    messages = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": build_initial_user_prompt(text, "", use_r1)}
                    ]
                else:
                    # 第一个段落，有后续段落
                    messages = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": build_initial_user_prompt(text, next_text, use_r1)}
                    ]
            else:
                # 中间或结尾段落，需要考虑历史上下文
                history_messages, next_prompt = build_history_message(
                    prev_text, text, next_text, prev_trans, use_r1
                )
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT}
                ] + history_messages + [
                    {"role": "user", "content": next_prompt}
                ]

            # 记录消息到日志
            with open(log_file, "a", encoding="utf-8") as f:
                f.write("\n\n== 请求消息 ==\n")
                for msg in messages:
                    f.write(f"{msg['role'].upper()}:\n{msg['content']}\n\n")

            # 使用简化的API客户端进行调用
            response = await client.chat_completion(
                model=model_name,
                messages=messages,
                **model_params
            )
            
            translation = client.get_response_content(response)

            # 记录翻译结果到日志
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n== 响应 ==\n{translation}\n")

            return translation, False

        except Exception as e:
            retry_count += 1
            print(f"翻译错误: {str(e)}, 第{retry_count}次重试...")
            
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n翻译错误: {str(e)}, 第{retry_count}次重试...\n")
            
            if retry_count < max_retries:
                await asyncio.sleep(2 ** retry_count)
                continue
    
    # 达到最大重试次数后返回原文
    print(f"连续{max_retries}次翻译失败，将使用原文...")
    return text, True

async def translate_file(file_path: Path, task_name: str = "streaming_translation", enable_optimization_detection: bool = False):
    """
    处理单个文件的滚动翻译
    
    Args:
        file_path: 要翻译的文件路径
        task_name: 任务配置名称，默认为"streaming_translation"
        enable_optimization_detection: 是否启用内容优化检测，默认False直接使用标准翻译流程
    """
    # 获取任务配置和API客户端
    task_config = get_task_config(task_name)
    client = get_client()
    
    # 初始化错误标记
    file_specific_error = False
    
    try:
        # 创建专属日志文件
        log_file = CHATLOG_DIR / f"{file_path.stem}_chatlog.txt"
        log_file.write_text("")  # 清空旧日志
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 处理表格 - 提取表格并替换为占位符
        table_handler = TableHandler()
        content_without_tables, extracted_tables = table_handler.extract_tables(content)
        
        # 记录表格提取信息到日志
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"从文件中提取了 {len(extracted_tables)} 个表格\n")
            # 记录每个表格的ID和类型
            for table in extracted_tables:
                f.write(f"表格ID: {table['id']}, 类型: {table['type']}\n")
        
        # 智能分段 - 调整为更合理的分段大小
        segmenter = MarkdownSegmenter(max_length=50000, min_length=40000)
        segments = segmenter.segment(content_without_tables)
        
        # 打印每个段落的长度
        print(f"\n{'='*20} 文件 {file_path.name} 的段落长度信息 {'='*20}")
        for i, segment in enumerate(segments):
            print(f"段落 {i+1}/{len(segments)}: {len(segment)} 字符")
        print(f"{'='*70}\n")
        
        # 确保输出目录存在
        OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
        
        # 创建输出文件
        output_file = OUTPUT_DIR / f"trans_{file_path.name}"
        output_file.write_text("")  # 清空文件
        
        # 记录基本信息到日志
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"开始翻译文件: {file_path}\n")
            f.write(f"任务名称: {task_name}\n")
            f.write(f"使用简化API客户端: SimpleLLMClient\n")
            f.write(f"API基础URL: {client.BASE_URL}\n")
            f.write(f"默认模型: {task_config.get('model', 'deepseek-ai/DeepSeek-V3')}\n")
            f.write(f"分段数量: {len(segments)}\n")
            f.write(f"输出文件: {output_file}\n\n")
            
            # 在日志中也记录段落长度信息
            f.write(f"\n{'='*20} 段落长度信息 {'='*20}\n")
            for i, segment in enumerate(segments):
                f.write(f"段落 {i+1}/{len(segments)}: {len(segment)} 字符\n")
            f.write(f"{'='*50}\n\n")
        
        all_translations = []
        prev_text = ""
        prev_trans = ""
        
        # 按顺序翻译每个段落
        for i, segment in enumerate(segments):
            is_first = (i == 0)
            is_last = (i == len(segments) - 1)
            next_text = segments[i+1] if i < len(segments)-1 else ""
            
            # 记录当前段落信息
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n{'='*20} 开始翻译段落 {i+1}/{len(segments)} {'='*20}\n")
                f.write(f"段落长度: {len(segment)} 字符\n")
                f.write(f"使用简化API客户端\n")
            
            # 翻译当前段落
            try:
                translation, is_original = await translate_segment(
                    client,
                    segment,
                    prev_text,
                    next_text,
                    prev_trans,
                    is_first,
                    is_last,
                    log_file,
                    task_config,
                    enable_optimization_detection
                )
            except Exception as e:
                # 如果翻译失败，使用原文
                print(f"段落 {i+1} 翻译失败: {str(e)}，使用原文")
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"\n段落 {i+1} 翻译失败: {str(e)}，使用原文\n")
                translation = segment
                is_original = True
                file_specific_error = True
            
            # 保存翻译结果
            all_translations.append(translation)
            
            # 如果是原文，保存到错误目录
            if is_original:
                error_file = ERROR_DIR / f"error_{file_path.name}"
                with open(error_file, 'a', encoding='utf-8') as f:
                    f.write(f"\n\n=== 错误段落 {i + 1} ===\n\n")
                    f.write(segment)
                
                # 记录错误信息到日志
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"\n警告: 段落 {i+1} 翻译失败，使用原文\n")
            else:
                # 记录成功信息到日志
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"\n段落 {i+1} 翻译成功，长度: {len(translation)} 字符\n")
            
            # 更新前一段文本和翻译
            prev_text = segment
            prev_trans = translation
            
            print(f"进度: {i+1}/{len(segments)} 完成")
            
            # 实时写入当前翻译结果到输出文件
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("\n\n".join(all_translations))
                # 记录写入成功
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"已将当前翻译结果写入文件: {output_file}\n")
            except Exception as e:
                # 记录写入失败
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"写入文件失败: {str(e)}\n")
        
        # 最终写入所有翻译结果
        try:
            # 将所有翻译结果拼接并写入输出文件
            full_translation = "\n\n".join(all_translations)
            
            # 恢复表格 - 将占位符替换回实际表格
            if extracted_tables:
                full_translation = table_handler.restore_tables(full_translation, extracted_tables)
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"已恢复 {len(extracted_tables)} 个表格到翻译结果中\n")
                    # 记录恢复的每个表格信息
                    for table in extracted_tables:
                        f.write(f"恢复表格ID: {table['id']}, 类型: {table['type']}\n")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(full_translation)
            
            # 记录最终写入成功
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n\n{'='*20} 翻译完成 {'='*20}\n")
                f.write(f"最终输出文件: {output_file}\n")
                f.write(f"总字符数: {len(full_translation)}\n")
                f.write(f"文件错误状态: {'有错误' if file_specific_error else '无错误'}\n")
            
            return full_translation
        except Exception as e:
            # 记录最终写入失败
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n\n{'='*20} 翻译完成但写入失败 {'='*20}\n")
                f.write(f"错误: {str(e)}\n")
            raise
    
    except Exception as e:
        # 记录整体错误
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n整个翻译过程出错: {str(e)}\n")
        raise

async def process_files(input_files, output_dir, concurrency=None, model=None, task_name="streaming_translation", enable_optimization_detection=False):
    """
    批量处理多个文件的入口函数
    
    Args:
        input_files: 输入文件列表
        output_dir: 输出目录
        concurrency: 并发处理的文件数量，如果为None则根据模型自动设置
        model: 指定模型名称，如果为None则使用任务配置中的模型
        task_name: 任务名称，用于获取配置
        enable_optimization_detection: 是否启用内容优化检测，默认False直接使用标准翻译流程
    """
    # 确保输出目录存在
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # 获取任务配置和模型
    from api_manager.config import get_model_concurrency
    task_config = get_task_config(task_name)
    model_name = model or task_config.get("model", "deepseek-ai/DeepSeek-V3")
    
    # 如果没有指定并发数，根据模型自动设置
    if concurrency is None:
        concurrency = get_model_concurrency(model_name)
        print(f"自动设置并发数: {concurrency} (基于模型: {model_name})")
    
    # 设置信号量控制并发
    semaphore = asyncio.Semaphore(concurrency)
    
    async def process_file_with_semaphore(file_path):
        async with semaphore:
            try:
                print(f"开始处理文件: {file_path}")
                await translate_file(file_path, task_name=task_name, enable_optimization_detection=enable_optimization_detection)
                print(f"文件处理完成: {file_path}")
            except Exception as e:
                print(f"处理文件 {file_path} 时出错: {str(e)}")
    
    # 创建并发任务
    tasks = [process_file_with_semaphore(file) for file in input_files]
    
    # 等待所有任务完成
    await asyncio.gather(*tasks)
    
    print(f"所有 {len(input_files)} 个文件处理完成")

# 修改主函数以便可以单独运行此文件
async def main(enable_optimization_detection: bool = False):
    """
    主函数
    
    Args:
        enable_optimization_detection: 是否启用内容优化检测，默认False直接使用标准翻译流程
    """
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1])
        if file_path.exists():
            if file_path.is_file():
                await translate_file(file_path, enable_optimization_detection=enable_optimization_detection)
            else:
                # 如果是目录，获取所有md文件
                md_files = list(file_path.glob("**/*.md"))
                await process_files(md_files, str(OUTPUT_DIR), 1, enable_optimization_detection=enable_optimization_detection)
        else:
            print(f"文件或目录不存在: {file_path}")
    else:
        print("请提供要翻译的文件或目录路径")

if __name__ == "__main__":
    asyncio.run(main())