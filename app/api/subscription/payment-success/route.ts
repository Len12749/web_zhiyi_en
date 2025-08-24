import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPaymentPlan } from '@/lib/casdoor-products';
import { verifyPayPalPayment, validatePaymentAmount, logPaymentVerification } from '@/lib/paypal-verification';
import { 
  logPaymentAttempt,
  logPaymentVerified,
  logPaymentFailed,
  logDuplicatePayment,
  logAmountMismatch
} from '@/lib/payment-audit';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { pointTransactions } from '@/db/schema/point-transactions';
import { subscriptions } from '@/db/schema/subscriptions';
import { eq, and, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paymentId, token, PayerID, product } = await request.json();
    
    // 获取请求信息用于审计
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // 记录支付尝试
    logPaymentAttempt(
      user.id,
      paymentId || token || 'unknown',
      product || 'unknown',
      ipAddress,
      userAgent
    );

    console.log('Processing payment success for:', {
      userId: user.id,
      paymentId,
      token,
      PayerID,
      product
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product information is required' },
        { status: 400 }
      );
    }

    if (!paymentId && !token) {
      return NextResponse.json(
        { success: false, message: 'Payment ID or token is required' },
        { status: 400 }
      );
    }

    // 检查是否已处理过此支付
    const existingPayment = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, user.id),
          or(
            eq(subscriptions.paymentId, paymentId || ''),
            eq(subscriptions.paymentId, token || '')
          )
        )
      )
      .limit(1);

    if (existingPayment.length > 0) {
      // 记录重复支付尝试
      logDuplicatePayment(user.id, paymentId || token || '', product);
      
      return NextResponse.json(
        { success: false, message: 'Payment already processed' },
        { status: 409 }
      );
    }

    // 验证PayPal支付真实性
    const verificationResult = await verifyPayPalPayment(
      paymentId || token || '',
      token,
      PayerID
    );

    // 记录验证日志
    logPaymentVerification(user.id, paymentId || token || '', verificationResult, product);

    if (!verificationResult.isValid) {
      // 记录支付验证失败
      logPaymentFailed(
        user.id,
        paymentId || token || '',
        product,
        verificationResult.error || 'Unknown verification error',
        verificationResult
      );
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Payment verification failed: ${verificationResult.error}` 
        },
        { status: 400 }
      );
    }

    // 获取支付计划信息
    const paymentPlan = getPaymentPlan(product);
    if (!paymentPlan) {
      return NextResponse.json(
        { success: false, message: 'Invalid product' },
        { status: 400 }
      );
    }

    // 验证支付金额（如果配置了期望金额）
    if (paymentPlan.expectedAmount && verificationResult.amount) {
      const isAmountValid = validatePaymentAmount(
        verificationResult.amount,
        paymentPlan.expectedAmount,
        verificationResult.currency
      );
      
      if (!isAmountValid) {
        // 记录金额不匹配
        logAmountMismatch(
          user.id,
          paymentId || token || '',
          product,
          paymentPlan.expectedAmount,
          verificationResult.amount,
          verificationResult.currency || 'USD'
        );
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Payment amount mismatch. Expected: ${paymentPlan.expectedAmount}, Actual: ${verificationResult.amount}` 
          },
          { status: 400 }
        );
      }
    }

    // 获取当前用户信息
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // 计算新的会员状态和过期日期
    let newMembershipType = userRecord.membershipType;
    let newMembershipExpiry = userRecord.membershipExpiry;
    let pointsToAdd = 0;

    if (paymentPlan.planType === 'addon') {
      // 加量包：只添加积分，不改变会员状态
      pointsToAdd = paymentPlan.pointsAmount;
    } else {
      // 会员订阅：更新会员状态和添加积分
      newMembershipType = paymentPlan.planType;
      pointsToAdd = paymentPlan.pointsAmount;

      // 计算新的过期日期（30天一个月，365天一年）
      const now = new Date();
      const currentExpiry = userRecord.membershipExpiry ? new Date(userRecord.membershipExpiry) : now;
      
      // 如果当前会员还未过期，延长会员期；否则从现在开始计算
      const startDate = currentExpiry > now ? currentExpiry : now;
      
      const newExpiry = new Date(startDate);
      
      // 根据订阅类型计算天数
      if (paymentPlan.billingType === 'monthly') {
        // 月付：30天
        newExpiry.setDate(newExpiry.getDate() + 30);
      } else if (paymentPlan.billingType === 'yearly') {
        // 年付：360天
        newExpiry.setDate(newExpiry.getDate() + 360);
      }
      
      newMembershipExpiry = newExpiry.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    // 开始事务处理
    await db.transaction(async (tx) => {
      // 更新用户信息
      const updateData: any = {
        points: (userRecord.points || 0) + pointsToAdd,
        updatedAt: new Date()
      };

      if (paymentPlan.planType !== 'addon') {
        updateData.membershipType = newMembershipType;
        updateData.membershipExpiry = newMembershipExpiry;
      }

      await tx
        .update(users)
        .set(updateData)
        .where(eq(users.userId, user.id));

      // 记录积分交易
      if (pointsToAdd > 0) {
        await tx.insert(pointTransactions).values({
          userId: user.id,
          amount: pointsToAdd,
          transactionType: paymentPlan.planType === 'addon' ? 'ADDON_PURCHASE' : 'SUBSCRIPTION_PURCHASE',
          description: `Purchase: ${product} - ${pointsToAdd} points added`
        });
      }

      // 记录订阅历史
      const today = new Date().toISOString().split('T')[0];
      const subscriptionData: any = {
        userId: user.id,
        planType: paymentPlan.planType,
        billingType: paymentPlan.billingType,
        pointsAmount: pointsToAdd,
        casdoorProductName: product,
        paymentId: verificationResult.transactionId || paymentId || token,
        amount: verificationResult.amount ? Math.round(verificationResult.amount * 100) : 0, // 转换为美分
        currency: verificationResult.currency || 'USD',
        status: 'active',
        processedAt: new Date()
      };

      if (paymentPlan.planType !== 'addon') {
        // 计算会员时长（天数）
        const durationDays = paymentPlan.billingType === 'monthly' ? 30 : 360;
        subscriptionData.membershipDuration = durationDays;
        subscriptionData.membershipStartDate = userRecord.membershipExpiry && new Date(userRecord.membershipExpiry) > new Date() 
          ? userRecord.membershipExpiry 
          : new Date().toISOString().split('T')[0];
        subscriptionData.membershipEndDate = newMembershipExpiry;
        
        // 设置积分发放日期
        subscriptionData.lastPointsDate = today; // 今天发放了购买积分
        
        // 计算下次积分发放日期（30天后）
        const nextPoints = new Date();
        nextPoints.setDate(nextPoints.getDate() + 30);
        const nextPointsDateStr = nextPoints.toISOString().split('T')[0];
        
        // 如果下次发放日期 = 过期日期，则不设置下次发放
        if (nextPointsDateStr !== newMembershipExpiry) {
          subscriptionData.nextPointsDate = nextPointsDateStr;
        }
      }

      await tx.insert(subscriptions).values(subscriptionData);
    });

    // 记录支付验证成功
    logPaymentVerified(
      user.id,
      verificationResult.transactionId || paymentId || token || '',
      product,
      verificationResult.amount || 0,
      verificationResult.currency || 'USD',
      {
        payerEmail: verificationResult.payerEmail,
        payerId: verificationResult.payerId,
        pointsAdded: pointsToAdd
      }
    );

    // 准备返回数据
    const responseData = {
      success: true,
      message: paymentPlan.planType === 'addon' 
        ? `Successfully purchased add-on pack! ${pointsToAdd} points have been added to your account.`
        : `Welcome to ${paymentPlan.planType} membership! ${pointsToAdd} points have been added to your account.`,
      pointsAdded: pointsToAdd
    };

    // 如果是会员订阅，添加会员信息
    if (paymentPlan.planType !== 'addon') {
      (responseData as any).membership = {
        type: newMembershipType,
        expiryDate: newMembershipExpiry
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process payment' },
      { status: 500 }
    );
  }
}