# 智译平台Typescript类型定义types文档

## 概述

本文档详细介绍了智译平台的 TypeScript 类型定义系统。类型定义集中在 `types` 目录下，为整个应用程序提供类型安全保障，确保代码质量和开发效率。

## 核心类型定义结构

智译平台的类型定义主要分为以下几个核心部分：

1. 数据库模型类型
2. 业务逻辑类型
3. API 交互类型
4. 多语言支持类型

## 数据库模型类型

数据库模型类型基于 Drizzle ORM，通过 `InferSelectModel` 和 `InferInsertModel` 工具类型从数据库模式定义中推导出 TypeScript 类型。

```typescript
// 用户相关
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// 任务处理相关
export type ProcessingTask = InferSelectModel<typeof processingTasks>;
export type NewProcessingTask = InferInsertModel<typeof processingTasks>;

// 积分系统相关
export type PointTransaction = InferSelectModel<typeof pointTransactions>;
export type NewPointTransaction = InferInsertModel<typeof pointTransactions>;
```

这些类型确保了数据库操作的类型安全，减少了运行时错误的可能性。

## 业务逻辑类型

### 任务类型

```typescript
export type TaskType = 
  | 'pdf-to-markdown'
  | 'image-to-markdown'
  | 'markdown-translation'
  | 'pdf-translation'
  | 'format-conversion';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

这些类型定义了平台支持的文档处理任务类型和任务状态，用于任务创建、处理和状态跟踪。

### 积分交易类型

```typescript
export type TransactionType = 
  | 'INITIAL'        // 注册初始积分
  | 'CHECKIN'        // 签到获得
  | 'REDEEM'         // 兑换码获得
  | 'CONSUME'        // 任务消费
  | 'REFUND'         // 任务失败返还
  | 'ADMIN_ADJUST';  // 管理员调整
```

这些类型定义了积分系统中的交易类型，用于积分获取和消费的记录和管理。

## 处理参数类型

每种任务类型都有对应的处理参数接口：

### PDF 转 Markdown 参数

```typescript
export interface PDFToMarkdownParams {
  tableMode: 'markdown' | 'image';
  enableTranslation?: boolean;
  targetLanguage?: string;
  outputOptions?: ('original' | 'translated' | 'bilingual')[];
}
```

### 图片转 Markdown 参数

```typescript
export interface ImageToMarkdownParams {
  // 图片处理相关参数
}
```

### Markdown 翻译参数

```typescript
export interface MarkdownTranslationParams {
  sourceLanguage: string;
  targetLanguage: string;
}
```

### PDF 翻译参数

```typescript
export interface PDFTranslationParams {
  sourceLanguage: string;
  targetLanguage: string;
}
```

### 格式转换参数

```typescript
export interface FormatConversionParams {
  targetFormat: 'word' | 'html' | 'pdf' | 'latex';
}
```

## API 交互类型

### SSE 事件类型

用于服务器发送事件（Server-Sent Events）的类型定义：

```typescript
export interface SSEEvent {
  type: 'status_update' | 'progress_update' | 'task_completed' | 'task_failed' | 'heartbeat';
  taskId: number;
  data?: any;
}
```

### API 响应类型

统一的 API 响应格式：

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 文件上传结果类型

```typescript
export interface FileUploadResult {
  taskId: number;
  sseUrl: string;
  estimatedPoints: number;
}
```

## 多语言支持

智译平台支持多种语言的处理和翻译：

```typescript
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
```

