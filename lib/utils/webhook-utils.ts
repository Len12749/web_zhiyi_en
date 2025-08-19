/**
 * Webhook工具函数 - 支持SSE事件驱动架构
 */

/**
 * 生成任务完成webhook URL
 * @param taskId 内部任务ID
 * @returns 完整的webhook URL
 */
export function generateWebhookUrl(taskId: number): string {
  // 在生产环境中，这应该是你的域名
  const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/webhook/task-completion?taskId=${taskId}`
}

/**
 * 验证webhook请求的安全性
 * @param request webhook请求
 * @returns 是否为有效的webhook请求
 */
export function validateWebhookRequest(request: any): boolean {
  // 可以添加签名验证、IP白名单等安全措施
  // 暂时返回true，实际使用时应该添加适当的验证
  return true
}

/**
 * 格式化webhook响应
 * @param success 是否成功
 * @param message 响应消息
 * @param data 额外数据
 * @returns 标准化的webhook响应
 */
export function formatWebhookResponse(
  success: boolean, 
  message: string, 
  data?: any
) {
  return {
    success,
    message,
    timestamp: new Date().toISOString(),
    data
  }
}