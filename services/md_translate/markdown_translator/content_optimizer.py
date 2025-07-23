# -*- coding: utf-8 -*-
"""
内容优化模块 - 使用LLM检测和优化文本块内容格式

版本: 1.0.0
最后更新: 2024-06-20
许可证: MIT
"""

import asyncio
import logging
import time
import json
import os
import sys
import httpx
from typing import Dict, List, Tuple, Optional, Any
from uuid import uuid4
from datetime import datetime
import argparse

# 设置日志记录器
logger = logging.getLogger("content_optimizer")

# 添加项目根目录到PATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 导入API管理模块
from api_manager import get_client, load_config, get_task_config

# 配置日志记录
# 确保日志目录存在
log_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'logs')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, f'content_optimizer_{datetime.now().strftime("%Y%m%d")}.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(log_file)
    ]
)

# 创建日志记录器
logger = logging.getLogger('content_optimizer')

# 优化类型常量定义
OPTIMIZATION_TYPES = ["algorithm_block", "code_block", "table", "formula_rendering"]
# 从英文字段名到中文字段名的映射（用于向后兼容）
OPTIMIZATION_TYPE_MAPPING = {
    "algorithm_block": "算法块",
    "code_block": "代码块",
    "table": "表格",
    "formula_rendering": "公式渲染"
}


