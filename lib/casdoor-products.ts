import { casdoorConfig } from './casdoor';

// Casdoor商品信息类型定义
export interface CasdoorProduct {
  name: string;
  displayName: string;
  detail: string;
  tag: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  state: string;
  providerName: string;
  returnUrl: string;
  organization: string;
  createdTime: string;
  updatedTime: string;
}

// 支付类型映射
export interface PaymentPlan {
  casdoorProductName: string;  // Casdoor中的商品名称
  planType: 'basic' | 'standard' | 'premium' | 'addon';
  billingType: 'monthly' | 'yearly' | 'one-time';
  pointsAmount: number;        // 每月/一次性获得的积分
  expectedAmount?: number;     // 期望的支付金额（用于验证）
}

// 产品映射配置 - 根据您在Casdoor中创建的商品名称
export const PRODUCT_MAPPING: PaymentPlan[] = [
  {
    casdoorProductName: 'Basic-month',
    planType: 'basic',
    billingType: 'monthly',
    pointsAmount: 800,
    expectedAmount: 5.00
  },
  {
    casdoorProductName: 'Basic-year',
    planType: 'basic',
    billingType: 'yearly',
    pointsAmount: 800,
    expectedAmount: 50.00
  },
  {
    casdoorProductName: 'Standard-month',
    planType: 'standard',
    billingType: 'monthly',
    pointsAmount: 2000,
    expectedAmount: 10.00
  },
  {
    casdoorProductName: 'Standard-year',
    planType: 'standard',
    billingType: 'yearly',
    pointsAmount: 2000,
    expectedAmount: 100.00
  },
  {
    casdoorProductName: 'Premium-month',
    planType: 'premium',
    billingType: 'monthly',
    pointsAmount: 10000,
    expectedAmount: 30.00
  },
  {
    casdoorProductName: 'Premium-year',
    planType: 'premium',
    billingType: 'yearly',
    pointsAmount: 10000,
    expectedAmount: 300.00
  },
  {
    casdoorProductName: 'Add-on Pack (Members Only)',
    planType: 'addon',
    billingType: 'one-time',
    pointsAmount: 2000,
    expectedAmount: 10.00
  }
];

// 获取Casdoor商品列表
export async function getCasdoorProducts(): Promise<CasdoorProduct[]> {
  try {
    const response = await fetch(
      `${casdoorConfig.endpoint}/api/get-products?organization=${casdoorConfig.organization}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Casdoor products:', error);
    throw error;
  }
}

// 根据商品名称获取商品信息
export async function getCasdoorProduct(productName: string): Promise<CasdoorProduct | null> {
  try {
    const response = await fetch(
      `${casdoorConfig.endpoint}/api/get-product?id=${casdoorConfig.organization}/${productName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error(`Error fetching Casdoor product ${productName}:`, error);
    throw error;
  }
}

// 获取支付计划信息
export function getPaymentPlan(productName: string): PaymentPlan | null {
  return PRODUCT_MAPPING.find(plan => plan.casdoorProductName === productName) || null;
}

// 生成Casdoor购买URL  
export function generateCasdoorBuyUrl(
  productName: string,
  successUrl?: string,
  cancelUrl?: string
): string {
  const params = new URLSearchParams({
    organization: casdoorConfig.organization,
    product: productName,
    currency: 'USD',
    provider: 'PayPal', // 假设您在Casdoor中配置的支付提供商名称
  });

  if (successUrl) {
    params.append('returnUrl', successUrl);
  }
  if (cancelUrl) {
    params.append('cancelUrl', cancelUrl);
  }

  // 不再传递user参数，让Casdoor使用当前登录用户
  return `${casdoorConfig.endpoint}/products/${casdoorConfig.organization}/${productName}/buy?${params.toString()}`;
}

// 验证商品是否可购买
export function validateProductPurchase(
  productName: string,
  userMembershipType: string | null
): { canPurchase: boolean; reason?: string } {
  const plan = getPaymentPlan(productName);
  
  if (!plan) {
    return { canPurchase: false, reason: 'Product not found' };
  }

  // 检查加量包购买权限
  if (plan.planType === 'addon') {
    if (!userMembershipType || userMembershipType === 'free') {
      return { 
        canPurchase: false, 
        reason: 'Add-on pack is only available for active members' 
      };
    }
  }

  return { canPurchase: true };
}