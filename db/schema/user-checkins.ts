import { pgTable, serial, varchar, integer, date, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userCheckins = pgTable('user_checkins', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.clerkId, { onDelete: 'cascade' }),
  checkinDate: date('checkin_date').notNull(),
  pointsEarned: integer('points_earned').default(5),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  unq: unique().on(table.userId, table.checkinDate),
})); 
 