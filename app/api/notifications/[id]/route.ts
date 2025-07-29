import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { 
  deleteNotification 
} from "@/actions/notifications/notification-actions";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

// 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "无效的通知ID" },
        { status: 400 }
      );
    }

    const result = await deleteNotification(notificationId);
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error("删除通知API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 