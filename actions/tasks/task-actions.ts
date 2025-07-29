"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { processingTasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { calculatePoints } from "@/lib/utils";
import { updateUserPoints, getCurrentUser } from "@/actions/auth/user-actions";
import { createNotification } from "@/actions/notifications/notification-actions";

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

    // 计算所需积分 - 根据任务类型使用不同的参数
    let estimatedPoints = 0;
    switch (taskType) {
      case 'pdf-to-markdown':
      case 'pdf-translation':
        // 这些任务需要页数
        estimatedPoints = calculatePoints(taskType, inputFileSize, pageCount);
        break;
      case 'format-conversion':
      case 'markdown-translation':
        // 这些任务按文件大小计算
        estimatedPoints = calculatePoints(taskType, inputFileSize);
        break;
      case 'image-to-markdown':
        // 图片转Markdown固定积分
        estimatedPoints = calculatePoints(taskType, inputFileSize);
        break;
      default:
        estimatedPoints = 0;
    }
    
    // 验证积分计算是否成功（严格检测）
    if (estimatedPoints === 0) {
      return {
        success: false,
        message: "无法计算积分：缺少必要的文件信息（如PDF页数）。请确保文件完整且格式正确。"
      };
    }

    // 检查用户积分并立即扣除（防止并发任务漏洞）
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

    // 立即扣除积分（防止并发任务超支）
    const pointsResult = await updateUserPoints(
      userId,
      -estimatedPoints,
      `任务开始处理 - ${inputFilename}（预扣积分）`
    );

    if (!pointsResult.success) {
      return {
        success: false,
        message: "积分扣除失败，任务无法创建"
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
 * 获取用户任务列表
 */
export async function getUserTasks(limit: number = 50): Promise<{ success: boolean; tasks?: ProcessingTask[]; message: string }> {
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
      message: "获取任务列表成功"
    };
  } catch (error) {
    console.error("获取用户任务失败:", error);
    return {
      success: false,
      message: "获取任务列表失败"
    };
  }
}

/**
 * 根据ID获取任务
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

    // 积分已在任务创建时扣除，这里只需要更新任务状态
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

    // 创建完成通知
    const taskTypeNames: { [key: string]: string } = {
      'pdf-to-markdown': 'PDF解析',
      'image-to-markdown': '图片转Markdown',
      'markdown-translation': 'Markdown翻译',
      'pdf-translation': 'PDF翻译',
      'format-conversion': '格式转换'
    };

    const taskTypeName = taskTypeNames[currentTask.taskType] || '文件处理';
    
    await createNotification(
      currentTask.userId,
      'success',
      `${taskTypeName}完成`,
      `您的文件 "${currentTask.inputFilename}" 已成功处理完成，可以下载了。`,
      taskId
    );

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
 * 任务失败
 */
export async function failTask(
  taskId: number,
  errorCode: string,
  errorMessage: string
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

    // 任务失败时返还积分
    const pointsRefundResult = await updateUserPoints(
      currentTask.userId,
      currentTask.estimatedPoints,
      `任务处理失败，返还积分 - ${currentTask.inputFilename}`
    );

    if (!pointsRefundResult.success) {
      console.error("返还积分失败:", pointsRefundResult.message);
      // 继续执行，不阻塞任务状态更新
    }

    // 更新任务为失败状态
    await db
      .update(processingTasks)
      .set({
        taskStatus: "failed",
        statusMessage: "处理失败",
        errorCode,
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(processingTasks.id, taskId));

    // 创建失败通知
    const taskTypeNames: { [key: string]: string } = {
      'pdf-to-markdown': 'PDF解析',
      'image-to-markdown': '图片转Markdown',
      'markdown-translation': 'Markdown翻译',
      'pdf-translation': 'PDF翻译',
      'format-conversion': '格式转换'
    };

    const taskTypeName = taskTypeNames[currentTask.taskType] || '文件处理';
    
    await createNotification(
      currentTask.userId,
      'error',
      `${taskTypeName}失败`,
      `文件 "${currentTask.inputFilename}" 处理失败：${errorMessage}。未消耗积分。`,
      taskId
    );

    return {
      success: true,
      message: "任务标记为失败"
    };
  } catch (error) {
    console.error("标记任务失败失败:", error);
    return {
      success: false,
      message: "标记任务失败失败"
    };
  }
}

/**
 * 删除任务
 */
export async function deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        success: false,
        message: "用户未登录"
      };
    }

    // 验证任务归属
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
        message: "任务不存在或无权限删除"
      };
    }

    // 删除任务
    await db
      .delete(processingTasks)
      .where(eq(processingTasks.id, taskId));

    return {
      success: true,
      message: "任务删除成功"
    };
  } catch (error) {
    console.error("删除任务失败:", error);
    return {
      success: false,
      message: "删除任务失败"
    };
  }
} 