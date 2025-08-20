"use server";

import { auth } from "@/lib/auth-server";
import { db } from "@/db";
import { users, pointTransactions } from "@/db/schema";
import { POINTS_RULES } from "@/lib/constants";
import { eq } from "drizzle-orm";

export interface User {
  id: number;
  userId: string;
  email?: string;
  points: number;
  hasInfinitePoints: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 初始化用户 - 首次登录时调用
 */
export async function initializeUser(userId: string, email: string): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: true,
        user: existingUser[0] as User,
        message: "User already exists"
      };
    }

    // 创建新用户
    const insertValues: any = {
      userId: userId,
      points: POINTS_RULES.INITIAL_POINTS,
      hasInfinitePoints: false,
    };
    if (email) {
      insertValues.email = email;
    }

    const newUser = await db
      .insert(users)
      .values(insertValues)
      .returning();

    // 记录初始积分交易
    await db.insert(pointTransactions).values({
      userId: userId,
      amount: POINTS_RULES.INITIAL_POINTS,
      transactionType: "INITIAL",
      description: `新用户注册赠送${POINTS_RULES.INITIAL_POINTS}积分`,
    });

    return {
      success: true,
      user: newUser[0] as User,
      message: "User created successfully"
    };
  } catch (error) {
    console.error("初始化用户失败:", error);
    return {
      success: false,
      message: "Failed to initialize user"
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
        message: "User not logged in"
      };
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (user.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }

    return {
      success: true,
      user: user[0] as User,
      message: "User information retrieved successfully"
    };
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return {
      success: false,
      message: "Failed to retrieve user information"
    };
  }
}

/**
 * 更新用户积分
 */
export async function updateUserPoints(userId: string, pointsChange: number, description: string): Promise<{ success: boolean; newBalance?: number; message: string }> {
  try {
    // 获取当前用户
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }

    const user = currentUser[0];

    // 如果用户有无限积分，只记录交易但不改变余额
    if (user.hasInfinitePoints && pointsChange < 0) {
      await db.insert(pointTransactions).values({
        userId: userId,
        amount: pointsChange,
        transactionType: pointsChange > 0 ? "EARN" : "CONSUME",
        description,
      });

      return {
        success: true,
        newBalance: user.points,
        message: "Points updated successfully (unlimited points user)"
      };
    }

    // 检查积分是否足够
    if (pointsChange < 0 && user.points + pointsChange < 0) {
      return {
        success: false,
        message: "Insufficient point balance"
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
      .where(eq(users.userId, userId));

    // 记录积分交易
    await db.insert(pointTransactions).values({
      userId: userId,
      amount: pointsChange,
      transactionType: pointsChange > 0 ? "EARN" : "CONSUME",
      description,
    });

    return {
      success: true,
      newBalance,
      message: "Points updated successfully"
    };
  } catch (error) {
    console.error("更新用户积分失败:", error);
    return {
      success: false,
      message: "Failed to update user points"
    };
  }
} 