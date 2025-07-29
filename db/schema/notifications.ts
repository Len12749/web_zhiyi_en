import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { processingTasks } from './processing-tasks';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  taskId: varchar('task_id', { length: 255 }), // 存储字符串格式的taskId，不设置外键约束
  
  // 通知内容
  type: varchar('type', { length: 20 }).notNull(), // success, warning, info, error
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // 时间 - 通知将保留30天后自动清理
  createdAt: timestamp('created_at').defaultNow(),
}); 