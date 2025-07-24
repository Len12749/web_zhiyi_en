"""
统一AI API客户端
提供对Docker AI服务的统一调用接口，支持文本对话和视觉模型调用
"""

import time
import logging
import base64
import requests
import json
from typing import List, Dict, Optional, Any, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import re

from ..utils.logger import setup_logger

class AIClientError(Exception):
    """AI客户端错误"""
    pass

class AIClient:
    """统一AI API客户端"""
    
    def __init__(
        self,
        base_url: str = "http://localhost:4000/v1",
        api_key: str = "sk-litellm-master-key-2024",
        max_retries: int = 2,
        retry_delay: int = 3,
        request_timeout: int = 900,
        max_concurrent: int = 15,
        debug_mode: bool = False
    ):
        """
        初始化AI客户端
        
        Args:
            base_url: API基础URL
            api_key: API密钥
            max_retries: 最大重试次数
            retry_delay: 重试间隔（秒）
            request_timeout: 请求超时时间（秒）
            max_concurrent: 最大并发数
            debug_mode: 是否启用调试模式
        """
        self.base_url = base_url
        self.api_key = api_key
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.request_timeout = request_timeout
        self.max_concurrent = max_concurrent
        self.debug_mode = debug_mode
        
        # 设置日志
        self.logger = setup_logger(__name__)
        
        # 创建线程池用于并行处理
        self.executor = ThreadPoolExecutor(max_workers=max_concurrent)
        
        self.logger.info(f"AI客户端初始化完成，基础URL: {base_url}, 最大并发数: {max_concurrent}")
    
    def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        文本对话完成
        
        Args:
            model: 模型名称
            messages: 消息列表
            temperature: 温度参数
            **kwargs: 其他参数
            
        Returns:
            str: 模型响应内容
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            **kwargs
        }
        
        # 发送API请求，带重试机制
        for attempt in range(self.max_retries):
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=self.request_timeout
                )
                
                response.raise_for_status()
                result = response.json()
                
                # 保存调试信息
                if self.debug_mode:
                    self._save_debug_info(data, result)
                
                # 获取响应内容
                content = result["choices"][0]["message"]["content"]
                
                # 处理```markdown标记的内容
                content = self._clean_markdown_tags(content)
                
                return content
                
            except Exception as e:
                self.logger.warning(f"API请求失败 (尝试 {attempt + 1}/{self.max_retries}): {str(e)}")
                if attempt < self.max_retries - 1:
                    self.logger.info(f"等待 {self.retry_delay} 秒后重试...")
                    time.sleep(self.retry_delay)
                else:
                    raise AIClientError(f"API请求失败: {str(e)}")
    
    def vision_completion(
        self,
        model: str,
        image_path: str,
        user_prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        视觉模型完成
        
        Args:
            model: 模型名称
            image_path: 图像文件路径
            user_prompt: 用户提示词
            system_prompt: 系统提示词
            temperature: 温度参数
            **kwargs: 其他参数
            
        Returns:
            str: 模型响应内容
        """
        try:
            # 读取图像并转换为base64
            with open(image_path, "rb") as img_file:
                image_base64 = base64.b64encode(img_file.read()).decode("utf-8")
            
            # 构建消息
            messages = []
            
            # 仅当系统提示词非空时添加系统消息
            if system_prompt and system_prompt.strip():
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            # 添加用户消息（包含图像）
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": user_prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}"
                        }
                    }
                ]
            })
            
            return self.chat_completion(model, messages, temperature, **kwargs)
            
        except Exception as e:
            raise AIClientError(f"视觉模型处理失败: {str(e)}")
    
    def parallel_chat_completion(
        self,
        model: str,
        messages_list: List[List[Dict[str, Any]]],
        temperature: float = 0.7,
        **kwargs
    ) -> List[Optional[str]]:
        """
        并行文本对话完成
        
        Args:
            model: 模型名称
            messages_list: 消息列表的列表
            temperature: 温度参数
            **kwargs: 其他参数
            
        Returns:
            List[Optional[str]]: 响应内容列表，失败的项为None
        """
        tasks = []
        for messages in messages_list:
            task = self.executor.submit(
                self._safe_chat_completion,
                model,
                messages,
                temperature,
                **kwargs
            )
            tasks.append(task)
        
        results = []
        for task in tasks:
            try:
                results.append(task.result())
            except Exception as e:
                self.logger.error(f"并行任务失败: {str(e)}")
                results.append(None)
        
        return results
    
    def parallel_vision_completion(
        self,
        model: str,
        image_paths: List[str],
        user_prompts: List[str],
        system_prompts: List[str] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> List[Optional[str]]:
        """
        并行视觉模型完成
        
        Args:
            model: 模型名称
            image_paths: 图像文件路径列表
            user_prompts: 用户提示词列表
            system_prompts: 系统提示词列表
            temperature: 温度参数
            **kwargs: 其他参数
            
        Returns:
            List[Optional[str]]: 响应内容列表，失败的项为None
        """
        # 确保输入参数长度一致
        if not (len(image_paths) == len(user_prompts)):
            raise ValueError("输入参数长度不一致")
        
        if system_prompts is None:
            system_prompts = [""] * len(image_paths)
        elif len(system_prompts) != len(image_paths):
            raise ValueError("系统提示词列表长度与图像路径列表长度不一致")
        
        tasks = []
        for i in range(len(image_paths)):
            task = self.executor.submit(
                self._safe_vision_completion,
                model,
                image_paths[i],
                user_prompts[i],
                system_prompts[i],
                temperature,
                **kwargs
            )
            tasks.append(task)
        
        results = []
        for task in tasks:
            try:
                results.append(task.result())
            except Exception as e:
                self.logger.error(f"并行视觉任务失败: {str(e)}")
                results.append(None)
        
        return results
    
    def _safe_chat_completion(self, model: str, messages: List[Dict[str, Any]], temperature: float, **kwargs) -> str:
        """安全的文本对话完成（用于并行处理）"""
        try:
            return self.chat_completion(model, messages, temperature, **kwargs)
        except Exception as e:
            self.logger.error(f"文本对话完成失败: {str(e)}")
            raise e
    
    def _safe_vision_completion(
        self,
        model: str,
        image_path: str,
        user_prompt: str,
        system_prompt: str,
        temperature: float,
        **kwargs
    ) -> str:
        """安全的视觉模型完成（用于并行处理）"""
        try:
            return self.vision_completion(model, image_path, user_prompt, system_prompt, temperature, **kwargs)
        except Exception as e:
            self.logger.error(f"视觉模型完成失败: {str(e)}")
            raise e
    
    def _clean_markdown_tags(self, content: str) -> str:
        """清理markdown标记"""
        markdown_pattern = re.compile(r'^```markdown\s*([\s\S]*?)```\s*$', re.MULTILINE)
        match = markdown_pattern.match(content)
        if match:
            content = match.group(1).strip()
            self.logger.info("检测到markdown标记，已提取内容")
        return content
    
    def _save_debug_info(self, request_data: Dict[str, Any], response_data: Dict[str, Any]):
        """保存调试信息"""
        if self.debug_mode:
            debug_info = {
                "request": request_data,
                "response": response_data,
                "timestamp": time.time()
            }
            self.logger.debug(f"API调用调试信息: {json.dumps(debug_info, indent=2, ensure_ascii=False)}")
    
    def close(self):
        """关闭客户端，清理资源"""
        self.executor.shutdown(wait=True) 