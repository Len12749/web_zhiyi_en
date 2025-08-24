/**
 * PayPal支付验证模块
 * 用于验证PayPal支付的真实性，防止用户通过伪造URL获得奖励
 */

interface PayPalPaymentDetails {
  id: string;
  intent: string;
  state: string;
  cart?: string;
  payer: {
    payment_method: string;
    status: string;
    payer_info: {
      email: string;
      first_name: string;
      last_name: string;
      payer_id: string;
      shipping_address?: any;
      country_code: string;
    };
  };
  transactions: Array<{
    amount: {
      total: string;
      currency: string;
      details: {
        subtotal: string;
        tax?: string;
        shipping?: string;
        handling_fee?: string;
        shipping_discount?: string;
        insurance?: string;
      };
    };
    payee?: {
      merchant_id: string;
      email?: string;
    };
    description?: string;
    custom?: string;
    invoice_number?: string;
    payment_options?: {
      allowed_payment_method: string;
    };
    soft_descriptor?: string;
    item_list?: {
      items: Array<{
        name: string;
        sku?: string;
        price: string;
        currency: string;
        quantity: string;
      }>;
      shipping_address?: any;
    };
    related_resources: Array<{
      sale?: {
        id: string;
        state: string;
        amount: {
          total: string;
          currency: string;
        };
        payment_mode: string;
        protection_eligibility: string;
        protection_eligibility_type?: string;
        transaction_fee: {
          value: string;
          currency: string;
        };
        parent_payment: string;
        create_time: string;
        update_time: string;
        links: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
      };
    }>;
  }>;
  state_history?: Array<{
    state: string;
    create_time: string;
  }>;
  create_time: string;
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalVerificationResult {
  isValid: boolean;
  paymentDetails?: PayPalPaymentDetails;
  amount?: number;
  currency?: string;
  payerEmail?: string;
  payerId?: string;
  transactionId?: string;
  error?: string;
}

/**
 * 获取PayPal访问令牌
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const sandbox = process.env.PAYPAL_SANDBOX === 'true';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const baseUrl = sandbox 
    ? 'https://api.sandbox.paypal.com' 
    : 'https://api.paypal.com';

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 验证PayPal支付
 */
export async function verifyPayPalPayment(
  paymentId: string,
  token?: string,
  payerId?: string
): Promise<PayPalVerificationResult> {
  try {
    if (!paymentId) {
      return {
        isValid: false,
        error: 'Payment ID is required'
      };
    }

    // 获取访问令牌
    const accessToken = await getPayPalAccessToken();
    const sandbox = process.env.PAYPAL_SANDBOX === 'true';
    const baseUrl = sandbox 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';

    // 查询支付详情
    const response = await fetch(`${baseUrl}/v1/payments/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          isValid: false,
          error: 'Payment not found'
        };
      }
      throw new Error(`PayPal API error: ${response.statusText}`);
    }

    const paymentDetails: PayPalPaymentDetails = await response.json();

    // 验证支付状态
    if (paymentDetails.state !== 'approved') {
      return {
        isValid: false,
        error: `Payment state is ${paymentDetails.state}, expected approved`
      };
    }

    // 验证PayerID（如果提供）
    if (payerId && paymentDetails.payer.payer_info.payer_id !== payerId) {
      return {
        isValid: false,
        error: 'PayerID mismatch'
      };
    }

    // 提取交易信息
    const transaction = paymentDetails.transactions[0];
    const sale = transaction.related_resources.find(r => r.sale)?.sale;

    if (!sale || sale.state !== 'completed') {
      return {
        isValid: false,
        error: 'Transaction not completed'
      };
    }

    return {
      isValid: true,
      paymentDetails,
      amount: parseFloat(transaction.amount.total),
      currency: transaction.amount.currency,
      payerEmail: paymentDetails.payer.payer_info.email,
      payerId: paymentDetails.payer.payer_info.payer_id,
      transactionId: sale.id
    };

  } catch (error) {
    console.error('PayPal verification error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
}

/**
 * 验证支付金额是否与预期一致
 */
export function validatePaymentAmount(
  actualAmount: number,
  expectedAmount: number,
  currency: string = 'USD',
  tolerance: number = 0.01
): boolean {
  if (currency !== 'USD') {
    console.warn(`Unexpected currency: ${currency}, expected USD`);
  }
  
  return Math.abs(actualAmount - expectedAmount) <= tolerance;
}

/**
 * 记录支付验证日志
 */
export function logPaymentVerification(
  userId: string,
  paymentId: string,
  result: PayPalVerificationResult,
  productName: string
): void {
  console.log(`[PayPal Verification] User: ${userId}, Payment: ${paymentId}, Product: ${productName}`, {
    isValid: result.isValid,
    amount: result.amount,
    currency: result.currency,
    payerEmail: result.payerEmail,
    payerId: result.payerId,
    transactionId: result.transactionId,
    error: result.error,
    timestamp: new Date().toISOString()
  });
}