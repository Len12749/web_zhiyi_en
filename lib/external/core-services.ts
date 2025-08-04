// 核心服务配置 - 匹配实际部署的端口
export const CORE_SERVICES = {
  FORMAT_CONVERSION: 'http://localhost:8001',     // 格式转换
  PDF_TO_MARKDOWN: 'http://localhost:8002',       // PDF转Markdown
  MARKDOWN_TRANSLATION: 'http://localhost:8003',  // Markdown翻译
  IMAGE_TO_MARKDOWN: 'http://localhost:8004',     // 图片转Markdown
  PDF_TRANSLATION: 'http://localhost:8005',       // PDF翻译
} as const

// API客户端基类
class CoreServiceClient {
  protected baseURL: string
  protected timeout: number = 3600000 // 1小时超时，支持长时间处理

  constructor(baseURL: string) {
    this.baseURL = baseURL
    
    // 配置全局 undici 超时设置
    try {
      const { setGlobalDispatcher, Agent } = require('undici')
      setGlobalDispatcher(new Agent({
        bodyTimeout: 3600000, // 1小时
        headersTimeout: 300000, // 5分钟
        keepAliveTimeout: 3600000, // 1小时
        keepAliveMaxTimeout: 3600000 // 1小时
      }))
      console.log('✅ undici 超时配置已成功设置为1小时')
    } catch (error) {
      console.warn('无法设置 undici 超时配置:', error.message)
    }
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // 创建自定义的AbortController以避免Node.js timeout问题
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  protected async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // 创建自定义的AbortController以避免Node.js body timeout问题
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // 添加这些headers可能有助于避免body timeout
        headers: {
          'Connection': 'keep-alive',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`文件上传失败: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.makeRequest('/health')
  }
}

// PDF转Markdown服务客户端
export class PDFToMarkdownClient extends CoreServiceClient {
  constructor() {
    super(CORE_SERVICES.PDF_TO_MARKDOWN)
  }

  async parsePDF(
    file: File,
    options: {
      tableFormat: 'markdown' | 'image'
      enableTranslation?: boolean
      targetLanguage?: string
      translationOutput?: ('original' | 'translated' | 'bilingual')[]
    }
  ): Promise<{ task_id: string; message: string }> {
    const additionalData: Record<string, string> = {
      table_mode: options.tableFormat,
    }

    if (options.enableTranslation) {
      additionalData.enable_translation = 'true'
      if (options.targetLanguage) {
        additionalData.target_language = options.targetLanguage
      }
      if (options.translationOutput) {
        additionalData.output_options = options.translationOutput.join(',')
      }
    }

    const callbackUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/tasks/webhook'
    additionalData.callback_url = callbackUrl
    return this.uploadFile('/parse', file, additionalData)
  }

  async getTaskStatus(taskId: string): Promise<{
    task_id: string
    status: string
    progress: number
    message?: string
    result_path?: string
  }> {
    return this.makeRequest(`/status/${taskId}`)
  }

  async downloadResult(taskId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/download/${taskId}`, {
      signal: AbortSignal.timeout(this.timeout),
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }
    
    return response.blob()
  }
}

// 图片转Markdown服务客户端
export class ImageToMarkdownClient extends CoreServiceClient {
  constructor() {
    super(CORE_SERVICES.IMAGE_TO_MARKDOWN)
  }

  async recognizeImage(file: File): Promise<{
    success: boolean
    markdown_content: string
    processing_time: number
  }> {
    return this.uploadFile('/recognize', file)
  }
}

// Markdown翻译服务客户端
export class MarkdownTranslationClient extends CoreServiceClient {
  constructor() {
    super(CORE_SERVICES.MARKDOWN_TRANSLATION)
  }

  async translateMarkdown(
    file: File,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ task_id: string; message: string }> {
    const callbackUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/tasks/webhook'
    return this.uploadFile('/translate', file, {
      sourceLanguage,
      targetLanguage,
      callback_url: callbackUrl,
    })
  }

