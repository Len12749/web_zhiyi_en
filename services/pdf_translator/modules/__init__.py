"""
PDF翻译器模块加载器
"""

def load_translator(cfg: dict):
    """加载翻译器模块"""
    translator_type = cfg.get('type', 'litellm')
    
    if translator_type == 'litellm':
        from .translate.litellm_api import TranslateLiteLLM
        translator = TranslateLiteLLM()
    else:
        raise ValueError(f"不支持的翻译器类型: {translator_type}")
    
    translator.init(cfg)
    return translator


def load_layout_engine(cfg: dict):
    """加载布局检测引擎"""
    layout_type = cfg.get('type', 'ditod')
    
    if layout_type in ['dit', 'ditod']:
        from .layout.ditod import DiTLayout
        layout_engine = DiTLayout()
    else:
        raise ValueError(f"不支持的布局引擎类型: {layout_type}")
    
    layout_engine.init(cfg)
    return layout_engine


def load_ocr_engine(cfg: dict):
    """加载OCR引擎"""
    ocr_type = cfg.get('type', 'paddle')
    
    if ocr_type == 'paddle':
        from .ocr.paddle import PaddleOCR
        ocr_engine = PaddleOCR()
    else:
        raise ValueError(f"不支持的OCR引擎类型: {ocr_type}")
    
    ocr_engine.init(cfg)
    return ocr_engine


def load_font_engine(cfg: dict):
    """加载字体引擎"""
    font_type = cfg.get('type', 'simple')
    
    if font_type == 'simple':
        from .font.simple import SimpleFont
        font_engine = SimpleFont()
    else:
        raise ValueError(f"不支持的字体引擎类型: {font_type}")
    
    font_engine.init(cfg)
    return font_engine 