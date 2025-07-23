import requests
import json
import time
from .base import TranslateBase

class TranslateLiteLLM(TranslateBase):
    def __init__(self):
        self.base_url = "http://localhost:4000/v1"
        self.api_key = "sk-litellm-master-key-2024"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        self.model = "deepseek-ai/DeepSeek-V3"  # 默认使用DeepSeek-V3
        
        # 并行处理配置
        self.max_workers = 8
        self.batch_size = 16
        self.timeout = 900
        self.enable_parallel = True
        
    def init(self, cfg: dict):
        """初始化配置"""
        if 'base_url' in cfg:
            self.base_url = cfg['base_url']
        if 'api_key' in cfg:
            self.api_key = cfg['api_key']
            self.headers["Authorization"] = f"Bearer {self.api_key}"
        if 'model' in cfg:
            self.model = cfg['model']
        
        # 并行处理配置
        if 'max_workers' in cfg:
            self.max_workers = cfg['max_workers']
        if 'batch_size' in cfg:
            self.batch_size = cfg['batch_size']
        if 'timeout' in cfg:
            self.timeout = cfg['timeout']
        
        print(f"🚀 LiteLLM翻译器初始化完成:")
        print(f"  📡 API地址: {self.base_url}")
        print(f"  🤖 模型: {self.model}")
        print(f"  🔄 并行线程数: {self.max_workers}")
        print(f"  📦 批量大小: {self.batch_size}")
        print(f"  ⏱️ 超时时间: {self.timeout}秒")

    def get_languages(self):
        """获取支持的语言列表"""
        return [
            "中文", "英语", "日语", "韩语", "法语", "德语", "西班牙语", "意大利语", 
            "葡萄牙语", "俄语", "阿拉伯语", "印地语", "泰语", "越南语", "印尼语",
            "马来语", "荷兰语", "瑞典语", "丹麦语", "挪威语", "芬兰语", "希腊语",
            "土耳其语", "波兰语", "捷克语", "匈牙利语", "罗马尼亚语", "保加利亚语"
        ]

    def translate(self, text: str, from_lang: str = '英语', to_lang: str = '中文') -> str:
        """翻译文本 - 支持重试机制"""
        if not text.strip():
            return text
            
        # 构建系统提示
        system_prompt = self._build_system_prompt(from_lang, to_lang)
        
        # 准备请求数据
        data = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.3,
            "max_tokens": 4000
        }
        
        # 重试机制
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions", 
                    headers=self.headers, 
                    json=data, 
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    translated_text = result['choices'][0]['message']['content']
                    return translated_text.strip()
                elif response.status_code == 429:  # 限流
                    wait_time = (2 ** attempt) + 1  # 指数退避
                    print(f"⏳ API限流，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"❌ API请求失败: HTTP {response.status_code}")
                    if attempt < max_retries - 1:
                        print(f"🔄 第{attempt + 1}次重试...")
                        time.sleep(1)
                        continue
                    else:
                        print(f"❌ 错误信息: {response.text}")
                        return text  # 返回原文本作为备用
                        
            except requests.exceptions.Timeout:
                print(f"⏰ 请求超时 (第{attempt + 1}/{max_retries}次)")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    print(f"❌ 达到最大重试次数，返回原文本")
                    return text
                    
            except Exception as e:
                print(f"❌ 翻译请求异常 (第{attempt + 1}/{max_retries}次): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                else:
                    return text  # 返回原文本作为备用
        
        return text  # 备用返回

    def _build_system_prompt(self, from_lang: str, to_lang: str) -> str:
        """构建系统提示"""
        return f"""你是一个专业的{from_lang}到{to_lang}翻译专家，仅返回翻译结果。

请按照以下要求翻译：
1. 准确翻译文本内容，保持原意
2. 保留所有特殊字符、标点符号和格式（对可能的乱码，你需要进行修复）
3. 保持学术和技术术语的准确性
4. 对于专有名词，保持原文或使用通用翻译
5. 对于数学公式，使用$...$格式
   - 如果遇到数学公式，修复成标准的markdown内联LaTeX格式
   - 例如：$\\alpha + \\beta = \\gamma$ 应该保持为 $\\alpha + \\beta = \\gamma$
   - 不要翻译数学符号和公式内容
最重要：只返回翻译结果，不要添加任何解释或说明。仅返回翻译结果

请将以下{from_lang}文本翻译为{to_lang}，再次强调不要添加任何无关的解释和说明，仅返回翻译结果："""

 