  async downloadResult(taskId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/download/${taskId}`, {
      signal: AbortSignal.timeout(this.timeout),
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }
    
    return response.blob()
  }
}

// PDF翻译服务客户端
export class PDFTranslationClient extends CoreServiceClient {
  constructor() {
    super(CORE_SERVICES.PDF_TRANSLATION)
  }

  async translatePDF(
    file: File,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ task_id: string; message: string }> {
    const callbackUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/tasks/webhook'
    return this.uploadFile('/translate-pdf', file, {
      sourceLanguage,
      targetLanguage,
      callback_url: callbackUrl,
    })
  }

  async downloadResult(taskId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/download/${taskId}`, {
      signal: AbortSignal.timeout(this.timeout),
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }
    
    return response.blob()
  }
}

// 格式转换服务客户端
export class FormatConversionClient extends CoreServiceClient {
  constructor() {
    super(CORE_SERVICES.FORMAT_CONVERSION)
  }

  async getSupportedFormats(): Promise<string[]> {
    return this.makeRequest('/formats')
  }

  async convertFile(
    file: File,
    targetFormat: 'word' | 'html' | 'pdf' | 'latex'
  ): Promise<{ task_id: string; status: string; message: string }> {
    // 格式映射：前端格式 -> 后端API格式
    const formatMapping: Record<string, string> = {
      'word': 'docx',
      'html': 'html', 
      'pdf': 'pdf',
      'latex': 'tex'
    }
    
    const apiFormat = formatMapping[targetFormat] || targetFormat
    
    console.log(`格式转换请求: ${file.name} (${file.size} bytes) -> ${targetFormat} (API: ${apiFormat})`)

    const response = await fetch(`${this.baseURL}/convert`, {
      method: 'POST',
      body: (() => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('format', apiFormat)  // 使用映射后的格式
        return formData
      })(),
      signal: AbortSignal.timeout(this.timeout),
    })

    console.log(`格式转换响应: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '未知错误')
      console.error(`格式转换失败详情:`, errorText)
      throw new Error(`格式转换失败: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`格式转换任务创建成功: 任务ID ${result.task_id}`)
    
    return result
  }

  async getTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/status/${taskId}`, {
      signal: AbortSignal.timeout(this.timeout)
    })

    if (!response.ok) {
      throw new Error(`获取任务状态失败: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async downloadResult(taskId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/download/${taskId}`, {
      signal: AbortSignal.timeout(this.timeout)
    })

    if (!response.ok) {
      throw new Error(`下载结果失败: ${response.status} ${response.statusText}`)
    }

    return response.blob()
  }
}

// 核心服务管理器
export class CoreServiceManager {
  public pdfToMarkdown: PDFToMarkdownClient
  public imageToMarkdown: ImageToMarkdownClient
  public markdownTranslation: MarkdownTranslationClient
  public pdfTranslation: PDFTranslationClient
  public formatConversion: FormatConversionClient

  constructor() {
    this.pdfToMarkdown = new PDFToMarkdownClient()
    this.imageToMarkdown = new ImageToMarkdownClient()
    this.markdownTranslation = new MarkdownTranslationClient()
    this.pdfTranslation = new PDFTranslationClient()
    this.formatConversion = new FormatConversionClient()
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    const services = [
      { name: 'pdfToMarkdown', client: this.pdfToMarkdown },
      { name: 'imageToMarkdown', client: this.imageToMarkdown },
      { name: 'markdownTranslation', client: this.markdownTranslation },
      { name: 'pdfTranslation', client: this.pdfTranslation },
      { name: 'formatConversion', client: this.formatConversion },
    ]

    const results: Record<string, boolean> = {}

    await Promise.allSettled(
      services.map(async ({ name, client }) => {
        try {
          await client.healthCheck()
          results[name] = true
        } catch {
          results[name] = false
        }
      })
    )

    return results
  }
}

// 导出单例实例
export const coreServices = new CoreServiceManager()

// 语言映射
export const SUPPORTED_LANGUAGES = {
  'zh': '中文',
  'en': '英语', 
  'ja': '日语',
  'ko': '韩语',
  'fr': '法语',
  'de': '德语',
  'es': '西班牙语',
  'ru': '俄语'
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES 