"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// 通知类型
export type NotificationType = 'success' | 'warning' | 'info' | 'error';

// 创建通知
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  taskId?: number
) {
  try {
    const result = await db.insert(notifications).values({
      userId,
      taskId: taskId?.toString(),
      type,
      title,
      message,
      isRead: false,
    }).returning({ id: notifications.id });

    return {
      success: true,
      notificationId: result[0].id,
    };
  } catch (error) {
    console.error("创建通知失败:", error);
    return {
      success: false,
      message: "创建通知失败",
    };
  }
}

// 获取用户通知
export async function getUserNotifications(limit = 50) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        taskId: notifications.taskId,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return {
      success: true,
      notifications: userNotifications,
    };
  } catch (error) {
    console.error("获取通知失败:", error);
    return {
      success: false,
      message: "获取通知失败",
    };
  }
}

// 标记通知为已读
export async function markNotificationAsRead(notificationId: number) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    return {
      success: true,
      message: "已标记为已读",
    };
  } catch (error) {
    console.error("标记通知已读失败:", error);
    return {
      success: false,
      message: "标记已读失败",
    };
  }
}

// 标记所有通知为已读
export async function markAllNotificationsAsRead() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return {
      success: true,
      message: "所有通知已标记为已读",
    };
  } catch (error) {
    console.error("标记所有通知已读失败:", error);
    return {
      success: false,
      message: "标记所有已读失败",
    };
  }
}

// 删除通知
export async function deleteNotification(notificationId: number) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    return {
      success: true,
      message: "通知已删除",
    };
  } catch (error) {
    console.error("删除通知失败:", error);
    return {
      success: false,
      message: "删除通知失败",
    };
  }
}

// 批量删除通知
export async function deleteNotifications(notificationIds: number[]) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    for (const id of notificationIds) {
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.userId, userId)
          )
        );
    }

    return {
      success: true,
      message: `已删除 ${notificationIds.length} 条通知`,
    };
  } catch (error) {
    console.error("批量删除通知失败:", error);
    return {
      success: false,
      message: "批量删除失败",
    };
  }
}

// 获取未读通知数量
export async function getUnreadNotificationsCount() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
        count: 0,
      };
    }

    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return {
      success: true,
      count: result.length,
    };
  } catch (error) {
    console.error("获取未读通知数量失败:", error);
    return {
      success: false,
      message: "获取未读数量失败",
      count: 0,
    };
  }
} 