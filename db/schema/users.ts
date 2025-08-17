import { pgTable, serial, varchar, integer, boolean, timestamp, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  points: integer('points').default(100).notNull(),
  hasInfinitePoints: boolean('has_infinite_points').default(false),
  membershipType: varchar('membership_type', { length: 50 }).default('free'),
  membershipExpiry: date('membership_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 
 