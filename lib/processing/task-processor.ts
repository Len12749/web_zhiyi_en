import { coreServices, SupportedLanguage } from '@/lib/external/core-services'
import { sseConnectionManager } from '@/lib/sse/connection-manager'
import { updateTaskStatus, completeTask, failTask } from '@/actions/tasks/task-actions'
import { calculatePoints } from '@/lib/utils'

// 任务类型映射
export type TaskType = 
  | 'pdf-to-markdown'
  | 'image-to-markdown' 
  | 'markdown-translation'
  | 'pdf-translation'
  | 'format-conversion'

// 任务处理参数类型
export interface TaskParams {
  'pdf-to-markdown': {
    tableFormat: 'markdown' | 'image'
    enableTranslation?: boolean
    targetLanguage?: SupportedLanguage
    translationOutput?: ('original' | 'translated' | 'bilingual')[]
  }
  'image-to-markdown': {}
  'markdown-translation': {
    sourceLanguage: SupportedLanguage
    targetLanguage: SupportedLanguage
  }
  'pdf-translation': {
    sourceLanguage: SupportedLanguage
    targetLanguage: SupportedLanguage
  }
  'format-conversion': {
    targetFormat: 'word' | 'html' | 'pdf' | 'latex'
  }
}

// 任务处理器类
export class TaskProcessor {
  private taskId: number
  private userId: string
  private taskType: TaskType
  private externalTaskId?: string

  constructor(taskId: number, userId: string, taskType: TaskType, externalTaskId?: string) {
    this.taskId = taskId
    this.userId = userId
    this.taskType = taskType
    this.externalTaskId = externalTaskId
  }

  // 计算任务所需积分 - 使用统一的精确计算逻辑
  static calculatePoints<T extends TaskType>(
    taskType: T,
    fileSizeOrPageCount: number,
    params: TaskParams[T],
    pageCount?: number
  ): number {
    switch (taskType) {
      case 'pdf-to-markdown':
        const pdfParams = params as TaskParams['pdf-to-markdown']
        return calculatePoints(taskType, fileSizeOrPageCount, pageCount, pdfParams.enableTranslation)
      case 'image-to-markdown':
        return calculatePoints(taskType, fileSizeOrPageCount)
      case 'markdown-translation':
        return calculatePoints(taskType, fileSizeOrPageCount)
      case 'pdf-translation':
        return calculatePoints(taskType, fileSizeOrPageCount, pageCount)
      case 'format-conversion':
        return calculatePoints(taskType, fileSizeOrPageCount)
      default:
        return 0
    }
  }

  // 推送SSE状态更新 - 完全按照通知SSE的简单机制
  private async pushStatusUpdate(
    status: string,
    progress: number,
    message?: string
  ) {
    // 更新数据库状态
    try {
      await updateTaskStatus(this.taskId, status, progress, message)
    } catch (error) {
      console.error(`[${this.taskId}] 更新数据库状态失败:`, error)
    }

    // 推送SSE消息 - 和通知SSE一样简单
    try {
      sseConnectionManager.pushToTask(this.taskId, {
        type: 'status_update',
        data: { status, progress, message }
      })
    } catch (error) {
      console.error(`[${this.taskId}] SSE推送失败:`, error)
    }
  }

  // 发送心跳保持连接活跃
  private sendHeartbeat() {
    try {
      sseConnectionManager.sendHeartbeat(this.taskId)
    } catch (error) {
      // 心跳失败不影响任务处理
    }
  }

