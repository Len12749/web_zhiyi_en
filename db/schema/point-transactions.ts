import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { processingTasks } from './processing-tasks';

export const pointTransactions = pgTable('point_transactions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => processingTasks.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}); 