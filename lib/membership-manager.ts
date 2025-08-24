import { db } from '@/db';
import { users } from '@/db/schema/users';
import { pointTransactions } from '@/db/schema/point-transactions';
import { subscriptions } from '@/db/schema/subscriptions';
import { eq, and, lte, gte, desc } from 'drizzle-orm';

// 会员类型和积分配置
export const MEMBERSHIP_POINTS: Record<string, number> = {
  'basic': 800,
  'standard': 2000,
  'premium': 10000
};

// 检查并处理过期会员
export async function processExpiredMemberships() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 查找已过期的会员
    const expiredMembers = await db
      .select()
      .from(users)
      .where(
        and(
          lte(users.membershipExpiry, today),
          eq(users.membershipType, 'basic') ||
          eq(users.membershipType, 'standard') ||
          eq(users.membershipType, 'premium')
        )
      );

    for (const user of expiredMembers) {
      // 将过期会员状态改为free
      await db
        .update(users)
        .set({
          membershipType: 'free',
          membershipExpiry: null,
          updatedAt: new Date()
        })
        .where(eq(users.userId, user.userId));

      console.log(`Membership expired for user: ${user.userId}`);
    }

    return { processed: expiredMembers.length };
  } catch (error) {
    console.error('Error processing expired memberships:', error);
    throw error;
  }
}

// 为会员发放每月积分（基于订阅记录的简单逻辑）
export async function distributeMonthlyPoints() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 查找今天需要发放积分的订阅记录
    const subscriptionsToProcess = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.nextPointsDate, today),
          eq(subscriptions.status, 'active'),
          eq(subscriptions.isActive, true)
        )
      );

    let distributedCount = 0;

    for (const subscription of subscriptionsToProcess) {
      const pointsToAdd = subscription.pointsAmount;
      const userId = subscription.userId;
      const planType = subscription.planType;
      
      // 检查用户是否还是有效会员
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);

      if (!user || !user.membershipExpiry) {
        continue;
      }

      // 检查会员是否还有效
      if (new Date(user.membershipExpiry) < new Date(today)) {
        // 会员已过期，更新订阅状态
        await db
          .update(subscriptions)
          .set({
            status: 'expired',
            isActive: false,
            nextPointsDate: null
          })
          .where(eq(subscriptions.id, subscription.id));
        continue;
      }

      // 发放积分
      await db.transaction(async (tx) => {
        // 更新用户积分
        await tx
          .update(users)
          .set({
            points: (user.points || 0) + pointsToAdd,
            updatedAt: new Date()
          })
          .where(eq(users.userId, userId));

        // 记录积分交易
        await tx.insert(pointTransactions).values({
          userId: userId,
          amount: pointsToAdd,
          transactionType: 'MONTHLY_MEMBERSHIP',
          description: `Monthly ${planType} membership points`
        });

        // 计算下次发放日期（30天后）
        const nextPoints = new Date(today);
        nextPoints.setDate(nextPoints.getDate() + 30);
        const nextPointsDateStr = nextPoints.toISOString().split('T')[0];
        
        // 如果下次发放日期 >= 过期日期，则不再设置下次发放
        const willExpireOnNextDate = nextPointsDateStr >= user.membershipExpiry;
        
        // 更新订阅记录
        await tx
          .update(subscriptions)
          .set({
            lastPointsDate: today,
            nextPointsDate: willExpireOnNextDate ? null : nextPointsDateStr
          })
          .where(eq(subscriptions.id, subscription.id));
      });

      distributedCount++;
      console.log(`Distributed ${pointsToAdd} points to user: ${userId} (${planType})`);
    }

    return { distributed: distributedCount };
  } catch (error) {
    console.error('Error distributing monthly points:', error);
    throw error;
  }
}

// 获取用户会员信息
export async function getUserMembershipInfo(userId: string) {
  try {
    const [user] = await db
      .select({
        membershipType: users.membershipType,
        membershipExpiry: users.membershipExpiry,
        points: users.points,
        hasInfinitePoints: users.hasInfinitePoints
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const isActive = user.membershipExpiry 
      ? new Date(user.membershipExpiry) >= new Date(today)
      : false;

    // 获取下次积分发放日期
    let nextPointsDate = null;
    if (isActive) {
      const [activeSubscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, 'active'),
            eq(subscriptions.isActive, true)
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      
      nextPointsDate = activeSubscription?.nextPointsDate || null;
    }

    return {
      membershipType: isActive ? user.membershipType : 'free',
      membershipExpiry: user.membershipExpiry,
      isActive,
      points: user.points || 0,
      hasInfinitePoints: user.hasInfinitePoints || false,
      nextPointsDate
    };
  } catch (error) {
    console.error('Error getting user membership info:', error);
    throw error;
  }
}



// 验证会员权限
export function validateMembershipAccess(
  membershipType: string | null,
  requiredMembership: string[] = []
): boolean {
  if (!membershipType || membershipType === 'free') {
    return requiredMembership.length === 0;
  }

  return requiredMembership.includes(membershipType);
}