import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createProcessingTask } from "@/actions/tasks/task-actions";
import { sseConnectionManager } from "@/lib/sse/connection-manager";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      taskType,
      inputFilename,
      inputFileSize,
      inputStoragePath,
      processingParams,
      pageCount
    } = body;

    // 验证必要参数
    if (!taskType || !inputFilename || !inputFileSize || !inputStoragePath) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 创建任务
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
      
      // TODO: 这里应该异步调用外部处理服务
      // 暂时先推送一个处理开始的消息
      setTimeout(() => {
        sseConnectionManager.pushToTask(result.taskId!, {
          type: "status_update",
          data: {
            taskId: result.taskId,
            status: "processing",
            progress: 10,
            message: "任务处理已开始",
          }
        });
      }, 1000);

      return NextResponse.json({
        ...result,
        sseUrl,
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
 