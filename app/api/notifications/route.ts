import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { 
  getUserNotifications, 
  deleteNotifications,
  markAllNotificationsAsRead
} from "@/actions/notifications/notification-actions";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

// 获取通知列表
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    // 获取通知列表
    const notificationsResult = await getUserNotifications(countOnly);
    
    if (!notificationsResult.success) {
      return NextResponse.json(notificationsResult, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      notifications: notificationsResult.notifications,
      unreadCount: notificationsResult.unreadCount,
      count: notificationsResult.count, // for countOnly requests
    }, { status: 200 });
  } catch (error) {
    console.error("通知API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 批量操作通知
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
    const { action, notificationIds } = body;

    if (action === 'deleteMultiple' && Array.isArray(notificationIds)) {
      const result = await deleteNotifications(notificationIds);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    } else if (action === 'markAllAsRead') {
      const result = await markAllNotificationsAsRead();
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    } else {
      return NextResponse.json(
        { success: false, message: "无效的操作" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("通知批量操作API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 