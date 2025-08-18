import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { 
  deleteNotification,
  markNotificationAsRead
} from "@/actions/notifications/notification-actions";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

// 更新单个通知（标记为已读）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    if (isRead === true) {
      const result = await markNotificationAsRead(notificationId);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid update operation" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("更新通知API错误:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const notificationId = parseInt(params.id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID" },
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 