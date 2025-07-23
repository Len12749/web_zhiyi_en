import { pgTable, serial, integer, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { redeemCodes } from './redeem-codes';
import { users } from './users';
import { pointTransactions } from './point-transactions';

export const codeRedemptions = pgTable('code_redemptions', {
  id: serial('id').primaryKey(),
  codeId: integer('code_id').notNull().references(() => redeemCodes.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  pointsEarned: integer('points_earned').notNull(),
  transactionId: integer('transaction_id').references(() => pointTransactions.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  unq: unique().on(table.codeId, table.userId),
})); 
 