  // 处理任务的主要方法
  async processTask<T extends TaskType>(
    file: File,
    params: TaskParams[T]
  ): Promise<void> {
    try {
      await this.pushStatusUpdate('processing', 0, '开始处理任务...')

      let result: any
      let isAsyncTask = false

      switch (this.taskType) {
        case 'pdf-to-markdown':
          result = await coreServices.pdfToMarkdown.parsePDF(
            file,
            params as TaskParams['pdf-to-markdown']
          )
          isAsyncTask = true
          break

        case 'image-to-markdown':
          await this.pushStatusUpdate('processing', 20, '正在识别图片内容...')
          result = await coreServices.imageToMarkdown.recognizeImage(file)
          isAsyncTask = true
          break

        case 'markdown-translation':
          const mdParams = params as TaskParams['markdown-translation']
          result = await coreServices.markdownTranslation.translateMarkdown(
            file,
            mdParams.sourceLanguage,
            mdParams.targetLanguage
          )
          isAsyncTask = true
          break

        case 'pdf-translation':
          const pdfParams = params as TaskParams['pdf-translation']
          result = await coreServices.pdfTranslation.translatePDF(
            file,
            pdfParams.sourceLanguage,
            pdfParams.targetLanguage
          )
          isAsyncTask = true
          break

        case 'format-conversion':
          const formatParams = params as TaskParams['format-conversion']
          await this.pushStatusUpdate('processing', 20, '正在转换格式...')
          result = await coreServices.formatConversion.convertFile(
            file,
            formatParams.targetFormat
          )
          isAsyncTask = true
          break

        default:
          throw new Error(`不支持的任务类型: ${this.taskType}`)
      }

              if (isAsyncTask && result.task_id) {
          // 异步任务：保存外部任务ID，等待webhook回调
          console.log(`[${this.taskId}] 异步任务，外部任务ID: ${result.task_id}`)
          this.externalTaskId = result.task_id
          await updateTaskStatus(this.taskId, 'processing', 10, '任务已提交，等待外部完成...', result.task_id)

          // 立即向前端推送当前状态
          await this.pushStatusUpdate('processing', 10, '任务已提交，等待外部完成...')
          
          // ✅ 所有异步任务都使用webhook回调，无需轮询监控，直接等待回调即可
          console.log(`[${this.taskId}] 任务已提交，等待webhook回调完成处理`)
          return
        } else {
        // 同步任务：直接处理结果
        console.log(`[${this.taskId}] 同步任务 ${this.taskType}，直接处理结果`)
        await this.handleSyncResult(result)
      }

    } catch (error) {
      console.error(`任务处理失败 [${this.taskId}]:`, error)
      
      // 调用failTask返还积分并更新任务状态
      const errorMessage = error instanceof Error ? error.message : '处理失败'
      await failTask(this.taskId, 'PROCESSING_ERROR', errorMessage)
      
      // 推送失败状态给前端
      await this.pushStatusUpdate('failed', 0, errorMessage)
    }
  }

  // 从文件路径处理任务
  async processTaskFromPath<T extends TaskType>(
    filePath: string,
    params: TaskParams[T]
  ): Promise<void> {
    console.log(`🚀 [${this.taskId}] 开始处理任务，类型: ${this.taskType}`)
    try {
      // 从存储路径读取文件
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      
      // 构建完整文件路径
      const dataStoragePath = process.env.DATA_STORAGE_PATH || './data'
      const fullPath = join(dataStoragePath, filePath, 'original')
      
      // 读取文件列表获取原始文件名
      const { readdir } = await import('fs/promises')
      const files = await readdir(fullPath)
      
      if (files.length === 0) {
        throw new Error('未找到上传的文件')
      }
      
      const originalFileName = files[0]
      const originalFilePath = join(fullPath, originalFileName)
      
      console.log(`📁 [${this.taskId}] 读取文件: ${originalFileName}`)
      
      // 读取文件内容
      const fileBuffer = await readFile(originalFilePath)
      
      // 从文件路径获取文件信息
      const { stat } = await import('fs/promises')
      const fileStats = await stat(originalFilePath)
      
      // 创建File对象
      const file = new File([fileBuffer], originalFileName, {
        type: this.getFileType(originalFileName),
        lastModified: fileStats.mtime.getTime()
      })
      
      console.log(`🎯 [${this.taskId}] 文件已加载，开始处理: ${file.name}, 大小: ${file.size}`)
      
      // 调用原有的processTask方法
      await this.processTask(file, params)
      
      console.log(`✅ [${this.taskId}] processTaskFromPath 完成`)
      
    } catch (error) {
      console.error(`❌ [${this.taskId}] 从路径处理任务失败:`, error)
      
      // 调用failTask返还积分并更新任务状态
      const errorMessage = error instanceof Error ? error.message : '处理失败'
      await failTask(this.taskId, 'FILE_PROCESSING_ERROR', errorMessage)
      
      // 推送失败状态给前端
      await this.pushStatusUpdate('failed', 0, errorMessage)
    }
  }

