import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { 
  getUserNotifications, 
  markAllNotificationsAsRead,
  deleteNotifications,
  getUnreadNotificationsCount 
} from "@/actions/notifications/notification-actions";

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

    const url = new URL(request.url);
    const countOnly = url.searchParams.get('countOnly') === 'true';

    if (countOnly) {
      // 只获取未读数量
      const result = await getUnreadNotificationsCount();
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    } else {
      // 获取通知列表和未读数量
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const notificationsResult = await getUserNotifications(limit);
      
      if (!notificationsResult.success) {
        return NextResponse.json(notificationsResult, { status: 500 });
      }
      
      const unreadResult = await getUnreadNotificationsCount();
      
      return NextResponse.json({
        success: true,
        notifications: notificationsResult.notifications,
        unreadCount: unreadResult.success ? unreadResult.count : 0,
      }, { status: 200 });
    }
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

    if (action === 'markAllRead') {
      const result = await markAllNotificationsAsRead();
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    } else if (action === 'deleteMultiple' && Array.isArray(notificationIds)) {
      const result = await deleteNotifications(notificationIds);
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