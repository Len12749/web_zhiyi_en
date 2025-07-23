import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createProcessingTask } from "@/actions/tasks/task-actions";
import { sseConnectionManager } from "@/lib/sse/connection-manager";
import { TaskProcessor, TaskType, TaskParams } from "@/lib/processing/task-processor";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    // 解析JSON请求体
    const body = await request.json();
    const {
      taskType,
      inputFilename,
      inputFileSize,
      inputStoragePath,
      processingParams = {},
      pageCount
    } = body;

    if (!taskType || !inputFilename || !inputFileSize || !inputStoragePath) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证文件大小限制 (300MB)
    const maxFileSize = 300 * 1024 * 1024; // 300MB
    if (inputFileSize > maxFileSize) {
      return NextResponse.json(
        { success: false, message: "文件大小超过限制(300MB)" },
        { status: 400 }
      );
    }

    // 计算所需积分
    const estimatedPoints = TaskProcessor.calculatePoints(
      taskType,
      inputFileSize,
      processingParams as any
    );

    // 创建任务记录
    const result = await createProcessingTask(
      taskType,
      inputFilename,
      inputFileSize,
      inputStoragePath,
      processingParams,
      pageCount
    );

    if (result.success && result.taskId) {
      // 构建SSE URL
      const sseUrl = `/api/sse/tasks/${result.taskId}`;
      
      // 延迟启动任务处理，给SSE连接建立时间
      setTimeout(async () => {
        try {
          console.log(`⏰ 延迟2秒后开始处理任务 [${result.taskId}]`);
          await processTaskAsync(result.taskId!, userId, taskType, inputStoragePath, processingParams);
        } catch (error) {
          console.error(`异步任务处理失败 [${result.taskId}]:`, error);
          // 推送失败消息
        sseConnectionManager.pushToTask(result.taskId!, {
          type: "status_update",
          data: {
              status: "failed",
              progress: 0,
              message: error instanceof Error ? error.message : "处理失败",
          }
        });
        }
      }, 2000); // 延迟2秒

      return NextResponse.json({
        success: true,
        taskId: result.taskId,
        message: "任务创建成功",
        sseUrl,
        estimatedPoints,
      }, { status: 201 });
    } else {
      return NextResponse.json(result, { 
        status: result.message.includes("积分不足") ? 402 : 500 
      });
    }
  } catch (error) {
    console.error("创建任务API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 异步任务处理函数
async function processTaskAsync<T extends TaskType>(
  taskId: number,
  userId: string,
  taskType: T,
  filePath: string,
  params: TaskParams[T]
) {
  const processor = new TaskProcessor(taskId, userId, taskType);
  await processor.processTaskFromPath(filePath, params);
} 
 