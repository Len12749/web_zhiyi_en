"""
模型配置文件
提供了统一的模型配置，支持本地模型和Docker AI服务的配置
"""

import os
import json
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum

class ModelType(Enum):
    """模型类型枚举"""
    LOCAL = "local"               # 本地模型
    DOCKER_AI = "docker_ai"       # Docker AI服务

class ConfigValidationError(Exception):
    """配置验证错误"""
    pass

@dataclass
class ModelConfig:
    """模型配置"""
    # 基础配置
    base_url: str = "http://localhost:4000/v1"  # Docker AI服务的基础URL
    api_key: str = "sk-litellm-master-key-2024"  # Docker AI服务的API密钥
    max_concurrent: int = 50  # 最大并发数
    
    # 各种任务的模型名称配置
    content_model_name: str = "Qwen/Qwen2.5-VL-32B-Instruct"  # 内容解析模型
    heading_model_name: str = "deepseek-ai/DeepSeek-V3"  # 标题分级模型
    translation_model_name: str = "deepseek-ai/DeepSeek-V3"  # 翻译模型
    
    # 各种任务的模型类型配置
    content_model_type: ModelType = field(default=ModelType.DOCKER_AI)  # 内容解析模型类型
    heading_model_type: ModelType = field(default=ModelType.DOCKER_AI)  # 标题分级模型类型
    translation_model_type: ModelType = field(default=ModelType.DOCKER_AI)  # 翻译模型类型
    layout_model_type: ModelType = field(default=ModelType.LOCAL)  # 版面检测模型类型，默认使用本地模型
    rotation_model_type: ModelType = field(default=ModelType.LOCAL)  # 旋转检测模型类型，默认使用本地模型
    
    # 本地模型相关配置
    rotation_model_dir: Optional[str] = field(default=None)  # 旋转检测模型目录
    rotation_use_gpu: bool = field(default=False)  # 旋转检测是否使用GPU
    
    def __post_init__(self):
        """初始化后验证配置"""
        self._validate_config()
    
    def _validate_config(self):
        """验证配置的有效性"""
        # 验证并发数
        if self.max_concurrent <= 0:
            raise ConfigValidationError("max_concurrent must be greater than 0")
        
        # 验证Docker AI配置
        if any(mt == ModelType.DOCKER_AI for mt in [self.content_model_type, self.heading_model_type, self.translation_model_type]):
            if not self.base_url:
                raise ConfigValidationError("base_url is required for Docker AI models")
            if not self.api_key:
                raise ConfigValidationError("api_key is required for Docker AI models")
        
        # 验证模型名称
        if self.content_model_type == ModelType.DOCKER_AI and not self.content_model_name:
            raise ConfigValidationError("content_model_name is required for Docker AI content model")
        if self.heading_model_type == ModelType.DOCKER_AI and not self.heading_model_name:
            raise ConfigValidationError("heading_model_name is required for Docker AI heading model")
        if self.translation_model_type == ModelType.DOCKER_AI and not self.translation_model_name:
            raise ConfigValidationError("translation_model_name is required for Docker AI translation model")
    
    def get_model_name_for_type(self, task_type: str) -> str:
        """根据任务类型获取对应的模型名称"""
        task_model_map = {
            "content": self.content_model_name,
            "heading": self.heading_model_name,
            "translation": self.translation_model_name
        }
        return task_model_map.get(task_type, self.content_model_name)
    
    def get_model_type_for_task(self, task_type: str) -> ModelType:
        """根据任务类型获取对应的模型类型"""
        task_type_map = {
            "content": self.content_model_type,
            "heading": self.heading_model_type,
            "translation": self.translation_model_type,
            "layout": self.layout_model_type,
            "rotation": self.rotation_model_type
        }
        return task_type_map.get(task_type, self.content_model_type)

def load_model_config_from_env() -> ModelConfig:
    """从环境变量加载模型配置"""
    return ModelConfig(
        base_url=os.environ.get("AI_BASE_URL", "http://localhost:4000/v1"),
        api_key=os.environ.get("AI_API_KEY", "sk-litellm-master-key-2024"),
        max_concurrent=int(os.environ.get("MAX_CONCURRENT", "15")),
        content_model_name=os.environ.get("CONTENT_MODEL_NAME", "Qwen/Qwen2.5-VL-32B-Instruct"),
        heading_model_name=os.environ.get("HEADING_MODEL_NAME", "deepseek-ai/DeepSeek-V3"),
        translation_model_name=os.environ.get("TRANSLATION_MODEL_NAME", "deepseek-ai/DeepSeek-V3")
    )

def _parse_model_type(type_str: str, field_name: str) -> ModelType:
    """解析模型类型字符串"""
    try:
        return ModelType(type_str)
    except ValueError:
        raise ConfigValidationError(
            f"Invalid model type '{type_str}' for {field_name}. "
            f"Valid types are: {[t.value for t in ModelType]}"
        )

def load_model_config_from_file(config_path: str) -> ModelConfig:
    """从配置文件加载模型配置"""
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config_data = json.load(f)
    except FileNotFoundError:
        raise ConfigValidationError(f"Configuration file not found: {config_path}")
    except json.JSONDecodeError as e:
        raise ConfigValidationError(f"Invalid JSON in configuration file: {e}")
    
    # 解析模型类型
    content_model_type = _parse_model_type(
        config_data.get("content_model_type", "docker_ai"), "content_model_type"
    )
    heading_model_type = _parse_model_type(
        config_data.get("heading_model_type", "docker_ai"), "heading_model_type"
    )
    translation_model_type = _parse_model_type(
        config_data.get("translation_model_type", "docker_ai"), "translation_model_type"
    )
    layout_model_type = _parse_model_type(
        config_data.get("layout_model_type", "local"), "layout_model_type"
    )
    rotation_model_type = _parse_model_type(
        config_data.get("rotation_model_type", "local"), "rotation_model_type"
    )
    
    return ModelConfig(
        base_url=config_data.get("base_url", "http://localhost:4000/v1"),
        api_key=config_data.get("api_key", "sk-litellm-master-key-2024"),
        max_concurrent=config_data.get("max_concurrent", 15),
        content_model_name=config_data.get("content_model_name", "Qwen/Qwen2.5-VL-32B-Instruct"),
        heading_model_name=config_data.get("heading_model_name", "deepseek-ai/DeepSeek-V3"),
        translation_model_name=config_data.get("translation_model_name", "deepseek-ai/DeepSeek-V3"),
        content_model_type=content_model_type,
        heading_model_type=heading_model_type,
        translation_model_type=translation_model_type,
        layout_model_type=layout_model_type,
        rotation_model_type=rotation_model_type,
        rotation_model_dir=config_data.get("rotation_model_dir"),
        rotation_use_gpu=config_data.get("rotation_use_gpu", False)
    ) 