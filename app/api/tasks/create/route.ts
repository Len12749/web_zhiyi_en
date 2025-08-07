import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createProcessingTask } from "@/actions/tasks/task-actions";
import { sseConnectionManager } from "@/lib/sse/connection-manager";
import { TaskProcessor, TaskType, TaskParams } from "@/lib/processing/task-processor";

// 设置API路由最大执行时间为1小时（3600秒）
export const maxDuration = 3600;
// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

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
      )
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
      taskType as TaskType,
      inputFileSize,
      processingParams as any,
      pageCount
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
      
      // 延迟启动任务处理，确保SSE连接有时间建立
      setTimeout(async () => {
        try {
          await processTaskAsync(result.taskId!, userId, taskType, inputStoragePath, processingParams);
        } catch (error) {
          console.error(`异步任务处理失败 [${result.taskId}]:`, error);
          
          // 更新数据库状态为失败
          try {
            const { failTask } = await import('@/actions/tasks/task-actions');
            await failTask(result.taskId!, 
              "ASYNC_PROCESSING_ERROR",
              error instanceof Error ? error.message : "处理失败"
            );
          } catch (dbError) {
            console.error(`更新任务失败状态到数据库失败 [${result.taskId}]:`, dbError);
          }
          
          // 推送失败消息到SSE
          sseConnectionManager.pushToTask(result.taskId!, {
            type: "status_update",
            data: {
                status: "failed",
                progress: 0,
                message: error instanceof Error ? error.message : "处理失败",
            }
          });
        }
      }, 500); // 延迟500毫秒，足够SSE连接建立

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
