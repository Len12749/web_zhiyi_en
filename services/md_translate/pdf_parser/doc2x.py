import os
import json
import asyncio
import aiohttp
import zipfile
import shutil
from pathlib import Path
from typing import List, Dict, Any, Callable, Optional


class Doc2xProcessor:
    def __init__(self, api_key: str, base_url: str = "https://v2.doc2x.noedgeai.com"):
        """
        初始化Doc2x处理器
        
        参数:
            api_key: Doc2x的API密钥（格式：sk-xxx）
            base_url: Doc2x API的基础URL
        """
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        self.max_retries = 50  # 最大重试次数
        self.check_interval = 3  # 检查间隔（秒）
    
    def process_folder(self, input_folder: str, output_folder: str, save_tables_as_images: bool = True):
        """
        处理文件夹中的所有PDF文件并将结果保存到输出文件夹
        
        参数:
            input_folder: 包含PDF文件的文件夹路径
            output_folder: 保存结果的文件夹路径
            save_tables_as_images: 是否将表格保存为图片而非HTML，默认为True
        """
        # 如果输出文件夹不存在则创建
        os.makedirs(output_folder, exist_ok=True)
        
        # 获取输入文件夹中的所有PDF文件
        pdf_files = [f for f in os.listdir(input_folder) if f.lower().endswith('.pdf')]
        
        if not pdf_files:
            print(f"在{input_folder}中未找到PDF文件")
            return
        
        print(f"找到{len(pdf_files)}个待处理的PDF文件")
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(input_folder, pdf_file)
            file_basename = os.path.splitext(pdf_file)[0]
            result_folder = os.path.join(output_folder, file_basename)
            
            # 为此PDF的结果创建文件夹
            os.makedirs(result_folder, exist_ok=True)
            
            print(f"\n正在处理: {pdf_file}")
            try:
                # 上传并解析PDF
                uid = self.upload_and_parse_pdf(pdf_path)
                
                # 将解析后的PDF导出为markdown
                md_url = self.export_to_markdown(uid, save_tables_as_images)
                
                # 下载并解压markdown和图片
                self.download_and_extract(md_url, result_folder)
                
                print(f"成功处理{pdf_file}并保存到{result_folder}")
            except Exception as e:
                print(f"处理{pdf_file}时出错: {str(e)}")
    
    async def upload_and_parse_pdf_async(self, pdf_path: str, progress_callback: Optional[Callable[[str, int], None]] = None) -> str:
        """
        异步上传PDF文件进行解析
        
        参数:
            pdf_path: PDF文件的路径
            progress_callback: 进度回调函数，接收(status, progress)参数
            
        返回:
            uid: 解析任务的唯一标识符
        """
        print(f"正在上传{os.path.basename(pdf_path)}...")
        
        async with aiohttp.ClientSession() as session:
            # 步骤1: 获取预上传URL
            preupload_url = f"{self.base_url}/api/v2/parse/preupload"
            async with session.post(preupload_url, headers=self.headers) as response:
                if response.status != 200:
                    text = await response.text()
                    raise Exception(f"获取预上传URL失败: {text}")
                
                data = await response.json()
                if data["code"] != "success":
                    raise Exception(f"获取预上传URL失败: {data}")
                
                upload_data = data["data"]
                url = upload_data["url"]  # 阿里云OSS临时上传URL
                uid = upload_data["uid"]  # 任务唯一标识符
            
            # 步骤2: 将文件上传到提供的URL
            with open(pdf_path, "rb") as f:
                async with session.put(url, data=f) as response:
                    if response.status != 200:
                        text = await response.text()
                        raise Exception(f"上传文件失败: {text}")
            
            # 步骤3: 异步等待处理完成
            print("开始异步等待处理完成...")
            for attempt in range(self.max_retries):
                try:
                    status_data = await self.get_parse_status_async(session, uid)
                    
                    if status_data["status"] == "success":
                        print("PDF处理成功!")
                        if progress_callback:
                            progress_callback("success", 100)
                        return uid
                    elif status_data["status"] == "failed":
                        detail = status_data.get("detail", "未知错误")
                        if progress_callback:
                            progress_callback("failed", 0)
                        raise Exception(f"解析失败: {detail}")
                    elif status_data["status"] == "processing":
                        progress = status_data.get("progress", 0)
                        print(f"处理进度: {progress}%")
                        if progress_callback:
                            progress_callback("processing", progress)
                        
                        # 使用asyncio.sleep而不是time.sleep，不阻塞事件循环
                        await asyncio.sleep(self.check_interval)
                    
                except Exception as e:
                    print(f"状态检查失败 (第{attempt + 1}次): {e}")
                    if attempt >= self.max_retries - 1:
                        raise
                    await asyncio.sleep(self.check_interval)
            
            raise Exception(f"处理超时，已重试{self.max_retries}次")

    def upload_and_parse_pdf(self, pdf_path: str) -> str:
        """
        同步包装器，保持向后兼容性
        
        参数:
            pdf_path: PDF文件的路径
            
        返回:
            uid: 解析任务的唯一标识符
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.upload_and_parse_pdf_async(pdf_path))
        finally:
            loop.close()
    
    async def get_parse_status_async(self, session: aiohttp.ClientSession, uid: str) -> Dict[str, Any]:
        """
        异步获取解析任务的状态
        
        参数:
            session: aiohttp会话
            uid: 解析任务的唯一标识符
            
        返回:
            status_data: 状态信息
        """
        url = f"{self.base_url}/api/v2/parse/status?uid={uid}"
        async with session.get(url, headers=self.headers) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"获取解析状态失败: {text}")
            
            data = await response.json()
            if data["code"] != "success":
                raise Exception(f"获取解析状态失败: {data}")
            
            return data["data"]

    def get_parse_status(self, uid: str) -> Dict[str, Any]:
        """
        获取解析任务的状态（同步版本，保持向后兼容性）
        
        参数:
            uid: 解析任务的唯一标识符
            
        返回:
            status_data: 状态信息
        """
        import requests
        url = f"{self.base_url}/api/v2/parse/status?uid={uid}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            raise Exception(f"获取解析状态失败: {response.text}")
        
        data = response.json()
        if data["code"] != "success":
            raise Exception(f"获取解析状态失败: {data}")
        
        return data["data"]
    
    async def export_to_markdown_async(self, uid: str, save_tables_as_images: bool = True, progress_callback: Optional[Callable[[str, int], None]] = None) -> str:
        """
        异步导出PDF为markdown
        
        参数:
            uid: 解析任务的唯一标识符
            save_tables_as_images: 是否将表格保存为图片而非HTML
            progress_callback: 进度回调函数，接收(status, progress)参数
            
        返回:
            url: 下载markdown文件的URL
        """
        print("正在导出为Markdown...")
        
        # 请求格式: tables_as_images是控制表格解析的参数
        # 设置为True将把表格保存为图片而非HTML
        request_data = {
            "uid": uid,
            "to": "md",  # 导出格式为markdown
            "formula_mode": "dollar",  # 公式模式使用dollar，也可以选择normal
            "tables_as_images": save_tables_as_images  # 表格识别为图片而非HTML
        }
        
        async with aiohttp.ClientSession() as session:
            # 启动导出任务
            url = f"{self.base_url}/api/v2/convert/parse"
            headers = {
                **self.headers,
                "Content-Type": "application/json"  # 必须指定内容类型
            }
            
            async with session.post(url, headers=headers, data=json.dumps(request_data)) as response:
                if response.status != 200:
                    text = await response.text()
                    raise Exception(f"启动导出失败: {text}")
                
                data = await response.json()
                if data["code"] != "success":
                    raise Exception(f"启动导出失败: {data}")
            
            # 异步等待导出完成
            for attempt in range(self.max_retries):
                try:
                    export_status = await self.get_export_status_async(session, uid)
                    
                    if export_status["status"] == "success":
                        print("导出成功完成!")
                        if progress_callback:
                            progress_callback("success", 100)
                        return export_status["url"]  # 返回下载URL
                    elif export_status["status"] == "failed":
                        detail = export_status.get("detail", "未知错误")
                        if progress_callback:
                            progress_callback("failed", 0)
                        raise Exception(f"导出失败: {detail}")
                    elif export_status["status"] == "processing":
                        print("导出正在进行中...")
                        if progress_callback:
                            progress_callback("processing", 50)  # 导出阶段进度
                        
                        # 使用asyncio.sleep而不是time.sleep，不阻塞事件循环
                        await asyncio.sleep(self.check_interval)
                        
                except Exception as e:
                    print(f"导出状态检查失败 (第{attempt + 1}次): {e}")
                    if attempt >= self.max_retries - 1:
                        raise
                    await asyncio.sleep(self.check_interval)
            
            raise Exception(f"导出超时，已重试{self.max_retries}次")

    def export_to_markdown(self, uid: str, save_tables_as_images: bool = True) -> str:
        """
        导出PDF为markdown（同步版本，保持向后兼容性）
        
        参数:
            uid: 解析任务的唯一标识符
            save_tables_as_images: 是否将表格保存为图片而非HTML
            
        返回:
            url: 下载markdown文件的URL
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.export_to_markdown_async(uid, save_tables_as_images))
        finally:
            loop.close()
    
    async def get_export_status_async(self, session: aiohttp.ClientSession, uid: str) -> Dict[str, Any]:
        """
        异步获取导出任务的状态
        
        参数:
            session: aiohttp会话
            uid: 导出任务的唯一标识符
            
        返回:
            status_data: 状态信息
        """
        url = f"{self.base_url}/api/v2/convert/parse/result?uid={uid}"
        async with session.get(url, headers=self.headers) as response:
            if response.status != 200:
                text = await response.text()
                raise Exception(f"获取导出状态失败: {text}")
            
            data = await response.json()
            if data["code"] != "success":
                raise Exception(f"获取导出状态失败: {data}")
            
            return data["data"]

    def get_export_status(self, uid: str) -> Dict[str, Any]:
        """
        获取导出任务的状态（同步版本，保持向后兼容性）
        
        参数:
            uid: 导出任务的唯一标识符
            
        返回:
            status_data: 状态信息
        """
        import requests
        url = f"{self.base_url}/api/v2/convert/parse/result?uid={uid}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            raise Exception(f"获取导出状态失败: {response.text}")
        
        data = response.json()
        if data["code"] != "success":
            raise Exception(f"获取导出状态失败: {data}")
        
        return data["data"]
    
    def download_and_extract(self, url: str, output_folder: str):
        """
        下载并解压markdown和图片
        
        参数:
            url: 下载markdown文件的URL
            output_folder: 保存结果的文件夹
        """
        print("正在下载并解压结果...")
        
        # 下载zip文件
        response = requests.get(url)
        
        if response.status_code != 200:
            raise Exception(f"下载结果失败: {response.status_code}")
        
        # 临时保存zip文件
        zip_path = os.path.join(output_folder, "temp.zip")
        with open(zip_path, "wb") as f:
            f.write(response.content)
        
        # 解压zip文件
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(output_folder)
        
        # 删除临时zip文件
        os.remove(zip_path)


def main():
    """处理PDF文件夹的主函数"""
    # 替换为你的实际API密钥
    API_KEY = "sk-ydkyb2uu893ysrj73q6yhvcqxtk4yxlz"  # 替换为你的实际API密钥
    
    # 使用doc2x文件夹下的rawdata和outdata目录
    INPUT_FOLDER = r"D:\book\高维统计\稀疏统计学习\Statistical learning with sparsity--The Lasso and Generalizations"  # PDF文件所在文件夹
    OUTPUT_FOLDER = r"D:\book\高维统计\稀疏统计学习\Statistical learning with sparsity--The Lasso and Generalizations"  # 输出结果的文件夹
    
    # 创建处理器并处理文件夹
    processor = Doc2xProcessor(API_KEY)
    processor.process_folder(INPUT_FOLDER, OUTPUT_FOLDER, save_tables_as_images=True)


if __name__ == "__main__":
    main()