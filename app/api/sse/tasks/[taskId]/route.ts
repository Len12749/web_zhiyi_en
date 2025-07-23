import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getTaskById } from "@/actions/tasks/task-actions";
import { sseConnectionManager } from "@/lib/sse/connection-manager";
import { generateRandomString } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, message: "无效的任务ID" },
        { status: 400 }
      );
    }

    // 验证任务权限
    const taskResult = await getTaskById(taskId);
    if (!taskResult.success || !taskResult.task) {
      return NextResponse.json(
        { success: false, message: "任务不存在或无权限访问" },
        { status: 404 }
      );
    }

    // 创建SSE流
    const stream = new ReadableStream({
      start(controller) {
        const connectionId = generateRandomString(16);
        
        // 注册SSE连接
        sseConnectionManager.addConnection(connectionId, userId, taskId, controller);

        // 发送初始状态
        const initialMessage = {
          type: "status_update",
          data: {
            taskId,
            status: taskResult.task.taskStatus,
            progress: taskResult.task.progressPercent,
            message: taskResult.task.statusMessage,
          }
        };

        const data = `data: ${JSON.stringify(initialMessage)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        // 设置连接关闭处理
        request.signal.addEventListener('abort', () => {
          sseConnectionManager.removeConnection(connectionId);
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error("SSE连接错误:", error);
    return NextResponse.json(
      { success: false, message: "建立SSE连接失败" },
      { status: 500 }
    );
  }
} 
 