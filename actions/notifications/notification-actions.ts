"use server";

import { auth } from "@/lib/auth-server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, and, desc, gt, sql } from "drizzle-orm";

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
    }).returning({ 
      id: notifications.id,
      createdAt: notifications.createdAt 
    });

    const newNotification = result[0];

    // 立即通过SSE推送通知给用户
    try {
      const { notificationSSEManager } = await import("@/lib/sse/notification-manager");
      
      notificationSSEManager.pushNotificationToUser(userId, {
        id: newNotification.id,
        type,
        title,
        message,
        taskId: taskId?.toString(),
        createdAt: newNotification.createdAt?.toISOString() || new Date().toISOString()
      });
      
      console.log(`🚀 通知已实时推送给用户 ${userId}: ${title}`);
    } catch (sseError) {
      console.error("SSE推送通知失败:", sseError);
      // SSE推送失败不影响通知创建
    }

    return {
      success: true,
      notificationId: newNotification.id,
    };
  } catch (error) {
    console.error("创建通知失败:", error);
    return {
      success: false,
      message: "创建通知失败",
    };
  }
}

// 获取用户通知（30天内，支持仅获取未读数量）
export async function getUserNotifications(countOnly?: boolean) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未认证",
      };
    }

    // 计算30天前的时间
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 如果只需要未读数量
    if (countOnly) {
      const unreadCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
            gt(notifications.createdAt, thirtyDaysAgo)
          )
        );

      return {
        success: true,
        count: Number(unreadCount[0]?.count || 0),
      };
    }

    // 获取通知列表，限制100条
    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        taskId: notifications.taskId,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          gt(notifications.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    // 计算未读数量
    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    return {
      success: true,
      notifications: userNotifications,
      unreadCount,
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
      message: "通知已标记为已读",
    };
  } catch (error) {
    console.error("标记通知已读失败:", error);
    return {
      success: false,
      message: "标记通知已读失败",
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
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return {
      success: true,
      message: "所有通知已标记为已读",
    };
  } catch (error) {
    console.error("标记所有通知已读失败:", error);
    return {
      success: false,
      message: "标记所有通知已读失败",
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

// 清理过期通知（30天前的通知）
export async function cleanupExpiredNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .delete(notifications)
      .where(
        sql`${notifications.createdAt} < ${thirtyDaysAgo}`
      );

    return {
      success: true,
      message: "过期通知清理完成",
    };
  } catch (error) {
    console.error("清理过期通知失败:", error);
    return {
      success: false,
      message: "清理过期通知失败",
    };
  }
} 