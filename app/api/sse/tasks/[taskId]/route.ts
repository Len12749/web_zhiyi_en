import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getTaskById } from "@/actions/tasks/task-actions";
import { sseConnectionManager } from "@/lib/sse/connection-manager";
import { generateRandomString } from "@/lib/utils";

// 设置API路由最大执行时间为1小时（3600秒）
export const maxDuration = 3600;
// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

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
      async start(controller) {
        const connectionId = generateRandomString(16);
        
        // 注册SSE连接
        sseConnectionManager.addConnection(connectionId, userId, taskId, controller);

        // 获取最新任务状态（而不是使用可能过时的taskResult）
        const latestTaskResult = await getTaskById(taskId);
        const currentTask = latestTaskResult.task || taskResult.task;

        console.log(`🔗 SSE连接建立 [${taskId}]: 当前状态=${currentTask.taskStatus}, 进度=${currentTask.progressPercent}%, 消息=${currentTask.statusMessage || 'N/A'}`);

        // 发送最新状态
        const initialMessage = {
          type: "status_update",
          data: {
            taskId: taskId,
            status: currentTask.taskStatus,
            progress: currentTask.progressPercent || 0,
            message: currentTask.statusMessage || '',
          }
        };

        const data = `data: ${JSON.stringify(initialMessage)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        console.log(`📤 SSE初始状态已发送 [${taskId}]: ${JSON.stringify(initialMessage)}`);

        // 跟踪最后的状态，用于检测变化
        let lastStatus = currentTask.taskStatus;
        let lastProgress = currentTask.progressPercent || 0;
        let lastMessage = currentTask.statusMessage || '';
        
        // 定期检查数据库状态变化
        const checkInterval = setInterval(async () => {
          try {
            const result = await getTaskById(taskId);
            if (!result.success || !result.task) return;
            
            const task = result.task;
            
            // 检测状态变化
            if (
              task.taskStatus !== lastStatus ||
              (task.progressPercent || 0) !== lastProgress ||
              (task.statusMessage || '') !== lastMessage
            ) {
              // 状态有变化，推送更新
              lastStatus = task.taskStatus;
              lastProgress = task.progressPercent || 0;
              lastMessage = task.statusMessage || '';
              
              const updateMessage = {
                type: "status_update",
                data: {
                  taskId: taskId,
                  status: task.taskStatus,
                  progress: task.progressPercent || 0,
                  message: task.statusMessage || '',
                }
              };
              
              const updateData = `data: ${JSON.stringify(updateMessage)}\n\n`;
              controller.enqueue(new TextEncoder().encode(updateData));
              
              console.log(`📤 SSE状态更新已发送 [${taskId}]: ${JSON.stringify(updateMessage)}`);
              
              // 如果任务完成或失败，清理并关闭连接
              if (task.taskStatus === 'completed' || task.taskStatus === 'failed') {
                clearInterval(checkInterval);
                setTimeout(() => {
                  sseConnectionManager.removeConnection(connectionId);
                  // 移除重复的 controller.close()，因为 removeConnection 已经关闭了
                }, 100);
              }
            }
          } catch (error) {
            console.error(`检查任务状态失败 [${taskId}]:`, error);
          }
        }, 1000); // 每秒检查一次

        // 设置连接关闭处理
        request.signal.addEventListener('abort', () => {
          console.log(`🔐 SSE连接中断 [${taskId}] (连接ID: ${connectionId})`);
          clearInterval(checkInterval);
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
 