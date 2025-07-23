import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getTaskById } from "@/actions/tasks/task-actions";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

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
    const { taskIds } = body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "无效的任务ID列表" },
        { status: 400 }
      );
    }

    // 验证所有任务的权限并获取文件路径
    const validTasks = [];
    for (const taskId of taskIds) {
      const taskResult = await getTaskById(taskId);
      if (taskResult.success && taskResult.task && 
          taskResult.task.taskStatus === 'completed' && 
          taskResult.task.resultStoragePath) {
        
        // 检查文件是否存在
        if (existsSync(taskResult.task.resultStoragePath)) {
          validTasks.push({
            id: taskId,
            filename: taskResult.task.resultFilename || `task_${taskId}_result`,
            filePath: taskResult.task.resultStoragePath
          });
        }
      }
    }

    if (validTasks.length === 0) {
      return NextResponse.json(
        { success: false, message: "没有可下载的文件" },
        { status: 404 }
      );
    }

    // 如果只有一个文件，直接返回该文件
    if (validTasks.length === 1) {
      const task = validTasks[0];
      const fileBuffer = readFileSync(task.filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${task.filename}"`,
        },
      });
    }

    // 多个文件时，创建一个简单的文本索引文件
    const indexContent = validTasks.map((task, index) => 
      `文件 ${index + 1}: ${task.filename}\n任务ID: ${task.id}\n文件路径: ${task.filePath}\n\n`
    ).join('');

    const indexBuffer = Buffer.from(indexContent, 'utf-8');

    return new NextResponse(indexBuffer, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="file_index_${Date.now()}.txt"`,
      },
    });

  } catch (error) {
    console.error("批量下载API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 