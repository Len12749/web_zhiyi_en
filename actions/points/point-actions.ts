"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { users, pointTransactions, userCheckins, redeemCodes } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { updateUserPoints, getCurrentUser } from "@/actions/auth/user-actions";
import { createNotification } from "@/actions/notifications/notification-actions";
import { getBeijingDateString } from "@/lib/utils";

export interface PointTransaction {
  id: number;
  userId: string;
  taskId: number | null;
  redeemCodeId: number | null;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: Date;
}

export interface CheckinRecord {
  id: number;
  userId: string;
  checkinDate: string;
  pointsEarned: number;
  createdAt: Date;
}

/**
 * 每日签到
 */
export async function dailyCheckin(): Promise<{ success: boolean; points?: number; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    // 检查今天是否已签到
    // 使用统一的工具函数获取北京时间
    const today = getBeijingDateString(); // YYYY-MM-DD格式
    const existingCheckin = await db
      .select()
      .from(userCheckins)
      .where(and(
        eq(userCheckins.userId, userId),
        eq(userCheckins.checkinDate, today)
      ))
      .limit(1);

    if (existingCheckin.length > 0) {
      return {
        success: false,
        message: "Already checked in today"
      };
    }

    const pointsEarned = 10; // 每日签到10积分

    // 记录签到
    await db.insert(userCheckins).values({
      userId,
      checkinDate: today,
      pointsEarned,
    });

    // 增加用户积分
    const pointsResult = await updateUserPoints(
      userId,
      pointsEarned,
      "每日签到奖励"
    );

    if (!pointsResult.success) {
      return {
        success: false,
        message: "Check-in failed, points update error"
      };
    }

    // 创建签到成功通知
    await createNotification(
      userId,
      'success',
      '签到成功',
      `每日签到完成，获得 ${pointsEarned} 积分奖励！`
    );

    return {
      success: true,
      points: pointsEarned,
      message: "Check-in successful"
    };
  } catch (error) {
    console.error("每日签到失败:", error);
    return {
      success: false,
      message: "Check-in failed"
    };
  }
}

/**
 * 检查今日是否已签到
 */
export async function checkTodayCheckin(): Promise<{ success: boolean; hasChecked?: boolean; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    // 使用统一的工具函数获取北京时间
    const today = getBeijingDateString();
    const existingCheckin = await db
      .select()
      .from(userCheckins)
      .where(and(
        eq(userCheckins.userId, userId),
        eq(userCheckins.checkinDate, today)
      ))
      .limit(1);

    return {
      success: true,
      hasChecked: existingCheckin.length > 0,
      message: "Check-in status retrieved successfully"
    };
  } catch (error) {
    console.error("检查签到状态失败:", error);
    return {
      success: false,
      message: "Failed to check check-in status"
    };
  }
}

/**
 * 兑换码兑换
 */
export async function redeemCode(code: string): Promise<{ success: boolean; points?: number; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    // 检查兑换码是否存在且有效
    const redeemCodeRecord = await db
      .select()
      .from(redeemCodes)
      .where(eq(redeemCodes.code, code))
      .limit(1);

    if (redeemCodeRecord.length === 0) {
      return {
        success: false,
        message: "Redemption code does not exist"
      };
    }

    const codeInfo = redeemCodeRecord[0];

    // 检查兑换码是否有效
    if (!codeInfo.isActive) {
      return {
        success: false,
        message: "Redemption code is inactive"
      };
    }

    // 检查是否过期
    if (codeInfo.expiresAt && new Date() > codeInfo.expiresAt) {
      return {
        success: false,
        message: "Redemption code has expired"
      };
    }

    // 检查使用次数限制
    if (codeInfo.maxUses && codeInfo.currentUses >= codeInfo.maxUses) {
      return {
        success: false,
        message: "Redemption code usage limit reached"
      };
    }

    // 检查用户是否已使用过此兑换码
    const existingRedemption = await db
      .select()
      .from(pointTransactions)
      .where(and(
        eq(pointTransactions.redeemCodeId, codeInfo.id),
        eq(pointTransactions.userId, userId),
        eq(pointTransactions.transactionType, 'REDEEM')
      ))
      .limit(1);

    if (existingRedemption.length > 0) {
      return {
        success: false,
        message: "You have already used this redemption code"
      };
    }

    // 创建积分交易记录并增加用户积分
    const transaction = await db.insert(pointTransactions).values({
      userId,
      redeemCodeId: codeInfo.id,
      amount: codeInfo.pointsValue,
      transactionType: 'REDEEM',
      description: `兑换码兑换 - ${code}`,
    }).returning();

    // 增加用户积分
    const pointsResult = await updateUserPoints(
      userId,
      codeInfo.pointsValue,
      `兑换码兑换 - ${code}`
    );

    if (!pointsResult.success) {
      return {
        success: false,
        message: "Redemption failed, points update error"
      };
    }

    // 更新兑换码使用次数
    await db
      .update(redeemCodes)
      .set({
        currentUses: codeInfo.currentUses + 1,
      })
      .where(eq(redeemCodes.id, codeInfo.id));

    return {
      success: true,
      points: codeInfo.pointsValue,
      message: "Redemption successful"
    };
  } catch (error) {
    console.error("兑换码兑换失败:", error);
    return {
      success: false,
      message: "Redemption failed"
    };
  }
}

/**
 * 获取积分交易历史
 */
export async function getPointTransactions(limit: number = 20): Promise<{ success: boolean; transactions?: PointTransaction[]; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    const transactions = await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(limit);

    return {
      success: true,
      transactions: transactions as PointTransaction[],
      message: "Point history retrieved successfully"
    };
  } catch (error) {
    console.error("获取积分历史失败:", error);
    return {
      success: false,
      message: "Failed to retrieve point history"
    };
  }
}

/**
 * 获取签到历史
 */
export async function getCheckinHistory(limit: number = 30): Promise<{ success: boolean; checkins?: CheckinRecord[]; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    const checkins = await db
      .select()
      .from(userCheckins)
      .where(eq(userCheckins.userId, userId))
      .orderBy(desc(userCheckins.createdAt))
      .limit(limit);

    return {
      success: true,
      checkins: checkins as CheckinRecord[],
      message: "Check-in history retrieved successfully"
    };
  } catch (error) {
    console.error("获取签到历史失败:", error);
    return {
      success: false,
      message: "Failed to retrieve check-in history"
    };
  }
}

/**
 * 获取用户积分统计
 */
export async function getPointsSummary(): Promise<{ 
  success: boolean; 
  summary?: {
    currentPoints: number;
    hasInfinitePoints: boolean;
    totalEarned: number;
    totalSpent: number;
    todayChecked: boolean;
  }; 
  message: string 
}> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "User not logged in"
      };
    }

    // 获取用户基本信息
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        message: "Failed to retrieve user information"
      };
    }

    const user = userResult.user;

    // 获取积分统计
    const transactions = await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, userId));

    const totalEarned = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    // 检查今日签到
    const todayCheckinResult = await checkTodayCheckin();
    const todayChecked = todayCheckinResult.success ? todayCheckinResult.hasChecked || false : false;

    return {
      success: true,
      summary: {
        currentPoints: user.points,
        hasInfinitePoints: user.hasInfinitePoints,
        totalEarned,
        totalSpent,
        todayChecked,
        membershipType: user.membershipType,
        membershipExpiry: user.membershipExpiry,
      },
      message: "Point statistics retrieved successfully"
    };
  } catch (error) {
    console.error("获取积分统计失败:", error);
    return {
      success: false,
      message: "Failed to retrieve point statistics"
    };
  }
} 
 