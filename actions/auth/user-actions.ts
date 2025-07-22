"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { users, pointTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface User {
  id: number;
  clerkId: string;
  email: string;
  points: number;
  hasInfinitePoints: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 初始化用户 - 首次登录时调用
 */
export async function initializeUser(clerkId: string, email: string): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: true,
        user: existingUser[0] as User,
        message: "用户已存在"
      };
    }

    // 创建新用户
    const newUser = await db
      .insert(users)
      .values({
        clerkId,
        email,
        points: 20, // 初始20积分
        hasInfinitePoints: false,
      })
      .returning();

    // 记录初始积分交易
    await db.insert(pointTransactions).values({
      userId: clerkId,
      amount: 20,
      transactionType: "INITIAL",
      description: "新用户注册赠送积分",
    });

    return {
      success: true,
      user: newUser[0] as User,
      message: "用户创建成功"
    };
  } catch (error) {
    console.error("初始化用户失败:", error);
    return {
      success: false,
      message: "初始化用户失败"
    };
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未登录"
      };
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return {
        success: false,
        message: "用户不存在"
      };
    }

    return {
      success: true,
      user: user[0] as User,
      message: "获取用户信息成功"
    };
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return {
      success: false,
      message: "获取用户信息失败"
    };
  }
}

/**
 * 更新用户积分
 */
export async function updateUserPoints(clerkId: string, pointsChange: number, description: string): Promise<{ success: boolean; newBalance?: number; message: string }> {
  try {
    // 获取当前用户
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (currentUser.length === 0) {
      return {
        success: false,
        message: "用户不存在"
      };
    }

    const user = currentUser[0];

    // 如果用户有无限积分，只记录交易但不改变余额
    if (user.hasInfinitePoints && pointsChange < 0) {
      await db.insert(pointTransactions).values({
        userId: clerkId,
        amount: pointsChange,
        transactionType: pointsChange > 0 ? "EARN" : "CONSUME",
        description,
      });

      return {
        success: true,
        newBalance: user.points,
        message: "积分更新成功（无限积分用户）"
      };
    }

    // 检查积分是否足够
    if (pointsChange < 0 && user.points + pointsChange < 0) {
      return {
        success: false,
        message: "积分余额不足"
      };
    }

    // 更新用户积分
    const newBalance = user.points + pointsChange;
    await db
      .update(users)
      .set({ 
        points: newBalance,
        updatedAt: new Date()
      })
      .where(eq(users.clerkId, clerkId));

    // 记录积分交易
    await db.insert(pointTransactions).values({
      userId: clerkId,
      amount: pointsChange,
      transactionType: pointsChange > 0 ? "EARN" : "CONSUME",
      description,
    });

    return {
      success: true,
      newBalance,
      message: "积分更新成功"
    };
  } catch (error) {
    console.error("更新用户积分失败:", error);
    return {
      success: false,
      message: "更新用户积分失败"
    };
  }
} 