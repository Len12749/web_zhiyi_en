import { pgTable, serial, varchar, integer, timestamp, date, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

// 订阅历史记录表
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.userId, { onDelete: 'cascade' }),
  
  // 订阅信息
  planType: varchar('plan_type', { length: 50 }).notNull(), // basic, standard, premium, addon
  billingType: varchar('billing_type', { length: 20 }).notNull(), // monthly, yearly, one-time
  pointsAmount: integer('points_amount').notNull(), // 获得的积分数
  
  // 会员相关（仅适用于非addon订阅）
  membershipDuration: integer('membership_duration'), // 会员时长（月）
  membershipStartDate: date('membership_start_date'), // 会员开始日期
  membershipEndDate: date('membership_end_date'), // 会员结束日期
  
  // 支付信息
  casdoorProductName: varchar('casdoor_product_name', { length: 100 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }), // PayPal支付ID
  amount: integer('amount').notNull(), // 支付金额（美分）
  currency: varchar('currency', { length: 10 }).default('USD'),
  
  // 积分发放
  nextPointsDate: date('next_points_date'), // 下次积分发放日期
  lastPointsDate: date('last_points_date'), // 上次积分发放日期
  
  // 状态
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, expired, cancelled
  isActive: boolean('is_active').default(true),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'), // 处理时间
});