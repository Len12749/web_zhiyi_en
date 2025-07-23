import re
import numpy as np
import os
import platform
from pathlib import Path
from tqdm import tqdm
from .base import FontBase 

class SimpleFont(FontBase):
    FONT_SIZE = 29

    def init(self, cfg: dict):
        self.cfg = cfg
        # 设置字体映射
        self._setup_font_mapping()
 
    def _setup_font_mapping(self):
        """设置字体映射，优先使用系统字体"""
        self.font_mapping = {}
        
        # 获取系统平台
        system = platform.system()
        
        if system == "Windows":
            # Windows系统字体路径
            font_dirs = [
                "C:/Windows/Fonts/",
                os.path.expanduser("~/AppData/Local/Microsoft/Windows/Fonts/")
            ]
            # 常见中文字体 - 修复文件名映射
            chinese_fonts = [
                "simhei.ttf",      # 黑体 (修复：原为 simhei.ttf)
                "simkai.ttf",      # 楷体  
                "simsun.ttc",      # 宋体 (修复：原为 simsun.ttc)
                "msyh.ttc",        # 微软雅黑 (修复：原为 msyh.ttc)
                "msyhbd.ttc",      # 微软雅黑粗体
                "simfang.ttf",     # 仿宋
            ]
            # 英文字体 - 修复文件名映射
            english_fonts = [
                "arial.ttf",       # Arial (修复：原为 arial.ttf)
                "TimesNewRoman.ttf",  # Times New Roman (修复：原为 times.ttf)
                "calibri.ttf",     # Calibri (修复：原为 calibri.ttf)
            ]
        elif system == "Darwin":  # macOS
            font_dirs = [
                "/System/Library/Fonts/",
                "/Library/Fonts/",
                os.path.expanduser("~/Library/Fonts/")
            ]
            chinese_fonts = [
                "PingFang.ttc",    # 苹方
                "STHeiti Light.ttc", # 黑体
                "Hiragino Sans GB.ttc", # 冬青黑体
            ]
            english_fonts = [
                "Arial.ttf",
                "Times.ttc",
                "Helvetica.ttc",
            ]
        else:  # Linux
            font_dirs = [
                "/usr/share/fonts/",
                "/usr/local/share/fonts/",
                os.path.expanduser("~/.fonts/")
            ]
            chinese_fonts = [
                "wqy-microhei.ttc",
                "wqy-zenhei.ttc", 
                "DroidSansFallback.ttf",
            ]
            english_fonts = [
                "DejaVuSans.ttf",
                "liberation-sans.ttf",
            ]
        
        # 查找可用的中文字体
        self.chinese_font = self._find_available_font(font_dirs, chinese_fonts)
        if not self.chinese_font:
            # 如果没找到系统中文字体，尝试本地字体文件夹 - 修复本地字体映射
            local_chinese_fonts = [
                "simhei.ttf",        # 黑体 (修复：原为 SimHei.ttf)
                "msyh.ttc",          # 微软雅黑 (修复：原为 msyh.ttf，现在是 msyh.ttc)
                "simsun.ttc",        # 宋体 (新增)
                "NotoSansSC-VF.ttf", # Noto Sans SC (修复：原为 NotoSansCJK-Regular.ttc)
                "SourceHanSerifCN-Bold.ttf", # 思源宋体 (新增)
            ]
            self.chinese_font = self._find_available_font(["fonts/"], local_chinese_fonts)
        
        # 查找可用的英文字体
        self.english_font = self._find_available_font(font_dirs, english_fonts)
        if not self.english_font:
            # 使用本地英文字体 - 修复本地字体映射
            local_english_fonts = [
                "TimesNewRoman.ttf", # Times New Roman (修复：保持原名)
                "FreeMono.ttf",      # FreeMono (修复：保持原名)
                "arial.ttf",         # Arial (新增)
                "calibri.ttf",       # Calibri (新增)
            ]
            self.english_font = self._find_available_font(["fonts/"], local_english_fonts)
        
        print(f"🎨 中文字体: {self.chinese_font or '未找到，将使用默认字体'}")
        print(f"🎨 英文字体: {self.english_font or '未找到，将使用默认字体'}")
    
    def _find_available_font(self, directories, font_names):
        """在指定目录中查找可用字体"""
        for directory in directories:
            if not os.path.exists(directory):
                continue
            for font_name in font_names:
                font_path = os.path.join(directory, font_name)
                if os.path.exists(font_path):
                    return font_path
        return None
    
    def _get_font_for_language(self, target_language="中文"):
        """根据目标语言选择合适的字体"""
        # 判断是否需要中文字体
        chinese_languages = ["中文", "中国", "汉语", "普通话", "繁体中文", "简体中文"]
        japanese_languages = ["日语", "日文", "日本語"]
        korean_languages = ["韩语", "韩文", "한국어"]
        
        if any(lang in target_language for lang in chinese_languages):
            return self.chinese_font or self.english_font or "fonts/TimesNewRoman.ttf"
        elif any(lang in target_language for lang in japanese_languages):
            # 日语优先使用专门的日语字体
            if os.path.exists("fonts/NotoSansCJKjp-Regular.otf"):
                return "fonts/NotoSansCJKjp-Regular.otf"
            elif os.path.exists("fonts/NotoSansJP-Regular.ttf"):
                return "fonts/NotoSansJP-Regular.ttf"
            else:
                return "fonts/NotoSansSC-VF.ttf" if os.path.exists("fonts/NotoSansSC-VF.ttf") else self.chinese_font or "fonts/TimesNewRoman.ttf"
        elif any(lang in target_language for lang in korean_languages):
            # 韩语优先使用专门的韩语字体
            if os.path.exists("fonts/NotoSansCJKkr-Regular.otf"):
                return "fonts/NotoSansCJKkr-Regular.otf"
            elif os.path.exists("fonts/NotoSansKR-Regular.ttf"):
                return "fonts/NotoSansKR-Regular.ttf"
            else:
                return "fonts/NotoSansSC-VF.ttf" if os.path.exists("fonts/NotoSansSC-VF.ttf") else self.chinese_font or "fonts/TimesNewRoman.ttf"
        else:
            return self.english_font or "fonts/TimesNewRoman.ttf"
 
    def get_all_fonts(self, layout):
        # 从配置中获取目标语言（如果有的话）
        target_language = getattr(self, '_target_language', '中文')
        
        for i, line in tqdm(enumerate(layout)):
            if line.type in ["text", "list", "title"]:
                # 获取图像信息
                image = line.image
                family, size, ygain = self.get_font_info(image, line.line_cnt, target_language)
                line.font = { "family": family, "size": size, "ygain": ygain }

        return layout
    
    def set_target_language(self, language):
        """设置目标语言，用于字体选择"""
        self._target_language = language
    
    def get_font_info(self, image: np.ndarray, line_cnt: int = 1, target_language: str = "中文"):
        if image.ndim == 3:  # If the image has channels (e.g., RGB)
            height, width, _ = image.shape
        else:  # For a 2D image (grayscale)
            height, width = image.shape

        # 防止除零错误，确保line_cnt至少为1
        if line_cnt <= 0:
            line_cnt = 1

        font_size = height / line_cnt

        print(f"width: {width}, height: {height}, fs: {font_size}, lang: {target_language}")
        
        # 根据高度调整字体大小
        if font_size > 46: 
            font_size = self.FONT_SIZE + 6
            ygain = 40
        elif font_size > 31: 
            font_size = self.FONT_SIZE
            ygain = 33
        elif font_size > 28.5: 
            font_size = self.FONT_SIZE - 3
            ygain = 30
        else:
            font_size = self.FONT_SIZE - 6
            ygain = 22

        # 根据语言选择字体
        font_path = self._get_font_for_language(target_language)
        
        # 只返回文件名，路径在CLI中处理
        if font_path:
            font_family = os.path.basename(font_path)
        else:
            font_family = 'default'  # 使用默认字体标识

        return font_family, int(font_size), ygain
                