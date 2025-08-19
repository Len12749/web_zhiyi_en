import { pgTable, serial, varchar, integer, boolean, timestamp, bigint, text, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const processingTasks = pgTable('processing_tasks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  
  // 任务信息
  taskType: varchar('task_type', { length: 50 }).notNull(), // pdf_to_markdown, translation, etc.
  taskStatus: varchar('task_status', { length: 20 }).default('pending').notNull(), // pending, processing, completed, failed

  statusMessage: text('status_message'),
  
  // 输入文件
  inputFilename: varchar('input_filename', { length: 255 }).notNull(),
  inputFileSize: bigint('input_file_size', { mode: 'number' }).notNull(),
  inputStoragePath: varchar('input_storage_path', { length: 500 }).notNull(), // 外部存储路径
  
  // 处理参数
  processingParams: jsonb('processing_params').default({}),
  
  // 外部服务
  externalTaskId: varchar('external_task_id', { length: 255 }),
  
  // 积分
  requiredPoints: integer('required_points').default(0), // 任务所需积分
  hasBeenDownloaded: boolean('has_been_downloaded').default(false), // 是否已经下载过
  
  // 结果
  resultStoragePath: varchar('result_storage_path', { length: 500 }),
  resultFileSize: bigint('result_file_size', { mode: 'number' }),
  resultFilename: varchar('result_filename', { length: 255 }), // 供下载的文件名
  
  // 错误处理
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  
  // 时间管理
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at').defaultNow(), // 默认7天后过期
}); 
 