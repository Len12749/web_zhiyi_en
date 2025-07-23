from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from typing import List, Tuple
from tqdm import tqdm

class TranslateBase(ABC):
    @abstractmethod
    def init(self, cfg: dict):
        pass

    @abstractmethod
    def get_languages(self):
        pass

    def translate_all(self, layout, from_lang, to_lang):
        """翻译布局中的所有文本 - 支持并行处理"""
        # 检查是否启用并行处理
        enable_parallel = getattr(self, 'enable_parallel', True)
        max_workers = getattr(self, 'max_workers', 8)
        
        if not enable_parallel or len(layout) <= 1:
            # 串行处理
            return self._translate_all_sequential(layout, from_lang, to_lang)
        else:
            # 并行处理
            return self._translate_all_parallel(layout, from_lang, to_lang, max_workers)

    def _translate_all_sequential(self, layout, from_lang, to_lang):
        """串行翻译处理"""
        print(f"🌐 开始串行翻译：{from_lang} -> {to_lang}")
        for line in layout:
            if line.text:
                line.translated_text = self.translate(line.text, from_lang, to_lang)
        return layout

    def _translate_all_parallel(self, layout, from_lang, to_lang, max_workers):
        """并行翻译处理"""
        print(f"🌐 开始并行翻译：{from_lang} -> {to_lang} (使用{max_workers}个线程)")
        
        # 提取需要翻译的文本块
        text_blocks = []
        for i, line in enumerate(layout):
            if line.text and line.text.strip():
                text_blocks.append((i, line.text))
        
        if not text_blocks:
            return layout
        
        # 使用线程池并行翻译
        translations = {}
        total_blocks = len(text_blocks)
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交所有翻译任务
            future_to_index = {
                executor.submit(self._safe_translate, text, from_lang, to_lang): index
                for index, text in text_blocks
            }
            
            # 收集翻译结果
            with tqdm(total=total_blocks, desc="翻译文本块") as pbar:
                for future in as_completed(future_to_index):
                    index = future_to_index[future]
                    try:
                        translated_text = future.result()
                        translations[index] = translated_text
                        pbar.set_postfix({"已完成": f"{len(translations)}/{total_blocks}"})
                    except Exception as e:
                        print(f"❌ 翻译第{index}个文本块时发生错误: {e}")
                        # 使用原文本作为备用
                        translations[index] = layout[index].text
                    pbar.update(1)
        
        # 将翻译结果应用到布局
        for index, translated_text in translations.items():
            layout[index].translated_text = translated_text
        
        print(f"✅ 并行翻译完成，共处理{len(translations)}个文本块")
        return layout

    def _safe_translate(self, text: str, from_lang: str, to_lang: str) -> str:
        """安全的翻译方法，包含错误处理"""
        try:
            return self.translate(text, from_lang, to_lang)
        except Exception as e:
            print(f"⚠️ 翻译失败: {e}")
            return text  # 返回原文本作为备用

    @abstractmethod
    def translate(self, text: str, from_lang: str = '英语', to_lang: str = '中文') -> str:
        """
        Translates a given string into another language.

        Parameters:
        - text (str): The text to be translated.
        - from_lang (str): Source language
        - to_lang (str): Target language

        Returns:
        - str: The translated text.

        This method needs to be implemented by subclasses.
        """
        pass