class ContentOptimizer:
    """文本内容优化类"""
    
    def __init__(self):
        """初始化内容优化器"""
        logger.info("初始化内容优化器")
        
        # 获取API客户端
        self.client = get_client()
        
        # 检测任务配置
        self.detection_config = get_task_config("chunk_optimization_detection")
        self.detection_model = self.detection_config.get("model", "deepseek-ai/DeepSeek-V3")
        self.detection_params = self.detection_config.get("params", {})
        
        # 处理任务配置
        self.processing_config = get_task_config("chunk_optimization_processing")
        self.processing_model = self.processing_config.get("model", "gemini-2.5-pro")
        self.processing_params = self.processing_config.get("params", {})
        
        logger.info(f"检测任务使用模型: {self.detection_model}")
        logger.info(f"处理任务使用模型: {self.processing_model}")
        logger.debug(f"检测模型参数: {self.detection_params}")
        logger.debug(f"处理模型参数: {self.processing_params}")
        
        logger.debug("内容优化器初始化完成")
    
    async def process_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """
        处理文本块列表，检测并优化每个块内的内容（如代码块、表格等）
        
        参数:
            chunks: 文本块列表，每个元素是包含id和content的字典
            
        返回:
            优化后的文本块列表，每个元素是包含id和content的字典
        """
        if not chunks:
            logger.info("没有要处理的文本块")
            return chunks
            
        logger.info(f"开始处理文本块，共 {len(chunks)} 个块")
        
        # 根据检测和处理模型动态设置并发数
        from api_manager.config import get_model_concurrency
        # 使用处理模型的并发数（通常处理任务比检测任务更重）
        max_concurrency = get_model_concurrency(self.processing_model)
        
        logger.info(f"最大并发数: {max_concurrency} (基于模型: {self.processing_model})")
        
        # 创建信号量控制并发
        semaphore = asyncio.Semaphore(max_concurrency)
        
        # 定义单个块处理函数
        async def process_single_chunk(chunk):
            async with semaphore:
                try:
                    # 检测块内容是否需要优化
                    logger.info(f"开始检测块 {chunk['id']} 的优化需求")
                    optimization_needs, detection_stats = await self.detect_optimization_needs(chunk["content"])
                    logger.info(f"完成块 {chunk['id']} 的优化需求检测: {optimization_needs}")
                    
                    # 如果需要优化，执行优化处理
                    if any(optimization_needs.values()):
                        logger.info(f"开始优化块 {chunk['id']}")
                        optimized_content, processing_stats = await self.optimize_text_chunk(
                            chunk["content"], 
                            optimization_needs
                        )
                        logger.info(f"完成块 {chunk['id']} 的优化处理")
                        
                        # 返回优化后的块
                        return {
                            "id": chunk["id"],
                            "content": optimized_content
                        }
                    else:
                        logger.info(f"块 {chunk['id']} 不需要优化")
                        # 返回原始块
                        return {
                            "id": chunk["id"],
                            "content": chunk["content"]
                        }
                except Exception as e:
                    logger.error(f"处理块 {chunk['id']} 时出错: {str(e)}")
                    # 发生错误时，保留原始块
                    return {
                        "id": chunk["id"],
                        "content": chunk["content"]
                    }
        
        # 为每个块创建处理任务
        tasks = []
        for chunk in chunks:
            task = process_single_chunk(chunk)
            tasks.append(task)
        
        # 并行处理所有块
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        processed_chunks = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"处理块时出错: {str(result)}")
                # 发生错误时，保留原始块
                processed_chunks.append({
                    "id": chunks[i]["id"],
                    "content": chunks[i]["content"]
                })
            else:
                processed_chunks.append(result)
        
        # 按ID排序，确保有序
        processed_chunks.sort(key=lambda x: x["id"])
        
        # 统计处理结果
        original_chunks = [chunk["content"] for chunk in chunks]
        processed_contents = [chunk["content"] for chunk in processed_chunks]
        optimization_count = sum(1 for i, content in enumerate(processed_contents) 
                              if i < len(original_chunks) and content != original_chunks[i])
                             
        logger.info(f"处理完成，共 {len(processed_chunks)} 个块，其中 {optimization_count} 个块已优化")
        
        # 返回处理后的块列表
        return processed_chunks
        
    async def detect_optimization_needs(self, text_chunk: str) -> Tuple[Dict[str, bool], Dict]:
        """
        检测文本块中需要优化的内容类型
        
        参数:
            text_chunk: 文本块内容
            
        返回:
            Tuple[Dict[str, bool], Dict]: 
                1. 优化类型字典，格式 {optimization_type: is_needed}
                2. API调用统计信息
        """
        # 构建检测提示词
        prompt = self._build_detection_prompt(text_chunk)
        
        # 记录API调用统计信息
        call_stats = {
            "successful_calls": 0,
            "failed_calls": 0,
            "total_tokens": 0,
            "response_time": 0,
            "success": False
        }

        # 设置最大重试次数
        max_retries = 3
        retry_count = 0

        # 默认返回值
        default_needs = {opt_type: False for opt_type in OPTIMIZATION_TYPES}
        optimization_needs = default_needs

        while retry_count < max_retries:
            try:
                logger.info(f"开始检测API调用，模型: {self.detection_model}，尝试次数: {retry_count+1}/{max_retries}")

                # 构建消息
                messages = [
                    {"role": "system", "content": "您是专业的文本分析专家，擅长检测文本中需要优化的内容。"},
                    {"role": "user", "content": prompt}
                ]

                # 使用简化的API客户端进行调用
                api_start_time = time.time()
                response = await self.client.chat_completion(
                    model=self.detection_model,
                    messages=messages,
                    **self.detection_params
                )
                
                api_duration = time.time() - api_start_time
                call_stats["response_time"] = api_duration
                
                response_text = self.client.get_response_content(response)
                
                logger.info(f"✅ 检测API调用完成，耗时: {api_duration:.2f} 秒")

                call_stats["successful_calls"] = 1
                call_stats["success"] = True
                logger.debug(f"成功获取检测响应，响应长度: {len(response_text)} 字符")

                # 解析JSON响应
                optimization_needs = self._parse_detection_result(response_text)
                break # 成功，跳出循环

            except Exception as e:
                logger.error(f"检测API调用失败: {str(e)}")
                call_stats["failed_calls"] = 1
                retry_count += 1
                
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"将在 {wait_time} 秒后重试，尝试次数 {retry_count+1}/{max_retries}")
                    await asyncio.sleep(wait_time)
                    continue

        if not call_stats["success"]:
            logger.warning(f"检测在 {max_retries} 次尝试后失败，返回默认结果")

        return optimization_needs, call_stats
        
    async def optimize_text_chunk(self, text_chunk: str, optimization_needs: Dict[str, bool]) -> Tuple[str, Dict]:
        """
        基于检测到的优化需求优化文本块
        
        参数:
            text_chunk: 要优化的文本块
            optimization_needs: 检测到的优化需求，格式 {optimization_type: is_needed}
            
        返回:
            Tuple[str, Dict]: 
                1. 优化后的文本块
                2. API调用统计信息
        """
        # 如果不需要优化，返回原始文本
        if not any(optimization_needs.values()):
            logger.info("文本块不需要优化，返回原始文本")
            return text_chunk, {"success": False}
        
        # 构建优化提示词
        prompt = self._build_optimization_prompt(text_chunk, optimization_needs)
        
        # 记录API调用统计信息
        call_stats = {
            "successful_calls": 0,
            "failed_calls": 0,
            "total_tokens": 0,
            "response_time": 0,
            "success": False
        }

        # 设置最大重试次数
        max_retries = 3
        retry_count = 0

        # 默认返回值
        optimized_text = text_chunk

        while retry_count < max_retries:
            try:
                logger.info(f"开始优化API调用，模型: {self.processing_model}，尝试次数: {retry_count+1}/{max_retries}")

                # 构建消息
                messages = [
                    {"role": "system", "content": "您是专业的学术文本优化专家，善于优化文本格式和结构。请直接返回优化后的Markdown文本，不要添加任何额外说明。"},
                    {"role": "user", "content": prompt}
                ]

                # 使用简化的API客户端进行调用
                api_start_time = time.time()
                response = await self.client.chat_completion(
                    model=self.processing_model,
                    messages=messages,
                    **self.processing_params
                )
                
                api_duration = time.time() - api_start_time
                call_stats["response_time"] = api_duration
                
                response_text = self.client.get_response_content(response)
                
                logger.info(f"✅ 优化API调用完成，耗时: {api_duration:.2f} 秒")

                call_stats["successful_calls"] = 1
                call_stats["success"] = True
                optimized_text = response_text
                logger.debug(f"成功获取优化响应，响应长度: {len(response_text)} 字符")
                break # 成功，跳出循环

            except Exception as e:
                logger.error(f"优化API调用失败: {str(e)}")
                call_stats["failed_calls"] = 1
                retry_count += 1
                
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"将在 {wait_time} 秒后重试，尝试次数 {retry_count+1}/{max_retries}")
                    await asyncio.sleep(wait_time)
                    continue

        if not call_stats["success"]:
            logger.warning(f"优化在 {max_retries} 次尝试后失败，返回原始文本")

        return optimized_text, call_stats
    
    def _build_detection_prompt(self, text_chunk: str) -> str:
        """
        构建优化内容检测提示词
        
        参数:
            text_chunk: 要检测的文本块
            
        返回:
            检测提示词
        """
        prompt = (
            "你是一位专业的文本分析专家，请检测以下文本块是否包含需要优化的内容类型。请仔细分析内容并以JSON格式返回检测结果：\n\n"
            "文本块：\n"
            f"\"\"\"\n{text_chunk}\n\"\"\"\n\n"
            "请严格按照以下JSON格式返回检测结果：\n"
            "```json\n"
            "{\n"
            "    \"algorithm_block\": boolean,  // true表示文本包含非标准算法步骤或伪代码\n"
            "    \"code_block\": boolean,  // true表示文本包含非标准代码片段\n"
            "    \"table\": boolean,    // true表示文本包含非标准表格\n"
            "    \"formula_rendering\": boolean // true表示文本包含存在渲染问题的LaTeX公式\n"
            "}\n"
            "```\n\n"
            "重要说明：\n"
            "1. algorithm_block：仅当文本包含非格式化的算法步骤或伪代码时为true\n"
            "2. code_block：仅当文本包含未使用```标准格式的代码片段时为true，如果代码已经正确使用```code```格式则为false\n"
            "3. table：仅当文本包含非标准表格格式时为true，如果表格已使用标准Markdown表格语法则为false\n"
            "4. formula_rendering：仅当文本包含LaTeX公式语法错误或格式问题时为true，如果公式已经可以正确渲染则为false\n"
            "5. 仅返回JSON对象，不要包含任何额外的解释文本\n"
            "6. 将boolean替换为true或false（小写）\n"
            "7. 如果内容已经是规范格式，应该返回false，不需要重复优化\n"
        )
        return prompt
        
    def _build_optimization_prompt(self, text_chunk: str, optimization_needs: Dict[str, bool]) -> str:
        """
        构建优化提示词
        
        参数:
            text_chunk: 文本块
            optimization_needs: 优化需求字典
            
        返回:
            优化提示词
        """
        # 转义特殊字符
        escaped_chunk = json.dumps(text_chunk)[1:-1]
        
        # 动态构建优化提示词，只包含需要的优化点
        optimization_descriptions = []
        
        # 定义各优化类型的具体描述
        descriptions = {
            "algorithm_block": """将文本中所有类似算法或伪代码的文本部分使用一个Latex代码块使用标准模板进行重新写。

例如：
对于一些算法，原文的样式可能如下
---

Given VG parameter $\sigma ,\nu ,\\theta$

For time $T$ and spot ${S}_{0}$

Set $N$ and calculate $h = T/N$

calculate $\\omega  = \\frac{1}{\\nu }\\log \\left( {1 - {\\theta \\nu } - {\\sigma }_{w}^{2}\\nu /2}\\right)$

for $i = 1,\\ldots , N$ do

\tz \\sim  \\mathcal{N}\\left( {0,1}\\right)$
\t
\tg \\sim  \\mathrm{G}\\left( {h/\\nu ,\\nu }\\right)$
\t
\t{X}_{i} = {\\theta g} + \sigma \sqrt{g}z$
\t
\t\\log {S}_{i} = \\log {S}_{i - 1} + \\left( {r - q}\\right) h + {\\omega h} + {X}_{i}$

end for

---

可以重写为标准排版：

$$
\\begin{aligned}
\\hline
&\\textbf{[算法名,没有则留空]}\\[5pt]
\\hline \\\\[-10pt]
\\textbf{input:}  &\\text{参数 } \sigma, \\nu, \\theta, \\text{时间 } T, \\text{现货价 } S_0 \\\\
\\textbf{output:}  &\\text{对数价格路径 }  \\{\\log S_i\\}_{i=1}^N \\\\[5pt]
\\hline \\\\[-10pt]
&1. \\text{Set } N, \\text{calculate } h = T/N \\\\
&2. \\quad \\text{calculate } \\omega = \\frac{1}{\\nu}\\ln\\big(1 - \\theta\\nu - \\sigma^2\\nu/2\\big) \\\\
&3. \\quad \\textbf{for } i = 1 ,\\ldots N  \\\\
&4. \\quad \\quad z \\sim \\mathcal{N}(0,1) \\\\
&5. \\quad \\quad g \\sim \\mathrm{Gamma}(h/\\nu, \\nu) \\\\
&6. \\quad \\quad X_i = \\theta g + \\sigma\\sqrt{g}z \\\\
&7. \\quad \\quad \\ln S_i = \\ln S_{i-1} + (r - q)h + \\omega h + X_i \\\\
&8. \\quad \\textbf{endfor} \\\\[5pt]
\\hline
\\end{aligned}
$$

重要注意事项：
- 需要对可以写成上述标准排版的内容进行识别并重写。
- 保持原样：如果提供的算法块已经符合标准的排版格式，请直接输出，无需进行任何修改。
- 描述清晰：尽量清晰地描述算法的输入和输出，即使在原始算法中没有明确说明，也应根据算法的功能进行推断。
- 遵循结构：严格遵守提供的 LaTeX 结构，包括对齐、线条和缩进。
- 算法名称：如果算法有明确的名称，请填写在 `\\textbf{[算法名称...]}` 处，否则留空。""",

            "code_block": """优化代码块格式，确保使用正确的Markdown代码块语法。

翻译过程中碰到类似代码的语言（注意区别伪代码和代码，伪代码使用算法框），可以通过上下文或代码风格判断代码语言（这个示例是R语言，也可能是其他语言）
---

   tsplot(cbind(gtemp_land, gtemp_ocean), spaghetti=TRUE,

   \tcol=astsa.col(c(4,2),.7), pch=c(20,18), type="o", ylab="\\u00BOC",
   \t
   \tmain="Global Surface Temperature Anomalies", addLegend=TRUE,
   \t
   \tlocation="topleft", legend=c("Land Surface","Sea Surface"))

---

   规范化如下：

   ```R
tsplot(cbind(gtemp_land, gtemp_ocean), 
       spaghetti=TRUE,
       col=astsa.col(c(4,2),.7), 
       pch=c(20,18), 
       type="o", 
       ylab="\\u00B0C",
       main="Global Surface Temperature Anomalies", 
       addLegend=TRUE,
       location="topleft", 
       legend=c("Land Surface","Sea Surface"))
   ```""",

            "table": """修复和标准化表格结构，将非标准表格转换为规范的Markdown表格格式或保留正确的HTML表格标记。

保留原表格的HTML格式或者markdown格式，如果无法正确渲染或有明显排版错误，根据语义进行修复。确保表格列对齐，标题行与内容分隔线正确，保持原表格的所有数据和结构信息。""",

            "formula_rendering": """根据语义修复LaTeX数学公式中的错误或不完整部分，确保公式语法正确，符号一致。

行内公式使用单个`$`符号包围，独立公式块使用双`$$`符号包围。修正常见的LaTeX错误，如未闭合的括号、错误的命令名或特殊字符转义问题。确保数学公式可以正确渲染，同时保持公式的数学含义不变。"""
        }
        
        # 添加需要的优化描述
        for need, required in optimization_needs.items():
            if required and need in OPTIMIZATION_TYPES:
                optimization_descriptions.append(descriptions[need])
        
        # 构建完整的优化提示词
        prompt = (
            "作为专业的文档助手，我将给你一个pdf页面的ocr结果，其中可能包含一些文本排版或格式问题，需要你根据语义对以下文本块进行优化处理。\n\n"
            "请特别注意以下优化要求：\n"
            "- " + "\n- ".join(optimization_descriptions) + "\n\n"
            "需要优化的文本块内容如下：\n"
            "{" + escaped_chunk + "}\n\n"
            
            "优化时遵循以下准则：\n"
            "1. 你的任务是对原ocr结果的排版优化\n"
            "2. 保持数学公式的完整性和准确性，使用markdown内联latex格式\n"
            "3. 确保表格、列表等结构的格式正确\n"
            "4. **必须严格保持原文的语言不变**，如果原文是英文则保持英文，如果原文是中文则保持中文\n"
            "请直接返回优化后的文本内容，不要添加额外解释、注释或分析，直接返回优化后的Markdown文本，不要包含任何元数据的其他内容。严格使用原文的语言，不要进行任何翻译。"
        )
        return prompt
        
    def _parse_detection_result(self, detection_result: str) -> Dict[str, bool]:
        """
        解析LLM返回的检测结果JSON
        
        参数:
            detection_result: LLM返回的检测结果文本
            
        返回:
            解析后的检测结果字典，格式 {optimization_type: is_needed}
        """
        try:
            # 尝试从LLM响应中提取JSON部分
            json_str = self._extract_json_from_response(detection_result)
            result_dict = json.loads(json_str)
            
            # 转换旧格式到新格式（如果需要）
            converted_dict = {}
            for opt_type in OPTIMIZATION_TYPES:
                # 先检查新格式的键
                if opt_type in result_dict:
                    converted_dict[opt_type] = result_dict[opt_type]
                # 检查旧格式的键
                elif OPTIMIZATION_TYPE_MAPPING[opt_type] in result_dict:
                    converted_dict[opt_type] = result_dict[OPTIMIZATION_TYPE_MAPPING[opt_type]]
                else:
                    converted_dict[opt_type] = False
            
            return converted_dict
        except Exception as e:
            logger.error(f"解析检测结果失败: {str(e)}")
            # 解析失败时，返回所有类型为false
            return {opt_type: False for opt_type in OPTIMIZATION_TYPES}
    
    def _extract_json_from_response(self, response_text):
        """从LLM响应中提取JSON字符串"""
        # 寻找JSON对象的开始和结束
        response_text = response_text.strip()
        
        # 尝试多种格式的JSON提取
        
        # 检查是否有代码块标记```json...```
        import re
        json_block_pattern = re.compile(r'```(?:json)?\s*(.*?)```', re.DOTALL)
        match = json_block_pattern.search(response_text)
        if match:
            return match.group(1).strip()
        
        # 如果整个响应是一个有效的JSON
        if response_text.startswith('{') and response_text.endswith('}'):
            return response_text
        
        # 尝试找到第一个{和最后一个}
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx >= 0 and end_idx > start_idx:
            return response_text[start_idx:end_idx + 1]
        
        # 寻找优化文本字段的特定模式
        opt_patterns = [
            r'"optimization_text"\s*:\s*"((?:\\"|[^"])*)"',
            r'"optimized_text"\s*:\s*"((?:\\"|[^"])*)"',
            r'"optimization_text"\s*:\s*\'((?:\\\'|[^\'])*)\''
        ]
        
        for pattern in opt_patterns:
            match = re.search(pattern, response_text)
            if match:
                opt_text = match.group(1)
                logger.debug("找到优化文本字段")
                # 构造简单的JSON对象
                try:
                    result = json.dumps({"optimization_text": opt_text})
                    return result
                except:
                    pass
        
        # 如果都失败了，返回警告并构建默认JSON
        logger.warning("无法从响应中提取有效JSON，将整个响应作为优化文本处理")
        # 转义响应文本用于JSON
        escaped_text = response_text.replace('"', '\\"').replace('\n', '\\n')
        return f'{{"optimization_text": "{escaped_text}"}}'
    



