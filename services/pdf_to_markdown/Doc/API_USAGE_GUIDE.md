# LiteLLM Proxy API 使用指南

## 概述

本项目部署了一个高可用的AI API网关，支持多个大语言模型的负载均衡调用。使用Python requests库直接调用以获得最佳兼容性。

## 基础信息

- **Base URL**: `http://localhost:4000/v1`
- **认证**: Bearer Token
- **API Key**: `sk-litellm-master-key-2024`
- **支持的端点**: `/chat/completions`, `/models`

## 支持的模型

### 文本生成模型
1. **Qwen/QwQ-32B** - 32768 max_tokens (推理模型)
2. **deepseek-ai/DeepSeek-R1** - 16384 max_tokens  
3. **deepseek-ai/DeepSeek-V3** - 8192 max_tokens
4. **gemini-2.5-flash** - 65536 max_tokens
5. **gemini-2.5-pro** - 65536 max_tokens

### 视觉语言模型  
1. **Qwen/QVQ-72B-Preview** - 16384 max_tokens (视觉+推理)
2. **Qwen/Qwen2.5-VL-32B-Instruct** - 8192 max_tokens (视觉)
3. **Qwen/Qwen2.5-VL-72B-Instruct** - 4196 max_tokens (视觉)

## Python Requests 调用方式

### 1. 基础文本对话

```python
import requests
import json

url = "http://localhost:4000/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-litellm-master-key-2024"
}

data = {
    "model": "deepseek-ai/DeepSeek-V3",
    "messages": [
        {"role": "user", "content": "你好，请介绍一下人工智能"}
    ],
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)
```

### 2. 视觉模型调用（文本描述任务）

```python
import requests

url = "http://localhost:4000/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-litellm-master-key-2024"
}

data = {
    "model": "Qwen/Qwen2.5-VL-32B-Instruct",
    "messages": [
        {"role": "user", "content": "请生成一段描述春天风景的文字，包含颜色和细节"}
    ],
    "temperature": 0.8
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
```

### 3. 推理模型调用

```python
import requests

url = "http://localhost:4000/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-litellm-master-key-2024"
}

data = {
    "model": "Qwen/QwQ-32B",  # 推理模型
    "messages": [
        {"role": "user", "content": "解决这个数学问题：如果一个正方形的面积是25，那么它的周长是多少？请详细推理。"}
    ],
    "temperature": 0.1  # 推理任务使用较低温度
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
```

## 请求参数说明

### 必需参数
- **model** (string): 模型名称，见上述支持的模型列表
- **messages** (array): 对话消息数组

### 可选参数
- **temperature** (float, 0.0-2.0): 控制随机性，默认1.0
- **max_tokens** (int): 最大生成token数，建议使用默认值
- **top_p** (float, 0.0-1.0): 核采样参数
- **frequency_penalty** (float, -2.0-2.0): 频率惩罚
- **presence_penalty** (float, -2.0-2.0): 存在惩罚
- **stream** (boolean): 是否流式返回，默认false

### 消息格式
```python
{
    "role": "user|assistant|system",
    "content": "消息内容"
}
```

## 响应数据结构

### 成功响应 (HTTP 200)

```json
{
    "id": "0197eff58019bf8776dc5705bcb9aef7",
    "created": 1752077533,
    "model": "deepseek-ai/DeepSeek-V3",
    "object": "chat.completion",
    "system_fingerprint": "",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "人工智能（AI）是计算机科学的一个分支...",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null,
                "reasoning_content": null  // 推理模型会包含推理过程
            },
            "provider_specific_fields": {}
        }
    ],
    "usage": {
        "completion_tokens": 150,
        "prompt_tokens": 20,
        "total_tokens": 170,
        "completion_tokens_details": {
            "accepted_prediction_tokens": null,
            "audio_tokens": null,
            "reasoning_tokens": 0,  // 推理模型会显示推理token数
            "rejected_prediction_tokens": null
        },
        "prompt_tokens_details": {
            "audio_tokens": null,
            "cached_tokens": null,
            "text_tokens": 20,
            "image_tokens": null
        }
    },
    "service_tier": null
}
```

