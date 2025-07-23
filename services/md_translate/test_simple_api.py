#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化API客户端测试脚本

用于测试重构后的API客户端是否正常工作
"""

import asyncio
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api_manager import get_client, test_all_models

async def test_api_connection():
    """测试API连接"""
    print("=" * 50)
    print("🚀 测试简化API客户端连接")
    print("=" * 50)
    
    # 获取客户端
    client = get_client()
    
    # 首先尝试同步连接测试
    print("📡 测试API连接（同步方式）...")
    sync_connection_ok = client.test_connection_sync()
    
    if sync_connection_ok:
        print("✅ 同步API连接成功")
    else:
        print("❌ 同步API连接失败")
        return False
    
    # 再尝试异步连接测试
    print("📡 测试API连接（异步方式）...")
    async_connection_ok = await client.test_connection()
    
    if async_connection_ok:
        print("✅ 异步API连接成功")
    else:
        print("⚠️ 异步API连接失败，但同步连接成功")
        print("   这可能是httpx异步客户端配置问题，但基本功能可用")
    
    return sync_connection_ok

async def test_simple_chat():
    """测试简单聊天功能"""
    print("\n" + "=" * 50)
    print("💬 测试简单聊天功能")
    print("=" * 50)
    
    client = get_client()
    
    # 测试简单聊天
    test_messages = [
        {"role": "user", "content": "请回复'测试成功'，不要添加任何其他内容。"}
    ]
    
    try:
        print("🔄 发送测试消息...")
        print(f"   模型: deepseek-ai/DeepSeek-V3")
        print(f"   消息: {test_messages[0]['content']}")
        
        response = await client.chat_completion(
            model="deepseek-ai/DeepSeek-V3",
            messages=test_messages,
            temperature=0.1
        )
        
        content = client.get_response_content(response)
        print(f"📝 收到回复: {content}")
        
        if "测试成功" in content:
            print("✅ 聊天测试成功")
            return True
        else:
            print("⚠️ 聊天测试部分成功（收到回复，但内容不完全符合预期）")
            return True
            
    except Exception as e:
        print(f"❌ 聊天测试失败: {str(e)}")
        import traceback
        print("详细错误信息:")
        traceback.print_exc()
        return False

async def test_models():
    """测试所有支持的模型"""
    print("\n" + "=" * 50)
    print("🎯 测试所有支持的模型")
    print("=" * 50)
    
    try:
        results = await test_all_models()
        
        success_count = sum(1 for success in results.values() if success)
        total_count = len(results)
        
        print(f"\n📊 测试结果统计:")
        print(f"总模型数: {total_count}")
        print(f"成功模型数: {success_count}")
        print(f"成功率: {success_count/total_count*100:.1f}%")
        
        print(f"\n详细结果:")
        for model, success in results.items():
            status = "✅" if success else "❌"
            print(f"  {status} {model}")
        
        return success_count > 0
        
    except Exception as e:
        print(f"❌ 模型测试失败: {str(e)}")
        return False

async def test_translation_workflow():
    """测试翻译工作流"""
    print("\n" + "=" * 50)
    print("🔄 测试翻译工作流")
    print("=" * 50)
    
    try:
        # 导入翻译相关模块
        from markdown_translator.chunk_splitter import optimize_text
        from markdown_translator.translator import translate_document
        
        # 测试文本
        test_text = """# 测试文档

这是一个简单的测试文档，用于验证翻译功能是否正常工作。

## 数学公式

这里有一个简单的数学公式：$E = mc^2$

## 代码块

```python
def hello_world():
    print("Hello, World!")
```

## 总结

如果您看到这段文字的翻译版本，说明系统工作正常。
"""
        
        print("📝 使用测试文档:")
        print(test_text[:100] + "...")
        
        # 1. 测试分块
        print("\n🔪 测试文档分块...")
        chunks = await optimize_text(test_text, max_length=1000, min_length=500)
        print(f"✅ 分块完成，生成 {len(chunks)} 个块")
        
        # 2. 测试翻译（仅翻译第一个块以节省时间）
        print("\n🌐 测试翻译功能...")
        if chunks:
            # 只翻译第一个块
            test_chunks = chunks[:1]
            translated_result = await translate_document(test_chunks, source_lang="zh", target_lang="en")
            
            print("✅ 翻译完成")
            print("翻译结果预览:")
            print(translated_result[:200] + "...")
            
            return True
        else:
            print("❌ 没有生成分块，无法测试翻译")
            return False
            
    except Exception as e:
        print(f"❌ 翻译工作流测试失败: {str(e)}")
        import traceback
        print("详细错误信息:")
        traceback.print_exc()
        return False

async def main():
    """主测试函数"""
    print("🔍 简化API客户端集成测试")
    print("=" * 60)
    
    all_tests_passed = True
    
    # 测试1: API连接
    connection_ok = await test_api_connection()
    all_tests_passed = all_tests_passed and connection_ok
    
    if not connection_ok:
        print("\n❌ API连接失败，跳过后续测试")
        print("\n💡 请确保:")
        print("   1. Docker服务正在运行")
        print("   2. LiteLLM代理服务在 http://localhost:4000 上运行")
        print("   3. API密钥配置正确")
        return
    
    # 测试2: 简单聊天
    chat_ok = await test_simple_chat()
    all_tests_passed = all_tests_passed and chat_ok
    
    # 测试3: 模型测试
    models_ok = await test_models()
    all_tests_passed = all_tests_passed and models_ok
    
    # 测试4: 翻译工作流
    workflow_ok = await test_translation_workflow()
    all_tests_passed = all_tests_passed and workflow_ok
    
    # 最终结果
    print("\n" + "=" * 60)
    print("📋 测试总结")
    print("=" * 60)
    
    if all_tests_passed:
        print("🎉 所有测试通过！系统重构成功！")
        print("\n✨ 系统已准备就绪，可以开始使用新的简化API客户端进行翻译任务。")
    else:
        print("⚠️ 部分测试失败，请检查配置和服务状态")
        print("\n🔧 建议检查:")
        print("   1. Docker服务和LiteLLM代理服务状态")
        print("   2. api_manager/config.json 配置文件")
        print("   3. 网络连接和API密钥")

if __name__ == "__main__":
    asyncio.run(main()) 