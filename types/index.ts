import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { 
  users, 
  processingTasks, 
  pointTransactions, 
  userCheckins, 
  redeemCodes, 
  codeRedemptions 
} from '../db/schema';

// 数据库模型类型
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type ProcessingTask = InferSelectModel<typeof processingTasks>;
export type NewProcessingTask = InferInsertModel<typeof processingTasks>;

export type PointTransaction = InferSelectModel<typeof pointTransactions>;
export type NewPointTransaction = InferInsertModel<typeof pointTransactions>;

export type UserCheckin = InferSelectModel<typeof userCheckins>;
export type NewUserCheckin = InferInsertModel<typeof userCheckins>;

export type RedeemCode = InferSelectModel<typeof redeemCodes>;
export type NewRedeemCode = InferInsertModel<typeof redeemCodes>;

export type CodeRedemption = InferSelectModel<typeof codeRedemptions>;
export type NewCodeRedemption = InferInsertModel<typeof codeRedemptions>;

// 任务相关类型
export type TaskType = 
  | 'pdf-to-markdown'
  | 'image-to-markdown'
  | 'markdown-translation'
  | 'pdf-translation'
  | 'format-conversion';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TransactionType = 
  | 'INITIAL'        // 注册初始积分
  | 'CHECKIN'        // 签到获得
  | 'REDEEM'         // 兑换码获得
  | 'CONSUME'        // 任务消费
  | 'REFUND'         // 任务失败返还
  | 'ADMIN_ADJUST';  // 管理员调整

// 处理参数类型
export interface PDFToMarkdownParams {
  tableMode: 'markdown' | 'image';
  enableTranslation?: boolean;
  targetLanguage?: string;
  outputOptions?: ('original' | 'translated' | 'bilingual')[];
}

export interface ImageToMarkdownParams {
  // 图片处理相关参数
}

export interface MarkdownTranslationParams {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface PDFTranslationParams {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface FormatConversionParams {
  targetFormat: 'word' | 'html' | 'pdf' | 'latex';
}

// SSE 事件类型
export interface SSEEvent {
  type: 'status_update' | 'progress_update' | 'task_completed' | 'task_failed' | 'heartbeat';
  taskId: number;
  data?: any;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 文件上传类型
export interface FileUploadResult {
  taskId: number;
  sseUrl: string;
  estimatedPoints: number;
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt', name: 'Português' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']; 