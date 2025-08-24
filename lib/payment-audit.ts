/**
 * 支付安全审计模块
 * 记录所有支付相关的操作和安全事件
 */

export interface PaymentAuditLog {
  userId: string;
  paymentId: string;
  action: 'PAYMENT_ATTEMPT' | 'PAYMENT_VERIFIED' | 'PAYMENT_FAILED' | 'DUPLICATE_PAYMENT' | 'AMOUNT_MISMATCH';
  productName: string;
  amount?: number;
  currency?: string;
  ipAddress?: string;
  userAgent?: string;
  verificationDetails?: any;
  errorMessage?: string;
  timestamp: Date;
}

/**
 * 记录支付审计日志
 */
export function logPaymentAudit(log: Omit<PaymentAuditLog, 'timestamp'>): void {
  const auditLog: PaymentAuditLog = {
    ...log,
    timestamp: new Date()
  };

  // 记录到控制台（生产环境中应该记录到专门的审计日志系统）
  console.log('[PAYMENT_AUDIT]', JSON.stringify(auditLog));

  // 可以在这里添加额外的日志记录逻辑，比如：
  // - 发送到外部日志服务
  // - 记录到数据库
  // - 发送警报邮件等
}

/**
 * 记录支付尝试
 */
export function logPaymentAttempt(
  userId: string,
  paymentId: string,
  productName: string,
  ipAddress?: string,
  userAgent?: string
): void {
  logPaymentAudit({
    userId,
    paymentId,
    action: 'PAYMENT_ATTEMPT',
    productName,
    ipAddress,
    userAgent
  });
}

/**
 * 记录支付验证成功
 */
export function logPaymentVerified(
  userId: string,
  paymentId: string,
  productName: string,
  amount: number,
  currency: string,
  verificationDetails: any
): void {
  logPaymentAudit({
    userId,
    paymentId,
    action: 'PAYMENT_VERIFIED',
    productName,
    amount,
    currency,
    verificationDetails
  });
}

/**
 * 记录支付验证失败
 */
export function logPaymentFailed(
  userId: string,
  paymentId: string,
  productName: string,
  errorMessage: string,
  verificationDetails?: any
): void {
  logPaymentAudit({
    userId,
    paymentId,
    action: 'PAYMENT_FAILED',
    productName,
    errorMessage,
    verificationDetails
  });
}

/**
 * 记录重复支付尝试
 */
export function logDuplicatePayment(
  userId: string,
  paymentId: string,
  productName: string
): void {
  logPaymentAudit({
    userId,
    paymentId,
    action: 'DUPLICATE_PAYMENT',
    productName,
    errorMessage: 'Payment already processed'
  });
}

/**
 * 记录金额不匹配
 */
export function logAmountMismatch(
  userId: string,
  paymentId: string,
  productName: string,
  expectedAmount: number,
  actualAmount: number,
  currency: string
): void {
  logPaymentAudit({
    userId,
    paymentId,
    action: 'AMOUNT_MISMATCH',
    productName,
    amount: actualAmount,
    currency,
    errorMessage: `Expected: ${expectedAmount}, Actual: ${actualAmount}`
  });
}