import type { TaskType, TransactionType } from '../types';

// 任务类型映射
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  'pdf-to-markdown': 'PDF解析',
  'image-to-markdown': '图片转Markdown',
  'markdown-translation': 'Markdown翻译',
  'pdf-translation': 'PDF翻译',
  'format-conversion': '格式转换',
};

// 任务状态映射
export const TASK_STATUS_LABELS = {
  pending: '等待中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
} as const;

// 交易类型映射
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INITIAL: '注册奖励',
  CHECKIN: '签到奖励',
  REDEEM: '兑换码',
  CONSUME: '任务消费',
  REFUND: '失败退款',
  ADMIN_ADJUST: '管理员调整',
};

// 文件大小限制
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 300 * 1024 * 1024, // 300MB
  MAX_PAGES: 800,
} as const;

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  PDF: ['.pdf'],
  MARKDOWN: ['.md', '.markdown'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  DOCUMENTS: ['.doc', '.docx'],
} as const;

// API 路径
export const API_PATHS = {
  // 用户相关
  USER_INIT: '/api/user/init',
  USER_POINTS: '/api/user/points',
  USER_CHECKIN: '/api/user/checkin',
  USER_REDEEM: '/api/user/redeem',
  
  // 任务相关
  TASKS_CREATE: '/api/tasks/create',
  TASKS_STATUS: '/api/tasks/[taskId]/status',
  TASKS_DOWNLOAD: '/api/tasks/[taskId]/download',
  TASKS_DELETE: '/api/tasks/[taskId]',
  
  // SSE 连接
  SSE_TASKS: '/api/sse/tasks/[taskId]',
  
  // 文件相关
  FILES_UPLOAD: '/api/files/upload',
  FILES_HISTORY: '/api/files/history',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权访问',
  INSUFFICIENT_POINTS: '积分不足',
  FILE_TOO_LARGE: '文件过大',
  INVALID_FILE_TYPE: '不支持的文件类型',
  TASK_NOT_FOUND: '任务不存在',
  TASK_EXPIRED: '任务已过期',
  PROCESSING_FAILED: '处理失败',
  NETWORK_ERROR: '网络错误',
  SERVER_ERROR: '服务器错误',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: '文件上传成功',
  TASK_CREATED: '任务创建成功',
  PROCESSING_COMPLETE: '处理完成',
  CHECKIN_SUCCESS: '签到成功',
  REDEEM_SUCCESS: '兑换成功',
  DELETE_SUCCESS: '删除成功',
} as const;

// 积分计算规则
export const POINTS_RULES = {
  INITIAL_POINTS: 20,
  DAILY_CHECKIN: 5,
  
  // 每页/每KB的积分消费
  PDF_TO_MARKDOWN_PER_PAGE: 5,
  IMAGE_TO_MARKDOWN_PER_IMAGE: 5,
  MARKDOWN_TRANSLATION_PER_1K_CHARS: 5,
  PDF_TRANSLATION_PER_PAGE: 3,
  FORMAT_CONVERSION_PER_PAGE: 2,
} as const;

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REDEEM_CODE: /^[A-Z0-9]{8,16}$/,
  FILENAME: /^[^<>:"/\\|?*]+$/,
} as const;

// 时间相关常量
export const TIME_CONSTANTS = {
  TASK_EXPIRY_DAYS: 7,
  SSE_HEARTBEAT_INTERVAL: 30000,    // 30秒
  SSE_CONNECTION_TIMEOUT: 3600000,  // 1小时
  SSE_CLEANUP_INTERVAL: 60000,      // 1分钟
  API_TIMEOUT: 30000,               // 30秒
} as const; 