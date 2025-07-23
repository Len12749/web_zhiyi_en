import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { processingTasks } from './processing-tasks';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => processingTasks.id, { onDelete: 'set null' }),
  
  // 通知内容
  type: varchar('type', { length: 20 }).notNull(), // success, warning, info, error
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // 状态
  isRead: boolean('is_read').default(false).notNull(),
  
  // 时间
  createdAt: timestamp('created_at').defaultNow(),
}); 