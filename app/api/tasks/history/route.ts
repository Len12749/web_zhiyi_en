import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getUserTasks } from "@/actions/tasks/task-actions";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const result = await getUserTasks(50); // 获取最近50个任务

    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error("获取任务历史API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 
 