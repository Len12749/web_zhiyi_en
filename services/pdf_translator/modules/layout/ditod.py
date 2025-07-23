import cv2
import numpy as np
from tqdm import tqdm
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
from io import BytesIO
from .base import LayoutBase 
from utils import LayoutAnalyzer

class DiTLayout(LayoutBase):
    def init(self, cfg: dict):
        self.layout_model = LayoutAnalyzer(
            model_root_dir= Path("models/unilm"), device=cfg['device']
        )

        self.DPI = cfg['DPI'] if 'DPI' in cfg else 200
 
    def get_layout(self, pdf_path_or_bytes, p_from, p_to):
        
        if isinstance(pdf_path_or_bytes, (str, Path)):
            # 从文件路径读取PDF
            pdf_document = fitz.open(pdf_path_or_bytes)
        else:
            # 从字节数据读取PDF
            pdf_document = fitz.open(stream=pdf_path_or_bytes, filetype="pdf")
            
        data = []
        images = []

        for i in tqdm(range(len(pdf_document))):
            if i < p_from: continue
            if i > p_to and p_to != 0: break
            
            page = pdf_document[i]
            
            # 设置缩放比例以达到所需DPI
            zoom = self.DPI / 72.0  # 72是PDF的默认DPI
            mat = fitz.Matrix(zoom, zoom)
            
            # 渲染页面为图像
            try:
                pix = page.get_pixmap(matrix=mat)
            except AttributeError:
                # 处理版本兼容性问题
                pix = page.getPixmap(matrix=mat)
            
            img_data = pix.tobytes("ppm")
            
            # 转换为PIL Image
            image = Image.open(BytesIO(img_data))
            
            result = self.get_single_layout(image)
            images.append(image)
            data.append(result)

        pdf_document.close()
        return data, images
    
    def get_single_layout(self, image):
        img = np.array(image, dtype=np.uint8)
        result = self.layout_model(cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
        return result
                