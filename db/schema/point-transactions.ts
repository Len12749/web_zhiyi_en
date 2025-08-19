import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { processingTasks } from './processing-tasks';
import { redeemCodes } from './redeem-codes';

export const pointTransactions = pgTable('point_transactions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => processingTasks.id, { onDelete: 'set null' }),
  redeemCodeId: integer('redeem_code_id').references(() => redeemCodes.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(), // TASK_COST, CHECKIN, REDEEM, REFUND等
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}); 
 