  // 根据文件名判断文件类型
  private getFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf':
        return 'application/pdf'
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'gif':
        return 'image/gif'
      case 'webp':
        return 'image/webp'
      case 'md':
      case 'markdown':
        return 'text/markdown'
      default:
        return 'application/octet-stream'
    }
  }



  // 下载并保存结果
  // 供Webhook回调调用，用于完成异步任务（下载结果并更新状态）
  public async completeExternalTask(): Promise<void> {
    await this.downloadResult();
  }

  private async downloadResult(): Promise<void> {
    if (!this.externalTaskId) {
      throw new Error('外部任务ID未设置')
    }

    let blob: Blob

    switch (this.taskType) {
      case 'pdf-to-markdown':
        blob = await coreServices.pdfToMarkdown.downloadResult(this.externalTaskId)
        break
      case 'format-conversion':
        blob = await coreServices.formatConversion.downloadResult(this.externalTaskId)
        break
      case 'image-to-markdown':
        blob = await coreServices.imageToMarkdown.downloadResult(this.externalTaskId)
        break
      case 'markdown-translation':
        blob = await coreServices.markdownTranslation.downloadResult(this.externalTaskId)
        break
      case 'pdf-translation':
        blob = await coreServices.pdfTranslation.downloadResult(this.externalTaskId)
        break
      default:
        throw new Error(`不支持下载的任务类型: ${this.taskType}`)
    }

    // 保存文件到存储系统
    const filename = await this.saveResultFile(blob)
    
    await this.pushStatusUpdate('processing', 95, '保存结果文件...')

    // 构建相对存储路径
    const relativePath = `processed/${this.userId}/${this.taskType}/${this.taskId}/result/${filename}`;

    // 更新任务状态为完成
    const completeResult = await completeTask(this.taskId, relativePath, blob.size, filename)
    
    if (!completeResult.success) {
      throw new Error(`完成任务失败: ${completeResult.message}`)
    }

    console.log(`[${this.taskId}] 任务完成，推送completed状态`)
    await this.pushStatusUpdate('completed', 100, '任务完成！')
  }

  // 处理同步任务结果
  private async handleSyncResult(result: any): Promise<void> {
    console.log(`[${this.taskId}] 开始处理同步任务结果，类型: ${this.taskType}`)
    await this.pushStatusUpdate('processing', 50, '处理结果...')

    let blob: Blob
    let filename: string

    if (this.taskType === 'image-to-markdown') {
      console.log(`[${this.taskId}] 图片转Markdown，内容长度: ${result.markdown_content?.length || 0}`)
      // 图片转Markdown返回文本内容
      blob = new Blob([result.markdown_content], { type: 'text/markdown' })
      filename = `image_markdown_${Date.now()}.md`
    } else if (this.taskType === 'format-conversion') {
      // 格式转换返回文件
      blob = result
      const formatParams = await this.getTaskParams() as TaskParams['format-conversion']
      
      // 格式映射：前端格式 -> 文件扩展名
      const extensionMapping: Record<string, string> = {
        'word': 'docx',
        'html': 'html', 
        'pdf': 'pdf',
        'latex': 'tex'
      }
      
      const extension = extensionMapping[formatParams.targetFormat] || formatParams.targetFormat
      filename = `converted_${Date.now()}.${extension}`
    } else {
      throw new Error(`未知的同步任务类型: ${this.taskType}`)
    }

    await this.pushStatusUpdate('processing', 90, '保存结果文件...')

    // 保存文件
    const savedFilename = await this.saveResultFile(blob)

    // 构建相对存储路径
    const relativePath = `processed/${this.userId}/${this.taskType}/${this.taskId}/result/${savedFilename}`;

    // 更新任务状态
    try {
      console.log(`[${this.taskId}] 准备完成任务...`)
      const completeResult = await completeTask(this.taskId, relativePath, blob.size, savedFilename)
      console.log(`[${this.taskId}] completeTask结果:`, completeResult)
      
      if (!completeResult.success) {
        throw new Error(`完成任务失败: ${completeResult.message}`)
      }

      console.log(`[${this.taskId}] 同步任务完成，推送completed状态`)
      await this.pushStatusUpdate('completed', 100, '任务完成！')
      console.log(`[${this.taskId}] completed状态已推送`)
    } catch (completeError) {
      console.error(`[${this.taskId}] 完成任务时出错:`, completeError)
      await this.pushStatusUpdate('failed', 0, `完成任务失败: ${completeError instanceof Error ? completeError.message : '未知错误'}`)
      throw completeError
    }
  }

  // 保存结果文件到存储系统
  private async saveResultFile(blob: Blob): Promise<string> {
    console.log(`[${this.taskId}] 开始保存结果文件，大小: ${blob.size} bytes`)
    const { writeFile, mkdir } = await import('fs/promises')
    const { join } = await import('path')
    
    try {
      // 获取数据存储路径
      const dataStoragePath = process.env.DATA_STORAGE_PATH || './data'
      const timestamp = Date.now()
      
      // 构建结果存储目录
      const resultDir = join(
        dataStoragePath,
        'processed',
        this.userId,
        this.taskType,
        this.taskId.toString()
      )
      
      const resultPath = join(resultDir, 'result')
      
      console.log(`[${this.taskId}] 创建目录: ${resultPath}`)
      
      // 确保目录存在
      await mkdir(resultPath, { recursive: true })
      
      // 生成文件名
      let filename: string
      if (this.taskType === 'image-to-markdown') {
        filename = `result_${timestamp}.md`
      } else if (this.taskType === 'format-conversion') {
        // 从任务参数获取目标格式
        const taskParams = await this.getTaskParams() as TaskParams['format-conversion']
        const extensionMapping: Record<string, string> = {
          'word': 'docx',
          'html': 'html', 
          'pdf': 'pdf',
          'latex': 'tex'
        }
        const extension = extensionMapping[taskParams.targetFormat] || taskParams.targetFormat
        filename = `converted_${timestamp}.${extension}`
      } else if (this.taskType === 'pdf-to-markdown') {
        filename = `pdf_markdown_${timestamp}.zip`
      } else if (this.taskType === 'markdown-translation') {
        filename = `translated_${timestamp}.md`
      } else if (this.taskType === 'pdf-translation') {
        filename = `translated_pdf_${timestamp}.pdf`
      } else {
        filename = `result_${timestamp}`
      }
      
      const filePath = join(resultPath, filename)
      
      console.log(`[${this.taskId}] 保存文件到: ${filePath}`)
      
      // 将Blob转换为Buffer并保存
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await writeFile(filePath, buffer)
      
      console.log(`[${this.taskId}] 文件内容已写入，大小: ${buffer.length} bytes`)
      
      // 创建元数据文件
      const metadata = {
        taskId: this.taskId,
        userId: this.userId,
        taskType: this.taskType,
        filename,
        fileSize: blob.size,
        createdAt: new Date().toISOString(),
      }
      
      const metadataPath = join(resultDir, 'metadata.json')
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      
      console.log(`[${this.taskId}] 文件已保存: ${filePath}`)
      
      return filename
    } catch (error) {
      console.error('保存结果文件失败:', error)
      throw new Error('保存结果文件失败')
    }
  }

  // 获取任务参数（从数据库）
  private async getTaskParams(): Promise<any> {
    try {
      const { getTaskById } = await import('@/actions/tasks/task-actions')
      const result = await getTaskById(this.taskId, true)
      return result.task?.processingParams || {}
    } catch (error) {
      console.error('获取任务参数失败:', error)
      return {}
    }
  }
}

// 导出任务处理函数
export async function processTask<T extends TaskType>(
  taskId: number,
  userId: string,
  taskType: T,
  file: File,
  params: TaskParams[T]
): Promise<void> {
  const processor = new TaskProcessor(taskId, userId, taskType)
  await processor.processTask(file, params)
} 