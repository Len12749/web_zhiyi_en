import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getTaskById } from "@/actions/tasks/task-actions";
import { db } from "@/db";
import { processingTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const result = await getTaskById(taskId);

    return NextResponse.json(result, { 
      status: result.success ? 200 : (result.message.includes("not found") || result.message.includes("不存在") ? 404 : 500)
    });
  } catch (error) {
    console.error("获取任务详情API错误:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID" },
        { status: 400 }
      );
    }

    // 验证任务权限并删除
    const deletedTasks = await db
      .delete(processingTasks)
      .where(and(
        eq(processingTasks.id, taskId),
        eq(processingTasks.userId, userId)
      ))
      .returning();

    if (deletedTasks.length === 0) {
      return NextResponse.json(
        { success: false, message: "Task not found or access denied" },
        { status: 404 }
      );
    }

    // TODO: 这里应该删除关联的文件存储

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("删除任务API错误:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 
 