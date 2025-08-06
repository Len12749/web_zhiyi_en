import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getTaskById } from "@/actions/tasks/task-actions";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { db } from "@/db";
import { processingTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateUserPoints, getCurrentUser } from "@/actions/auth/user-actions";

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

    // 获取任务信息
    const taskResult = await getTaskById(taskId);
    
    if (!taskResult.success || !taskResult.task) {
      return NextResponse.json(
        { success: false, message: "任务不存在" },
        { status: 404 }
      );
    }

    const task = taskResult.task;

    // 验证任务状态和权限
    if (task.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "无权限访问此任务" },
        { status: 403 }
      );
    }

    if (task.taskStatus !== 'completed') {
      return NextResponse.json(
        { success: false, message: "任务尚未完成" },
        { status: 400 }
      );
    }

    if (!task.resultStoragePath || !task.resultFilename) {
      return NextResponse.json(
        { success: false, message: "任务结果文件不存在" },
        { status: 404 }
      );
    }

    // 构建文件路径
    const dataStoragePath = process.env.DATA_STORAGE_PATH || './data';
    let filePath: string;
    
    // 检查是否是相对路径
    if (task.resultStoragePath.startsWith('processed/')) {
      filePath = join(dataStoragePath, task.resultStoragePath);
    } else {
      // 兼容旧的完整路径格式
      filePath = task.resultStoragePath;
    }

    console.log(`尝试下载文件: ${filePath}`);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      return NextResponse.json(
        { success: false, message: "结果文件不存在" },
        { status: 404 }
      );
    }

    // 检查是否已经下载过，如果是首次下载则扣除积分
    if (!task.hasBeenDownloaded) {
      // 获取用户信息，检查积分是否足够
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) {
        return NextResponse.json(
          { success: false, message: "获取用户信息失败" },
          { status: 500 }
        );
      }

      const user = userResult.user;
      if (!user.hasInfinitePoints && user.points < task.requiredPoints) {
        return NextResponse.json(
          { 
            success: false, 
            message: `积分不足，下载需要 ${task.requiredPoints} 积分，当前余额 ${user.points} 积分` 
          },
          { status: 402 } // 402 Payment Required
        );
      }

      // 扣除积分
      if (!user.hasInfinitePoints) {
        const pointsResult = await updateUserPoints(
          userId,
          -task.requiredPoints,
          `下载文件 - ${task.inputFilename}`
        );

        if (!pointsResult.success) {
          return NextResponse.json(
            { success: false, message: "积分扣除失败，无法下载" },
            { status: 500 }
          );
        }
      }

      // 标记为已下载
      await db
        .update(processingTasks)
        .set({ hasBeenDownloaded: true })
        .where(eq(processingTasks.id, taskId));
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);
    
    // 获取文件类型
    const getContentType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'pdf':
          return 'application/pdf';
        case 'html':
          return 'text/html';
        case 'tex':
          return 'application/x-latex';
        case 'md':
          return 'text/markdown';
        default:
          return 'application/octet-stream';
      }
    };

    const contentType = getContentType(task.resultFilename);

    console.log(`文件下载成功: ${task.resultFilename} (${fileBuffer.length} bytes)`);

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(task.resultFilename)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("下载任务文件API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 