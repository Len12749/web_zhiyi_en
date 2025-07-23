#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化的API客户端 - 调用Docker后台的LiteLLM代理服务

此模块提供统一的API调用接口，支持多模型并发调用。
"""

import httpx
import requests
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

# 配置日志
logger = logging.getLogger(__name__)

class SimpleLLMClient:
    """简化的LLM API客户端"""
    
    # 统一配置
    BASE_URL = "http://localhost:4000/v1"
    API_KEY = "sk-litellm-master-key-2024"
    
    # 支持的模型列表（根据实际测试结果更新）
    SUPPORTED_MODELS = [
        "deepseek-ai/DeepSeek-V3",
        "Qwen/Qwen2.5-VL-72B-Instruct",  # 保留原始配置
        "Qwen/Qwen2.5-VL-32B-Instruct",  # 添加实际可用的版本
        "gemini-2.5-pro",
        "deepseek-ai/DeepSeek-R1", 
        "gemini-2.5-flash",
        "Qwen/QwQ-32B"  # 添加推理模型
    ]
    
    def __init__(self, timeout: int = 900):
        """
        初始化客户端
        
        Args:
            timeout: 请求超时时间（秒）
        """
        self.timeout = timeout
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.API_KEY}"
        }
        
    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """
        发送聊天完成请求（使用同步requests在异步环境中运行）
        
        Args:
            model: 模型名称
            messages: 消息列表
            temperature: 温度参数
            **kwargs: 其他参数
            
        Returns:
            API响应结果
            
        Raises:
            Exception: API调用失败
        """
        # 验证模型
        if model not in self.SUPPORTED_MODELS:
            logger.warning(f"模型 {model} 不在支持列表中，将尝试调用")
        
        # 构建请求数据
        request_data = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            **kwargs
        }
        
        # 移除不支持的参数
        unsupported_params = ['max_tokens', 'max_completion_tokens']
        for param in unsupported_params:
            request_data.pop(param, None)
        
        logger.info(f"调用模型: {model}, 消息数: {len(messages)}")
        
        # 使用同步requests在异步环境中运行
        import asyncio
        import functools
        
        def sync_chat_request():
            """同步聊天请求函数"""
            try:
                response = requests.post(
                    f"{self.BASE_URL}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.API_KEY}"
                    },
                    json=request_data,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                result = response.json()
                
                # 记录token使用情况
                if "usage" in result:
                    usage = result["usage"]
                    logger.info(f"Token使用 - 输入: {usage.get('prompt_tokens', 0)}, "
                               f"输出: {usage.get('completion_tokens', 0)}, "
                               f"总计: {usage.get('total_tokens', 0)}")
                
                return result
                
            except requests.exceptions.Timeout as e:
                error_msg = f"API调用超时 (模型: {model}, 超时: {self.timeout}s)"
                logger.error(f"{error_msg}, 详细错误: {str(e)}")
                raise Exception(error_msg)
                
            except requests.exceptions.HTTPError as e:
                error_msg = f"API调用失败 (模型: {model}, 状态码: {e.response.status_code})"
                logger.error(f"{error_msg}, 响应: {e.response.text}")
                raise Exception(f"{error_msg}, 响应: {e.response.text}")
                
            except requests.exceptions.ConnectionError as e:
                error_msg = f"API连接错误 (模型: {model}): 无法连接到服务器"
                logger.error(f"{error_msg}, 详细错误: {str(e)}")
                raise Exception(error_msg)
                
            except Exception as e:
                error_msg = f"API调用异常 (模型: {model}): {str(e)}"
                logger.error(error_msg)
                raise Exception(error_msg)
        
        # 在线程池中运行同步请求
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, sync_chat_request)
        return result
    
    def get_response_content(self, response: Dict[str, Any]) -> str:
        """
        从API响应中提取内容
        
        Args:
            response: API响应
            
        Returns:
            响应内容文本
        """
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            logger.error(f"解析API响应失败: {e}")
            raise Exception("无法解析API响应内容")
    
    def test_connection_sync(self) -> bool:
        """
        同步测试API连接（备选方案）
        
        Returns:
            连接是否成功
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/models",
                headers={"Authorization": f"Bearer {self.API_KEY}"},
                timeout=30
            )
            
            if response.status_code == 200:
                models_data = response.json()
                models = models_data.get("data", [])
                logger.info(f"API连接成功（同步方式），可用模型: {len(models)} 个")
                return True
            else:
                logger.error(f"API连接失败（同步方式）: HTTP {response.status_code}, 响应: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError as e:
            logger.error(f"API连接错误（同步方式）: {e}")
            return False
        except requests.exceptions.Timeout as e:
            logger.error(f"API连接超时（同步方式）: {e}")
            return False
        except Exception as e:
            logger.error(f"API连接测试异常（同步方式）: {e}")
            return False

    async def test_connection(self) -> bool:
        """
        测试API连接
        
        Returns:
            连接是否成功
        """
        try:
            # 使用更兼容的HTTP客户端配置
            timeout_config = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(
                timeout=timeout_config,
                verify=False,  # 暂时禁用SSL验证以避免本地开发问题
                follow_redirects=True
            ) as client:
                response = await client.get(
                    f"{self.BASE_URL}/models",
                    headers={"Authorization": f"Bearer {self.API_KEY}"}
                )
                
                if response.status_code == 200:
                    models_data = response.json()
                    models = models_data.get("data", [])
                    logger.info(f"API连接成功，可用模型: {len(models)} 个")
                    return True
                else:
                    logger.error(f"API连接失败: HTTP {response.status_code}, 响应: {response.text}")
                    return False
                    
        except httpx.ConnectError as e:
            logger.error(f"API连接错误: {e}")
            return False
        except httpx.TimeoutException as e:
            logger.error(f"API连接超时: {e}")
            return False
        except Exception as e:
            logger.error(f"API连接测试异常: {e}")
            return False

# 全局客户端实例
_global_client = None

def get_client() -> SimpleLLMClient:
    """
    获取全局API客户端实例
    
    Returns:
        API客户端实例
    """
    global _global_client
    if _global_client is None:
        _global_client = SimpleLLMClient()
    return _global_client

async def quick_chat(
    model: str,
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7
) -> str:
    """
    快速聊天接口
    
    Args:
        model: 模型名称
        prompt: 用户提示
        system_prompt: 系统提示（可选）
        temperature: 温度参数
        
    Returns:
        模型响应内容
    """
    client = get_client()
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    response = await client.chat_completion(
        model=model,
        messages=messages,
        temperature=temperature
    )
    
    return client.get_response_content(response)

async def test_all_models() -> Dict[str, bool]:
    """
    测试所有支持的模型
    
    Returns:
        模型测试结果字典
    """
    client = get_client()
    results = {}
    
    # 基于实际测试成功的模型列表
    working_models = [
        "deepseek-ai/DeepSeek-V3",
        "Qwen/QwQ-32B", 
        "gemini-2.5-flash",
        "Qwen/Qwen2.5-VL-32B-Instruct"
    ]
    
    test_prompt = "请回复'测试成功'"
    
    for model in working_models:
        try:
            logger.info(f"测试模型: {model}")
            response = await quick_chat(model, test_prompt)
            results[model] = True
            logger.info(f"模型 {model} 测试成功")
        except Exception as e:
            results[model] = False
            logger.error(f"模型 {model} 测试失败: {e}")
    
    return results 