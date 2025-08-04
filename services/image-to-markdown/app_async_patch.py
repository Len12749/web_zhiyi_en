# 图片转Markdown异步端点补丁
# 添加到 app.py 文件的末尾

@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return task_status[task_id]

@app.get("/download/{task_id}")
async def download_result(task_id: str):
    """下载识别结果"""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task_info = task_status[task_id]
    
    if task_info["status"] != "completed":
        raise HTTPException(status_code=400, detail="任务未完成")
    
    result_file = task_info["result_file"]
    if not result_file or not Path(result_file).exists():
        raise HTTPException(status_code=404, detail="结果文件不存在")
    
    # 生成下载文件名
    original_name = Path(task_info["filename"]).stem if task_info["filename"] else "image"
    download_filename = f"{original_name}_recognized.md"
    
    return FileResponse(
        path=result_file,
        filename=download_filename,
        media_type="text/markdown"
    )

async def process_recognition_task(
    task_id: str,
    input_path: str,
    content_type: str
):
    """异步处理图片识别任务"""
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        await loop.run_in_executor(
            executor, 
            _process_recognition_task_sync,
            task_id, input_path, content_type
        )

def _process_recognition_task_sync(
    task_id: str,
    input_path: str,
    content_type: str
):
    """同步处理图片识别的后台任务"""
    try:
        # 更新任务状态
        task_status[task_id]["message"] = "准备识别图片"
        task_status[task_id]["progress"] = 10
        
        input_file = Path(input_path)
        
        # 读取图片文件
        with open(input_file, 'rb') as f:
            image_bytes = f.read()
        
        # 执行AI识别
        task_status[task_id]["message"] = "正在AI识别中..."
        task_status[task_id]["progress"] = 50
        
        # 创建新的事件循环来运行异步函数
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            recognized_text = loop.run_until_complete(
                process_image_with_ai(image_bytes, content_type)
            )
        finally:
            loop.close()
        
        # 保存结果文件
        task_status[task_id]["message"] = "保存识别结果..."
        task_status[task_id]["progress"] = 90
        
        task_dir = Path(input_path).parent
        result_file = task_dir / f"result_{task_id}.md"
        
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write(recognized_text)
        
        # 更新任务状态为完成
        task_status[task_id].update({
            "status": "completed",
            "progress": 100,
            "message": "识别完成",
            "result_file": str(result_file),
            "markdown_content": recognized_text,
            "completed_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        # 更新任务状态为失败
        task_status[task_id].update({
            "status": "failed",
            "progress": 0,
            "message": f"识别失败: {str(e)}",
            "error": str(e),
            "failed_at": datetime.now().isoformat()
        })