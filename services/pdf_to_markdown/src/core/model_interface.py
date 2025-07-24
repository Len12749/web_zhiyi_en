"""
模型接口模块
定义了用于调用不同AI模型服务的统一接口
"""

import logging
from abc import ABC, abstractmethod
from typing import List
from concurrent.futures import ThreadPoolExecutor

from src.api.ai_client import AIClient
from src.config.model_config import ModelConfig, ModelType
from src.utils.logger import setup_logger

class ModelInterfaceError(Exception):
    """模型接口异常"""
    pass

class ModelInterface(ABC):
    """AI模型调用的抽象基类"""
    
    def __init__(
        self, 
        model_config: ModelConfig,
        max_retries: int = 2,
        retry_delay: int = 3,
        request_timeout: int = 900,
        log_level: int = logging.INFO
    ):
        """
        初始化模型接口
        
        Args:
            model_config: 模型配置
            max_retries: 最大重试次数
            retry_delay: 重试延迟（秒）
            request_timeout: 请求超时时间（秒）
            log_level: 日志级别
        """
        self.model_config = model_config
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.request_timeout = request_timeout
        
        # 设置日志
        logger_name = f"ModelInterface_{model_config.content_model_type.value}"
        self.logger = setup_logger(logger_name, log_level)
        
        # 创建线程池
        self.executor = ThreadPoolExecutor(max_workers=model_config.max_concurrent)
        
        self.logger.info(f"模型接口初始化完成，模型类型: {model_config.content_model_type.value}")
        self.logger.info(f"最大并发数: {model_config.max_concurrent}")
    
    @abstractmethod
    def process_image(
        self, 
        image_path: str, 
        system_prompt: str, 
        user_prompt: str
    ) -> str:
        """
        处理图像
        
        Args:
            image_path: 图像路径
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            
        Returns:
            str: 处理结果
        """
        pass
    
    def process_images_in_parallel(
        self,
        image_paths: List[str],
        system_prompts: List[str],
        user_prompts: List[str]
    ) -> List[str]:
        """
        并行处理多张图像
        
        Args:
            image_paths: 待处理的图像文件路径列表
            system_prompts: 系统角色提示词列表，与图像一一对应
            user_prompts: 用户指令提示词列表，与图像一一对应
            
        Returns:
            List[str]: 模型处理结果列表，顺序与输入图像保持一致，处理失败的项为None
        """
        # 确保输入参数长度一致
        if not (len(image_paths) == len(system_prompts) == len(user_prompts)):
            raise ValueError("输入参数长度不一致")
        
        # 创建任务列表
        tasks = []
        for i in range(len(image_paths)):
            tasks.append(
                self.executor.submit(
                    self._process_image_with_retry,
                    image_paths[i],
                    system_prompts[i],
                    user_prompts[i]
                )
            )
        
        # 获取结果
        results = []
        for task in tasks:
            try:
                results.append(task.result())
            except Exception as e:
                self.logger.error(f"并行处理任务失败: {str(e)}")
                results.append(None)
        
        return results
    
    def _process_image_with_retry(
        self, 
        image_path: str, 
        system_prompt: str, 
        user_prompt: str
    ) -> str:
        """
        带重试机制的图像处理
        
        Args:
            image_path: 图像路径
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            
        Returns:
            str: 处理结果
        """
        try:
            result = self.process_image(image_path, system_prompt, user_prompt)
            return result
        except Exception as e:
            self.logger.error(f"处理图像失败: {str(e)}")
            raise e
    
    def close(self):
        """关闭接口，清理资源"""
        self.executor.shutdown(wait=True)

class DockerAIModelInterface(ModelInterface):
    """Docker AI服务调用接口"""
    
    def __init__(self, model_config: ModelConfig, **kwargs):
        """初始化Docker AI模型接口"""
        super().__init__(model_config, **kwargs)
        
        # 初始化AI客户端
        self.ai_client = AIClient(
            base_url=model_config.base_url,
            api_key=model_config.api_key,
            max_concurrent=model_config.max_concurrent,
            max_retries=self.max_retries,
            retry_delay=self.retry_delay,
            request_timeout=self.request_timeout,
            debug_mode=False
        )
        
        self.model_name = model_config.content_model_name
        self.logger.info(f"Docker AI接口初始化完成，模型: {self.model_name}")
    
    def process_image(
        self, 
        image_path: str, 
        system_prompt: str, 
        user_prompt: str
    ) -> str:
        """
        处理图像
        
        Args:
            image_path: 图像路径
            system_prompt: 系统提示词（可以为空字符串）
            user_prompt: 用户提示词
            
        Returns:
            str: 处理结果
        """
        try:
            result = self.ai_client.vision_completion(
                model=self.model_name,
                image_path=image_path,
                user_prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.1
            )
            
            return result
            
        except Exception as e:
            raise ModelInterfaceError(f"Docker AI处理图像失败: {str(e)}")
    
    def close(self):
        """关闭接口，清理资源"""
        super().close()
        if hasattr(self, 'ai_client'):
            self.ai_client.close()

def create_model_interface(model_config: ModelConfig, **kwargs) -> ModelInterface:
    """
    根据配置创建模型接口
    
    Args:
        model_config: 模型配置
        **kwargs: 其他参数
        
    Returns:
        ModelInterface: 模型接口实例
    """
    model_type = model_config.content_model_type
    
    if model_type == ModelType.DOCKER_AI:
        return DockerAIModelInterface(model_config, **kwargs)
    elif model_type == ModelType.LOCAL:
        raise NotImplementedError("本地模型接口暂未实现")
    else:
        raise ValueError(f"不支持的模型类型: {model_type}") 