### 推理模型特殊字段

对于推理模型（如Qwen/QwQ-32B），响应中会包含额外的推理信息：

```json
{
    "choices": [
        {
            "message": {
                "content": "最终答案",
                "reasoning_content": "详细的推理过程..."
            }
        }
    ],
    "usage": {
        "completion_tokens_details": {
            "reasoning_tokens": 86  // 推理过程消耗的token数
        }
    }
}
```

### 字段说明

#### 顶层字段
- **id**: 请求唯一标识符
- **created**: 创建时间戳
- **model**: 实际使用的模型名称
- **object**: 响应对象类型，固定为"chat.completion"
- **choices**: 生成的选择数组，通常包含一个元素

#### choices 数组元素
- **index**: 选择索引，从0开始
- **finish_reason**: 结束原因
  - `"stop"`: 自然结束
  - `"length"`: 达到最大长度限制
  - `"content_filter"`: 内容过滤
- **message**: 生成的消息对象
  - **content**: 生成的文本内容
  - **role**: 固定为"assistant"
  - **reasoning_content**: 推理过程（仅推理模型）

#### usage 对象
- **prompt_tokens**: 输入token数
- **completion_tokens**: 输出token数  
- **total_tokens**: 总token数
- **completion_tokens_details**: 输出token详细信息
  - **reasoning_tokens**: 推理过程token数（推理模型）

## 错误处理

### 常见错误状态码

- **400 Bad Request**: 请求参数错误
- **401 Unauthorized**: 认证失败，检查API Key
- **404 Not Found**: 模型不存在
- **429 Too Many Requests**: 请求频率过高
- **500 Internal Server Error**: 服务器内部错误
- **502 Bad Gateway**: 上游服务错误

### 错误响应格式

```json
{
    "error": {
        "message": "错误描述",
        "type": "invalid_request_error",
        "code": "invalid_api_key"
    }
}
```

## 负载均衡和高可用

- 系统自动在100个SiliconFlow API Keys之间进行负载均衡
- 使用`usage-based-routing-v2`策略优化请求分发
- 自动重试失败请求（最多3次）
- 支持并发请求处理

## 最佳实践

### 1. 错误处理
```python
import requests

def call_ai_api(model, messages, temperature=0.7):
    url = "http://localhost:4000/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-litellm-master-key-2024"
    }
    
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()  # 抛出HTTP错误
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
        
    except requests.exceptions.RequestException as e:
        print(f"请求错误: {e}")
        return None
    except KeyError as e:
        print(f"响应格式错误: {e}")
        return None
```

### 2. 模型选择建议
- **快速响应**: `deepseek-ai/DeepSeek-V3`
- **高质量文本**: `gemini-2.5-pro`
- **复杂推理**: `Qwen/QwQ-32B`
- **视觉任务**: `Qwen/Qwen2.5-VL-32B-Instruct`

### 3. 参数调优
- **创意写作**: temperature=0.8-1.2
- **技术问答**: temperature=0.1-0.3  
- **代码生成**: temperature=0.0-0.2
- **推理任务**: temperature=0.0-0.1

## 监控和调试

### 获取可用模型列表
```python
import requests

url = "http://localhost:4000/v1/models"
headers = {"Authorization": "Bearer sk-litellm-master-key-2024"}

response = requests.get(url, headers=headers)
models = response.json()
print(f"可用模型数: {len(models['data'])}")
```

### 检查服务状态
```python
import requests

try:
    response = requests.get("http://localhost:4000/health", timeout=5)
    print(f"服务状态: {response.status_code}")
except:
    print("服务不可用")
```

## 性能指标

- **平均响应时间**: 2-5秒（根据模型和请求复杂度）
- **并发支持**: 15+ 并发请求
- **可用性**: 99%+（多API Key冗余）
- **QPS**: 4-10（根据模型负载）