async def optimize_content(chunks: List[Dict]) -> List[Dict]:
    """
    处理文本块列表的便捷函数
    
    参数:
        chunks: 文本块列表，每个元素是包含id和content的字典
        
    返回:
        处理后的文本块列表，每个元素是包含id和content的字典
    """
    optimizer = ContentOptimizer()
    return await optimizer.process_chunks(chunks)


# 主函数（用于测试和命令行调用）
if __name__ == "__main__":
    # 配置命令行参数解析
    parser = argparse.ArgumentParser(description="Markdown 文档内容优化工具")
    parser.add_argument("input_file", nargs="?", help="输入 Markdown 文件或块文件路径")
    parser.add_argument("-o", "--output", help="输出文件路径")
    parser.add_argument("-d", "--debug", action="store_true", help="开启调试模式，显示详细日志")
    
    args = parser.parse_args()
    
    # 设置日志级别
    if args.debug:
        logger.setLevel(logging.DEBUG)
        logger.info("已开启调试模式，将显示详细日志")
    else:
        logger.setLevel(logging.INFO)
        
    async def main():
        # 获取输入文件
        input_file = args.input_file
        if not input_file:
            # 尝试从data/workmd目录获取默认文件
            config = load_config()
            data_dirs = config.get("data_dirs", {})
            workmd_dir = data_dirs.get("workmd", "data/workmd")
            input_file = os.path.join(workmd_dir, "p2_chunked.md")
            logger.info(f"未指定输入文件，使用默认文件: {input_file}")
        
        # 检查输入文件是否存在
        if not os.path.exists(input_file):
            logger.error(f"输入文件不存在: {input_file}")
            return 1
        
        # 确定输出文件
        if args.output:
            output_file = args.output
        else:
            # 使用默认输出文件名
            input_base = os.path.basename(input_file)
            input_name, input_ext = os.path.splitext(input_base)
            
            # 获取输出目录
            config = load_config()
            data_dirs = config.get("data_dirs", {})
            workmd_dir = data_dirs.get("workmd", "data/workmd")
            
            output_file = os.path.join(workmd_dir, f"{input_name}_optimized{input_ext}")
            logger.info(f"未指定输出文件，使用默认路径: {output_file}")
            
        # 读取输入文件内容
        with open(input_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        logger.info(f"正在处理文件: {input_file}, 大小: {len(content)} 字符")
        
        # 检查输入文件格式，判断是原始文本还是分块文件
        is_chunked_format = "--- 块 " in content[:1000]
        
        chunks = []
        
        if is_chunked_format:
            # 解析分块文件
            logger.info("检测到分块格式文件，正在解析...")
            import re
            block_pattern = re.compile(r"--- 块 (\d+) ---\n\n(.*?)(?=\n\n--- 块 \d+ ---|$)", re.DOTALL)
            matches = block_pattern.findall(content)
            
            for chunk_id, chunk_content in matches:
                chunks.append({
                    "id": int(chunk_id),
                    "content": chunk_content.strip()
                })
            
            logger.info(f"从文件中解析出 {len(chunks)} 个文本块")
        else:
            # 将整个文件作为一个块处理
            logger.info("未检测到分块格式，将整个文件作为单个块处理")
            chunks = [{
                "id": 1,
                "content": content
            }]
        
        # 优化内容
        start_time = time.time()
        logger.info(f"开始优化 {len(chunks)} 个文本块...")
        optimized_chunks = await optimize_content(chunks)
        processing_time = time.time() - start_time
        
        logger.info(f"内容优化完成，耗时: {processing_time:.2f} 秒")
        
        # 将优化后的块写入输出文件
        with open(output_file, "w", encoding="utf-8") as f:
            for chunk in optimized_chunks:
                f.write(f"--- 块 {chunk['id']} ---\n\n")
                f.write(chunk["content"])
                f.write("\n\n")
        
        logger.info(f"优化后的内容已保存到: {output_file}")
        return 0
    
    # 运行主函数
    if sys.platform == "win32":
        # Windows平台使用asyncio.set_event_loop_policy
        import asyncio
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        sys.exit(asyncio.run(main()))
    else:
        # 其他平台直接运行
        import asyncio
        sys.exit(asyncio.run(main())) 