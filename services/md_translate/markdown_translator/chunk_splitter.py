#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文本分块优化模块 - 使用LLM优化文本分块的边界

版本: 1.0.0
作者: AI Assistant
最后更新: 2024-05-18
许可证: MIT
"""

import os
import json
import time
import asyncio
import logging
import sys
from typing import List, Dict, Tuple, Optional, Any
from pathlib import Path
import argparse

# 添加项目根目录到Python路径以解决导入问题
sys.path.insert(0, str(Path(__file__).parent.parent))

# 导入传统分块工具
from utils.segmenter import MarkdownSegmenter
# 导入API管理模块
from api_manager import get_client, get_task_config
from api_manager.config import load_config, get_data_dirs

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("chunk_splitter")

# 获取数据目录
data_dirs = get_data_dirs()
WORK_DIR = data_dirs["workmd"]
OUTPUT_DIR = data_dirs["outputmd"]
LOGS_DIR = data_dirs["logs"]

# 创建日志目录
CHATLOG_DIR = Path(LOGS_DIR) / "chunk_splitter"
CHATLOG_DIR.mkdir(exist_ok=True, parents=True)

class ChunkSplitter:
    """基于LLM的文本分块优化器"""
    
    def __init__(self):
        """初始化文本分块器"""
        logger.info("初始化LLM文本分块器")
        
        # 获取API客户端
        self.client = get_client()
        
        # 获取任务配置
        self.task_config = get_task_config("chunk_optimization")
        self.model = self.task_config.get("model", "gemini-2.5-flash")
        self.params = self.task_config.get("params", {})
        
        logger.info(f"使用模型: {self.model}")
        logger.debug(f"模型参数: {self.params}")
        logger.debug("文本分块器初始化完成")
        
    async def optimize_adjacent_chunks(self, chunk_a: str, chunk_b: str, pair_id: int = 0) -> Tuple[str, str]:
        """
        使用LLM优化相邻两个文本块之间的截断点
        
        参数:
            chunk_a: 第一个文本块
            chunk_b: 第二个文本块
            pair_id: 文本块对的ID，用于日志文件名
            
        返回:
            优化后的两个文本块
        """
        # 构建提示词
        prompt = self._build_optimization_prompt(chunk_a, chunk_b)
        
        # 设置重试参数
        max_retries = 3
        retry_count = 0
        
        # 创建日志文件名，添加pair_id确保唯一性
        timestamp = int(time.time())
        log_file = CHATLOG_DIR / f"chunk_optimization_{timestamp}_{pair_id}.txt"
        
        # 记录请求内容到日志文件
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(f"===== 文本块对 {pair_id} =====\n\n")
            f.write("===== LLM PROMPT =====\n\n")
            f.write(prompt)
            f.write("\n\n")

        while retry_count < max_retries:
            try:
                logger.info(f"开始LLM API调用，模型: {self.model}，尝试次数: {retry_count+1}/{max_retries} (任务 {pair_id})")

                # 构建消息
                messages = [
                    {"role": "system", "content": "你是专业的文本优化助手，负责优化文本块之间的截断点。"},
                    {"role": "user", "content": prompt}
                ]

                # 使用简化的API客户端
                api_start_time = time.time()
                response = await self.client.chat_completion(
                    model=self.model,
                    messages=messages,
                    **self.params
                )
                api_duration = time.time() - api_start_time

                # 提取响应内容
                response_text = self.client.get_response_content(response)

                logger.info(f"✅ 分块优化API调用完成 (任务 {pair_id})，耗时: {api_duration:.2f} 秒")

                # 记录token使用情况
                if "usage" in response:
                    usage = response["usage"]
                    logger.debug(f"Token使用 - 输入: {usage.get('prompt_tokens', 0)}, "
                               f"输出: {usage.get('completion_tokens', 0)}, "
                               f"总计: {usage.get('total_tokens', 0)}")

                # 将响应写入日志文件
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write("===== LLM RESPONSE =====\n\n")
                    f.write(response_text)
                    f.write("\n\n")

                # 解析JSON响应
                optimized_a, optimized_b = self._parse_optimization_result(response_text)
                return optimized_a, optimized_b

            except Exception as e:
                logger.error(f"❌ 分块优化API调用失败 (任务 {pair_id}): {str(e)}")

                # 写入错误信息到日志
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write("===== API ERROR =====\n\n")
                    f.write(f"错误: {str(e)}\n\n")

                retry_count += 1
                if retry_count < max_retries:
                    wait_time = 2 ** retry_count
                    logger.info(f"将在 {wait_time} 秒后重试 (任务 {pair_id})，尝试次数 {retry_count+1}/{max_retries}")
                    await asyncio.sleep(wait_time)
                    continue

        # 所有重试都失败了
        logger.error(f"分块优化在 {max_retries} 次尝试后失败 (任务 {pair_id})，返回原始文本块")
        return chunk_a, chunk_b
    
    def _build_optimization_prompt(self, chunk_a: str, chunk_b: str) -> str:
        """
        构建用于优化文本块的提示词
        
        参数:
            chunk_a: 第一个文本块
            chunk_b: 第二个文本块
            
        返回:
            str: 提示词文本
        """
        # 转义JSON中的特殊字符
        escaped_chunk_a = json.dumps(chunk_a)[1:-1]
        escaped_chunk_b = json.dumps(chunk_b)[1:-1]
        
        prompt = (
    "您是一位专精于文档处理的AI助手。我需要您优化两个连续文本块之间的截断点，使得每个块在语义上更加完整，便于后续单独处理（如翻译）时保持正确的上下文。\n\n"
    "您的任务是:\n"
    "1. 分析这两个文本块的语义内容\n"
    "2. 确定最佳的语义断点位置\n"
    "3. 重新分配文本内容，使每个块在语义上更完整\n"
    "4. 确保输出格式使用markdown内联latex格式，保持数学公式的正确性\n\n"
    
    "输入的两个文本块:\n"
    "{\n"
    "\"text_a\": \"" + escaped_chunk_a + "\",\n"
    "\"text_b\": \"" + escaped_chunk_b + "\"\n"
    "}\n\n"
    
    "请严格按照以下JSON格式返回优化后的两个文本块:\n"
    "{\n"
    "\"text_a\": \"优化后的第一个文本块\",\n"
    "\"text_b\": \"优化后的第二个文本块\"\n"
    "}\n\n"
    
    "重要说明:\n"
    "- 保持所有原始内容的完全一致，不要添加或删除信息\n"
    "- 只调整两个文本块之间的截断点位置\n"
    "- 避免在表格、图表、公式、代码块等结构化内容中间截断\n"
    "- 确保输出使用markdown内联latex格式，行内公式使用单个`$`符号包围，独立公式块使用双`$$`符号包围\n"
    "- 保持所有数学符号的正确性和一致性\n"
    
    "- 请只返回符合要求的JSON格式，不要包含任何其他解释或备注\n"
    "请遵循以下优化原则:\n"
    "1. 核心目标是让每个块在独立阅读时尽可能具有完整的语义和结构，例如如果可以识别，脚注内容和正文内容应放在同一个文本块中\n"
    "2. 表格、图表、公式、代码块等结构化内容应作为整体放在同一个文本块中，不要在其中间截断\n"
    "3. 优先在段落结束、章节标题前、主题转换处设置截断点\n"
    "4. 不需要考虑两块文本长度的平衡，只关注语义完整性\n"
    "5. 对于HTML/Markdown等标记语言，确保标签的完整性，不要截断标签结构\n"
)
        
        return prompt
    
    def _parse_optimization_result(self, response_text: str) -> Tuple[str, str]:
        """
        解析LLM响应中的优化结果
        
        参数:
            response_text: LLM响应文本
            
        返回:
            Tuple[str, str]: 优化后的两个文本块
        """
        try:
            # 从响应中提取JSON部分
            json_str = self._extract_json_from_response(response_text)
            result_dict = json.loads(json_str)
            
            # 处理不同格式的响应
            text_a = None
            text_b = None
            
            # 尝试使用text_a或texta格式
            if "text_a" in result_dict:
                text_a = result_dict["text_a"]
            elif "texta" in result_dict:
                text_a = result_dict["texta"]
                
            # 尝试使用text_b或textb格式
            if "text_b" in result_dict:
                text_b = result_dict["text_b"]
            elif "textb" in result_dict:
                text_b = result_dict["textb"]
            
            # 确保两个文本块都有值
            if text_a is not None and text_b is not None:
                return text_a, text_b
            else:
                logger.error("无法从响应中提取两个文本块")
                raise ValueError("响应格式不正确，无法提取文本块")
                
        except Exception as e:
            logger.error(f"解析优化结果时出错: {str(e)}")
            logger.error(f"原始响应: {response_text}")
            raise
    
    def _extract_json_from_response(self, response_text: str) -> str:
        """
        从LLM响应中提取JSON字符串
        
        参数:
            response_text: LLM响应文本
            
        返回:
            str: 提取的JSON字符串
        """
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
        
        # 如果都失败了，抛出异常
        raise ValueError("无法从响应中提取JSON")

async def optimize_text_chunks(chunks: List[str]) -> List[str]:
    """
    对传统分块后的文本进行LLM优化，并重组为新的文本块。
    
    参数:
        chunks: 传统方法分割后的文本块列表
        
    返回:
        优化重组后的文本块列表
    """
    # 如果文本块数量小于等于2，将它们合并成一个文本块
    if len(chunks) <= 2:
        logger.info("文本块数量小于等于2，将合并所有文本块")
        if len(chunks) == 0:
            return []
        elif len(chunks) == 1:
            return chunks
        else:  # len(chunks) == 2
            merged_chunk = chunks[0] + "\n\n" + chunks[1]
            logger.debug(f"合并后的文本块长度: {len(merged_chunk)} 字符")
            return [merged_chunk]
    
    # 创建优化器实例
    optimizer = ChunkSplitter()
    logger.info(f"开始优化 {len(chunks)} 个文本块")
    
    # 记录每个块的长度，用于调试
    for i, chunk in enumerate(chunks):
        logger.debug(f"原始块 {i+1}: 长度 {len(chunk)} 字符")
    
    # 存储优化后的文本块对
    optimized_pairs = []
    
    # 对第2块和第3块、第4块和第5块...进行优化（索引从0开始，所以是1和2、3和4、5和6...）
    tasks = []
    for i in range(1, len(chunks), 2):
        if i + 1 < len(chunks):
            # 创建异步任务，添加pair_id用于日志标识
            pair_id = (i + 1) // 2  # 计算块对的序号，从1开始
            logger.info(f"准备优化文本块对 {pair_id}：第{i+1}块和第{i+2}块")
            task = optimizer.optimize_adjacent_chunks(chunks[i], chunks[i+1], pair_id)
            tasks.append(task)
    
    # 并行执行所有优化任务
    if tasks:
        logger.info(f"开始并行执行 {len(tasks)} 个优化任务")
        optimized_results = await asyncio.gather(*tasks)
        optimized_pairs = list(optimized_results)
        logger.info(f"完成 {len(optimized_pairs)} 个优化任务")
    
    # 重组文本块
    reorganized_chunks = []
    
    # 第1个新块 = 文本块1（索引0） + 优化后的文本块2（索引1的优化结果）
    if len(chunks) > 0:
        if len(optimized_pairs) > 0:
            logger.info("重组第1个新块: 原始文本块1 + 优化后的文本块2的第一部分")
            first_chunk = chunks[0] + "\n\n" + optimized_pairs[0][0]
        else:
            logger.info("没有优化结果，第1个新块只包含原始文本块1")
            first_chunk = chunks[0]
            
        reorganized_chunks.append(first_chunk)
        logger.debug(f"新块1长度: {len(first_chunk)} 字符")
    
    # 中间的块
    for i in range(len(optimized_pairs) - 1):
        logger.info(f"重组中间块{i+2}: 优化对{i+1}的第二部分 + 优化对{i+2}的第一部分")
        middle_chunk = optimized_pairs[i][1] + "\n\n" + optimized_pairs[i+1][0]
        reorganized_chunks.append(middle_chunk)
        logger.debug(f"新块{i+2}长度: {len(middle_chunk)} 字符")
    
    # 处理最后一个或几个块
    if len(optimized_pairs) > 0:
        # 添加最后一个优化对的第二部分
        logger.info(f"添加最后一个优化对的第二部分为单独的块")
        last_pair = optimized_pairs[-1]
        reorganized_chunks.append(last_pair[1])
        logger.debug(f"新块{len(reorganized_chunks)}长度: {len(last_pair[1])} 字符")
        
        # 检查是否还有未处理的块
        last_processed_index = 1 + 2 * (len(optimized_pairs) - 1) + 1
        logger.debug(f"最后处理的索引: {last_processed_index}, 总块数: {len(chunks)}")
        
        if last_processed_index < len(chunks) - 1:
            # 还有未处理的块
            logger.info(f"添加未处理的最后一个块 (索引 {len(chunks)-1})")
            reorganized_chunks.append(chunks[-1])
            logger.debug(f"新块{len(reorganized_chunks)}长度: {len(chunks[-1])} 字符")
    
    # 总结重组结果
    logger.info(f"优化完成，重组后有 {len(reorganized_chunks)} 个文本块")
    for i, chunk in enumerate(reorganized_chunks):
        logger.debug(f"优化后块 {i+1}: 长度 {len(chunk)} 字符")
        
    return reorganized_chunks

async def optimize_text(text: str, max_length: int = 6000, min_length: int = 4000) -> List[Dict]:
    """
    使用LLM优化对文本进行分块处理
    
    参数:
        text: 输入文本
        max_length: 最大块长度
        min_length: 最小块长度
        
    返回:
        List[Dict]: 优化后的块列表，每个元素包含id和content
    """
    # 使用传统分段器进行初始分块
    segmenter = MarkdownSegmenter(max_length=max_length, min_length=min_length)
    initial_chunks = segmenter.segment(text)
    logger.info(f"传统分块方法生成了 {len(initial_chunks)} 个文本块")
    
    # 使用LLM优化文本块
    optimized_chunks = await optimize_text_chunks(initial_chunks)
    
    # 为每个块分配ID
    chunk_dicts = []
    for i, chunk in enumerate(optimized_chunks):
        chunk_dicts.append({
            "id": i + 1,
            "content": chunk
        })
    
    return chunk_dicts

# 主函数（用于测试和命令行调用）
if __name__ == "__main__":
    import argparse
    import sys
    
    # 配置命令行参数解析
    parser = argparse.ArgumentParser(description="Markdown 文档分块工具")
    parser.add_argument("input_file", nargs="?", help="输入 Markdown 文件路径")
    parser.add_argument("-o", "--output", help="输出文件路径")
    parser.add_argument("-d", "--debug", action="store_true", help="开启调试模式，显示详细日志")
    parser.add_argument("--max-length", type=int, default=5000, help="最大文本块长度")
    parser.add_argument("--min-length", type=int, default=4000, help="最小文本块长度")
    
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
            # 使用默认测试文件
            input_file = os.path.join(WORK_DIR, "p2.md")
            logger.info(f"未指定输入文件，使用默认测试文件: {input_file}")
        
        # 检查文件是否存在
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
            output_file = os.path.join(WORK_DIR, f"{input_name}_chunked{input_ext}")
            logger.info(f"未指定输出文件，将使用默认路径: {output_file}")
            
        # 读取文件内容
        with open(input_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        logger.info(f"正在处理文件: {input_file}, 大小: {len(content)} 字符")
        
        # 执行优化分块
        start_time = time.time()
        optimized_chunks = await optimize_text(content, 
                                              max_length=args.max_length, 
                                              min_length=args.min_length)
        processing_time = time.time() - start_time
        
        logger.info(f"分块优化完成，耗时: {processing_time:.2f} 秒，生成了 {len(optimized_chunks)} 个文本块")
        
        # 将优化后的块写入文件
        with open(output_file, "w", encoding="utf-8") as f:
            for chunk in optimized_chunks:
                f.write(f"--- 块 {chunk['id']} ---\n\n")
                f.write(chunk["content"])
                f.write("\n\n")
                
        logger.info(f"优化后的文本块已写入: {output_file}")
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