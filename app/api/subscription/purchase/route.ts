import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCasdoorProduct, getPaymentPlan, generateCasdoorBuyUrl, validateProductPurchase } from '@/lib/casdoor-products';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

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

    const { productName } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { success: false, message: 'Product name is required' },
        { status: 400 }
      );
    }

    // 获取用户当前状态
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

    // 验证商品是否可购买
    const validation = validateProductPurchase(productName, userRecord.membershipType);
    if (!validation.canPurchase) {
      return NextResponse.json(
        { success: false, message: validation.reason },
        { status: 400 }
      );
    }

    // 验证Casdoor中是否存在该商品
    const casdoorProduct = await getCasdoorProduct(productName);
    
    if (!casdoorProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found in Casdoor' },
        { status: 404 }
      );
    }

    // 获取支付计划信息
    const paymentPlan = getPaymentPlan(productName);
    if (!paymentPlan) {
      return NextResponse.json(
        { success: false, message: 'Payment plan not configured' },
        { status: 400 }
      );
    }

    // 生成购买URL
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription`;
    
    const buyUrl = generateCasdoorBuyUrl(
      productName,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      success: true,
      data: {
        buyUrl,
        product: casdoorProduct,
        plan: paymentPlan
      }
    });

  } catch (error) {
    console.error('Error in purchase API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}