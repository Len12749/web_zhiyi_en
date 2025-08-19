// 纯 Tailwind 类名合并函数
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((className, index, array) => className && array.indexOf(className) === index)
    .join(' ');
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 时间格式化
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 相对时间格式化
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return 'Just now';
}

// 文件扩展名获取
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

// 文件类型验证
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = '.' + getFileExtension(filename);
  return allowedTypes.includes(ext);
}

// 生成随机字符串
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 计算文件处理积分 - 严格按照实际数据计算，不允许估算
export function calculatePoints(
  taskType: string, 
  fileSizeOrPageCount: number, 
  pageCount?: number, 
  enableTranslation?: boolean
): number {
  switch (taskType) {
    case 'pdf-to-markdown':
      if (!pageCount || pageCount <= 0) {
        return 0; // 必须有实际页数
      }
      // 根据是否开启翻译计算积分
      return enableTranslation ? pageCount * 3 : pageCount * 2;
      
    case 'image-to-markdown':
      return 2; // 固定2积分每张图片
      
    case 'markdown-translation':

      // 改为按字符计算，每10000字符2积分，不足10000按10000计算
      const charCount = fileSizeOrPageCount; // 这里假设传入的是字符数
      return Math.max(1, Math.ceil(charCount / 10000)) * 2;
      
    case 'pdf-translation':
      if (!pageCount || pageCount <= 0) {
        return 0; // 必须有实际页数
      }
      return pageCount * 2;
      
    case 'format-conversion':
      return 1; // 固定1积分每次
      
    default:
      return 0;
  }
}



// 进度百分比格式化
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

// 错误处理
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '未知错误';
}

// 异步操作相关工具
export interface AsyncOperationOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
  retryCondition?: (error: unknown) => boolean;
}

/**
 * 带重试机制的异步操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 30000,
    retryCondition = () => true
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 添加超时控制
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeout);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;

      // 检查是否应该重试
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }

      // 计算延迟时间（指数退避）
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      console.warn(`Operation failed, retry ${attempt}, waiting ${delay}ms...`, getErrorMessage(error));
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 并发控制器
 */
export class ConcurrencyController {
  private semaphore: number;
  private queue: Array<() => void> = [];

  constructor(maxConcurrency: number) {
    this.semaphore = maxConcurrency;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeOperation = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.semaphore++;
          if (this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) {
              next();
            }
          }
        }
      };

      if (this.semaphore > 0) {
        this.semaphore--;
        executeOperation();
      } else {
        this.queue.push(() => {
          this.semaphore--;
          executeOperation();
        });
      }
    });
  }
}

/**
 * API响应标准化
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  code?: string;
  timestamp?: string;
}

/**
 * 标准化API请求
 */
export async function makeApiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: AsyncOperationOptions = {}
): Promise<ApiResponse<T>> {
  return withRetry(async () => {
    const response = await fetch(input, {
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    });

    // 检查HTTP状态
    if (!response.ok) {
      let errorMessage = `请求失败: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // 忽略JSON解析错误
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // 如果响应不是标准格式，尝试适配
    if (typeof data.success === 'undefined') {
      return {
        success: true,
        data: data,
        message: '请求成功',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  }, {
    ...options,
    retryCondition: (error) => {
      // 对于特定错误类型进行重试
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return message.includes('网络') || 
               message.includes('timeout') || 
               message.includes('超时') ||
               message.includes('fetch');
      }
      return false;
    },
  });
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

// URL 参数构建
export function buildUrl(baseUrl: string, params: Record<string, string | number>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // 降级处理
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      return false;
    }
  }
}

// PDF页数检测已移至 lib/pdf-utils.ts

// 文件格式验证配置
export const FILE_FORMAT_CONFIG = {
  'pdf-to-markdown': {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSize: 300 * 1024 * 1024, // 300MB
    maxPages: 800,
    description: 'PDF file'
  },
  'pdf-translation': {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSize: 300 * 1024 * 1024, // 300MB
    maxPages: 800,
    description: 'PDF file'
  },
  'image-to-markdown': {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Image file (JPG, PNG)'
  },
  'markdown-translation': {
    mimeTypes: ['text/markdown', 'text/plain', 'application/octet-stream'],
    extensions: ['.md', '.markdown'], // 后端实际只支持.md和.markdown
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Markdown file (.md, .markdown)'
  },
  'format-conversion': {
    mimeTypes: ['text/markdown', 'text/plain', 'application/octet-stream'],
    extensions: ['.md', '.markdown'], // 后端实际只支持.md和.markdown
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Markdown file (.md, .markdown)'
  }
} as const;

export type TaskType = keyof typeof FILE_FORMAT_CONFIG;

/**
 * 验证文件格式和大小
 */
export function validateFileFormat(
  file: File, 
  taskType: TaskType
): { isValid: boolean; error?: string } {
  const config = FILE_FORMAT_CONFIG[taskType];
  
  if (!config) {
    return { isValid: false, error: 'Unsupported task type' };
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return { isValid: false, error: 'Cannot upload empty file, please select a file with content' };
  }

  // 检查文件大小
  if (file.size > config.maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds limit. Please select a file smaller than ${config.maxSize / (1024 * 1024)}MB.` 
    };
  }

  // 获取文件扩展名
  const parts = file.name.toLowerCase().split('.');
  const fileExtension = parts.length > 1 ? '.' + parts.pop() : '';
  
  // 验证文件类型（通过扩展名或MIME类型）
  const isValidExtension = (config.extensions as readonly string[]).includes(fileExtension);
  const isValidMimeType = (config.mimeTypes as readonly string[]).includes(file.type);
  
  // 对于图片转Markdown，严格检查扩展名
  if (taskType === 'image-to-markdown') {
    if (!isValidExtension) {
      return { 
        isValid: false, 
        error: `Unsupported file type. Allowed formats: ${(config.extensions as readonly string[]).join(', ')}` 
      };
    }
  } else {
    // 其他任务类型使用扩展名或MIME类型
    const isValidType = isValidExtension || isValidMimeType;
    if (!isValidType) {
      return { 
        isValid: false, 
        error: `Unsupported file type. Allowed formats: ${(config.extensions as readonly string[]).join(', ')}` 
      };
    }
  }

  return { isValid: true };
}

/**
 * 获取文件格式配置
 */
export function getFileFormatConfig(taskType: TaskType) {
  return FILE_FORMAT_CONFIG[taskType];
}

/**
 * 获取支持的文件扩展名列表（用于HTML accept属性）
 */
export function getAcceptedExtensions(taskType: TaskType): string {
  const config = FILE_FORMAT_CONFIG[taskType];
  if (!config) return '';
  
  return config.extensions.join(',');
}

/**
 * 获取支持的文件类型列表（用于HTML accept属性）
 */
export function getAcceptedTypes(taskType: TaskType): string {
  const config = FILE_FORMAT_CONFIG[taskType];
  if (!config) return '';
  
  return config.mimeTypes.join(',');
}

/**
 * 获取北京时间（UTC+8）的日期字符串，格式为YYYY-MM-DD
 */
export function getBeijingDateString(): string {
  const serverDate = new Date();
  // 转换为北京时间 (UTC+8)
  const beijingTime = new Date(serverDate.getTime() + (8 * 60 * 60 * 1000));
  return `${beijingTime.getUTCFullYear()}-${String(beijingTime.getUTCMonth() + 1).padStart(2, '0')}-${String(beijingTime.getUTCDate()).padStart(2, '0')}`;
} 