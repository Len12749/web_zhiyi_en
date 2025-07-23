#!/usr/bin/env python3
"""
LiteLLM Proxy API 测试验证脚本
简洁的功能验证工具
"""

import requests
import json
import time
from typing import Dict, Any

# 配置
BASE_URL = "http://localhost:4000/v1"
API_KEY = "sk-litellm-master-key-2024"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

def test_model(model_name: str, prompt: str = "Hello! Please respond briefly.") -> Dict[str, Any]:
    """测试单个模型"""
    print(f"\n🔍 测试模型: {model_name}")
    
    data = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(f"{BASE_URL}/chat/completions", headers=HEADERS, json=data, timeout=30)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message'].get('content', '')
            tokens = result.get('usage', {}).get('total_tokens', 0)
            
            print(f"  ✅ 成功 - {elapsed:.2f}s - {tokens} tokens")
            print(f"  📝 响应: {content[:100]}...")
            
            return {
                "status": "success",
                "response_time": elapsed,
                "tokens": tokens,
                "content": content
            }
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.text[:100]}")
            return {"status": "failed", "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        print(f"  ❌ 异常: {e}")
        return {"status": "failed", "error": str(e)}

def test_system_status() -> Dict[str, Any]:
    """测试系统状态"""
    print("📊 检查系统状态...")
    
    try:
        # 获取模型列表
        response = requests.get(f"{BASE_URL}/models", headers={"Authorization": f"Bearer {API_KEY}"}, timeout=10)
        
        if response.status_code == 200:
            models_data = response.json()
            models = models_data.get("data", [])
            
            print(f"  ✅ 系统运行正常")
            print(f"  📋 可用模型: {len(models)} 个")
            
            return {"status": "healthy", "model_count": len(models)}
        else:
            print(f"  ❌ 系统异常: HTTP {response.status_code}")
            return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        print(f"  ❌ 系统异常: {e}")
        return {"status": "unhealthy", "error": str(e)}

def main():
    """主测试函数"""
    print("=" * 60)
    print("🚀 LiteLLM Proxy API 测试验证")
    print("=" * 60)
    
    # 1. 系统状态检查
    system_status = test_system_status()
    if system_status["status"] != "healthy":
        print("\n❌ 系统状态异常，停止测试")
        return
    
    # 2. 测试主要模型
    test_models = [
        "deepseek-ai/DeepSeek-V3",      # 快速文本模型
        "Qwen/QwQ-32B",                 # 推理模型
        "gemini-2.5-flash",             # Gemini快速模型
        "Qwen/Qwen2.5-VL-32B-Instruct"  # 视觉模型
    ]
    
    results = {}
    for model in test_models:
        results[model] = test_model(model)
    
    # 3. 统计结果
    print("\n" + "=" * 60)
    print("📋 测试结果总结")
    print("=" * 60)
    
    successful_models = [m for m, r in results.items() if r["status"] == "success"]
    failed_models = [m for m, r in results.items() if r["status"] == "failed"]
    
    print(f"✅ 成功模型: {len(successful_models)}/{len(test_models)}")
    for model in successful_models:
        result = results[model]
        print(f"   - {model}: {result['response_time']:.2f}s, {result['tokens']} tokens")
    
    if failed_models:
        print(f"\n❌ 失败模型: {len(failed_models)}")
        for model in failed_models:
            print(f"   - {model}: {results[model]['error']}")
    
    # 4. 总体评估
    success_rate = len(successful_models) / len(test_models) * 100
    avg_response_time = sum(r["response_time"] for r in results.values() if r["status"] == "success") / len(successful_models) if successful_models else 0
    
    print(f"\n🎯 系统评估:")
    print(f"   模型可用率: {success_rate:.1f}%")
    print(f"   平均响应时间: {avg_response_time:.2f}s")
    
    if success_rate >= 75:
        print(f"   🎉 系统运行状态: 良好")
    elif success_rate >= 50:
        print(f"   ⚠️ 系统运行状态: 一般")
    else:
        print(f"   ❌ 系统运行状态: 需要检查")
    
    print(f"\n📖 详细使用说明请参考: API_USAGE_GUIDE.md")

if __name__ == "__main__":
    main() 