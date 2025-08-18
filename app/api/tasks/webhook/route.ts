import { NextResponse } from 'next/server'
import { db } from '@/db'
import { processingTasks } from '@/db/schema/processing-tasks'
import { eq } from 'drizzle-orm'
import { TaskProcessor, TaskType } from '@/lib/processing/task-processor'
import { failTask } from '@/actions/tasks/task-actions'

interface WebhookPayload {
  externalTaskId: string
  status: 'completed' | 'failed'
  message?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebhookPayload

    const { externalTaskId, status, message } = payload

    if (!externalTaskId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing externalTaskId or status' },
        { status: 400 }
      )
    }

    // 根据 externalTaskId 查找内部任务
    const taskRows = await db
      .select()
      .from(processingTasks)
      .where(eq(processingTasks.externalTaskId, externalTaskId))
      .limit(1)

    if (taskRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No matching task found' },
        { status: 404 }
      )
    }

    const task = taskRows[0]

    // 根据状态处理
    if (status === 'completed') {
      try {
        // 实例化处理器以完成剩余流程（下载结果、保存、推送 SSE 等）
        const processor = new TaskProcessor(
          task.id,
          task.userId,
          task.taskType as TaskType,
          externalTaskId
        )

        await processor.completeExternalTask()

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error(`[Webhook] 完成任务失败 [${task.id}]:`, error)
        // 如果完成流程失败，标记任务为失败并返还积分
        await failTask(task.id, 'COMPLETION_ERROR', error instanceof Error ? error.message : 'Processing completion failed')
        return NextResponse.json({ success: true, message: 'Task completion failed, points refunded' })
      }
    } else if (status === 'failed') {
              await failTask(task.id, 'EXTERNAL_TASK_FAILED', message || 'External task failed')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
              { success: false, message: 'Unknown status' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Webhook] 处理失败:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
