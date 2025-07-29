"use server";

import { auth } from "@clerk/nextjs";
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

// 获取用户通知（30天内，无条数限制）
export async function getUserNotifications() {
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

    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        taskId: notifications.taskId,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          gt(notifications.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(notifications.createdAt));

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