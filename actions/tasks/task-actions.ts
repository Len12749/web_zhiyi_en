"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { processingTasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { calculatePoints } from "@/lib/utils";
import { updateUserPoints, getCurrentUser } from "@/actions/auth/user-actions";

export interface ProcessingTask {
  id: number;
  userId: string;
  taskType: string;
  taskStatus: string;
  progressPercent: number;
  statusMessage: string | null;
  inputFilename: string;
  inputFileSize: number;
  inputStoragePath: string;
  processingParams: any;
  externalTaskId: string | null;
  estimatedPoints: number;
  actualPointsUsed: number;
  resultStoragePath: string | null;
  resultFileSize: number | null;
  resultFilename: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date;
}

/**
 * 创建新的处理任务
 */
export async function createProcessingTask(
  taskType: string,
  inputFilename: string,
  inputFileSize: number,
  inputStoragePath: string,
  processingParams: any = {},
  pageCount?: number
): Promise<{ success: boolean; taskId?: number; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未登录"
      };
    }

    // 计算所需积分
    const estimatedPoints = calculatePoints(taskType, inputFileSize, pageCount);
    
    // 验证积分计算是否成功（严格检测）
    if (estimatedPoints === 0) {
      return {
        success: false,
        message: "无法计算积分：缺少必要的文件信息（如PDF页数）。请确保文件完整且格式正确。"
      };
    }

    // 检查用户积分
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        message: "获取用户信息失败"
      };
    }

    const user = userResult.user;
    if (!user.hasInfinitePoints && user.points < estimatedPoints) {
      return {
        success: false,
        message: `积分不足，需要 ${estimatedPoints} 积分，当前余额 ${user.points} 积分`
      };
    }

    // 创建任务记录
    const newTask = await db
      .insert(processingTasks)
      .values({
        userId,
        taskType,
        taskStatus: "pending",
        progressPercent: 0,
        statusMessage: "任务已创建，等待处理",
        inputFilename,
        inputFileSize,
        inputStoragePath,
        processingParams,
        estimatedPoints,
        actualPointsUsed: 0,
        retryCount: 0,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
      })
      .returning();

    return {
      success: true,
      taskId: newTask[0].id,
      message: "任务创建成功"
    };
  } catch (error) {
    console.error("创建处理任务失败:", error);
    return {
      success: false,
      message: "创建处理任务失败"
    };
  }
}

/**
 * 获取任务详情
 */
export async function getTaskById(taskId: number): Promise<{ success: boolean; task?: ProcessingTask; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未登录"
      };
    }

    const task = await db
      .select()
      .from(processingTasks)
      .where(and(
        eq(processingTasks.id, taskId),
        eq(processingTasks.userId, userId)
      ))
      .limit(1);

    if (task.length === 0) {
      return {
        success: false,
        message: "任务不存在或无权限访问"
      };
    }

    return {
      success: true,
      task: task[0] as ProcessingTask,
      message: "获取任务成功"
    };
  } catch (error) {
    console.error("获取任务失败:", error);
    return {
      success: false,
      message: "获取任务失败"
    };
  }
}

/**
 * 更新任务状态
 */
export async function updateTaskStatus(
  taskId: number,
  status: string,
  progressPercent?: number,
  statusMessage?: string,
  externalTaskId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateData: any = {
      taskStatus: status,
      statusMessage: statusMessage || null,
    };

    if (progressPercent !== undefined) {
      updateData.progressPercent = progressPercent;
    }

    if (externalTaskId) {
      updateData.externalTaskId = externalTaskId;
    }

    if (status === "processing" && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    await db
      .update(processingTasks)
      .set(updateData)
      .where(eq(processingTasks.id, taskId));

    return {
      success: true,
      message: "任务状态更新成功"
    };
  } catch (error) {
    console.error("更新任务状态失败:", error);
    return {
      success: false,
      message: "更新任务状态失败"
    };
  }
}

/**
 * 完成任务并扣除积分
 */
export async function completeTask(
  taskId: number,
  resultStoragePath: string,
  resultFileSize: number,
  resultFilename: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 获取任务信息
    const task = await db
      .select()
      .from(processingTasks)
      .where(eq(processingTasks.id, taskId))
      .limit(1);

    if (task.length === 0) {
      return {
        success: false,
        message: "任务不存在"
      };
    }

    const currentTask = task[0];

    // 扣除积分
    const pointsResult = await updateUserPoints(
      currentTask.userId,
      -currentTask.estimatedPoints,
      `任务处理完成 - ${currentTask.inputFilename}`
    );

    if (!pointsResult.success) {
      return {
        success: false,
        message: "扣除积分失败"
      };
    }

    // 更新任务为完成状态
    await db
      .update(processingTasks)
      .set({
        taskStatus: "completed",
        progressPercent: 100,
        statusMessage: "处理完成",
        resultStoragePath,
        resultFileSize,
        resultFilename,
        actualPointsUsed: currentTask.estimatedPoints,
        completedAt: new Date(),
      })
      .where(eq(processingTasks.id, taskId));

    return {
      success: true,
      message: "任务完成"
    };
  } catch (error) {
    console.error("完成任务失败:", error);
    return {
      success: false,
      message: "完成任务失败"
    };
  }
}

/**
 * 任务失败处理
 */
export async function failTask(
  taskId: number,
  errorCode: string,
  errorMessage: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 更新任务状态
    await db
      .update(processingTasks)
      .set({
        taskStatus: "failed",
        errorCode,
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(processingTasks.id, taskId));

    return {
      success: true,
      message: "任务失败状态已记录"
    };
  } catch (error) {
    console.error("记录任务失败状态失败:", error);
    return {
      success: false,
      message: "记录任务失败状态失败"
    };
  }
}

/**
 * 获取用户的任务历史
 */
export async function getUserTasks(limit: number = 20): Promise<{ success: boolean; tasks?: ProcessingTask[]; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未登录"
      };
    }

    const tasks = await db
      .select()
      .from(processingTasks)
      .where(eq(processingTasks.userId, userId))
      .orderBy(desc(processingTasks.createdAt))
      .limit(limit);

    return {
      success: true,
      tasks: tasks as ProcessingTask[],
      message: "获取任务历史成功"
    };
  } catch (error) {
    console.error("获取用户任务失败:", error);
    return {
      success: false,
      message: "获取用户任务失败"
    };
  }
} 