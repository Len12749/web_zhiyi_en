// 通知SSE连接管理器
class NotificationSSEManager {
  private connections = new Map<string, {
    userId: string;
    controller: ReadableStreamDefaultController<Uint8Array>;
    connectionId: string;
  }>();

  // 添加连接
  addConnection(connectionId: string, userId: string, controller: ReadableStreamDefaultController<Uint8Array>) {
    this.connections.set(connectionId, {
      userId,
      controller,
      connectionId
    });
    
    console.log(`🔗 通知SSE连接已建立 [用户: ${userId}] [连接ID: ${connectionId}]`);
    console.log(`📊 当前活跃通知连接数: ${this.connections.size}`);
  }

  // 移除连接
  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      console.log(`🔐 通知SSE连接已移除 [用户: ${connection.userId}] [连接ID: ${connectionId}]`);
      console.log(`📊 当前活跃通知连接数: ${this.connections.size}`);
    }
  }

  // 推送通知给特定用户
  pushNotificationToUser(userId: string, notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    taskId?: string;
    createdAt: string;
  }) {
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId);

    if (userConnections.length === 0) {
      console.log(`⚠️  用户 ${userId} 没有活跃的通知SSE连接`);
      return;
    }

    const message = {
      type: "new_notification",
      data: notification
    };

    const data = `data: ${JSON.stringify(message)}\n\n`;
    const encodedData = new TextEncoder().encode(data);

    userConnections.forEach(conn => {
      try {
        conn.controller.enqueue(encodedData);
        console.log(`📤 通知已推送给用户 ${userId} [连接ID: ${conn.connectionId}]: ${notification.title}`);
      } catch (error) {
        console.error(`❌ 推送通知失败 [连接ID: ${conn.connectionId}]:`, error);
        // 移除失效的连接
        this.removeConnection(conn.connectionId);
      }
    });
  }

  // 获取用户连接数
  getUserConnectionCount(userId: string): number {
    return Array.from(this.connections.values())
      .filter(conn => conn.userId === userId).length;
  }

  // 清理所有连接
  cleanup() {
    const connectionCount = this.connections.size;
    this.connections.clear();
    console.log(`🧹 所有通知SSE连接已清理，共清理 ${connectionCount} 个连接`);
  }

  // 获取连接统计信息
  getStats() {
    return {
      totalConnections: this.connections.size,
      connectionsByUser: Array.from(this.connections.values()).reduce((acc, conn) => {
        acc[conn.userId] = (acc[conn.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// 导出单例实例
export const notificationSSEManager = new NotificationSSEManager();

// 生成随机字符串
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 服务器启动时自动清理所有SSE连接
if (typeof window === 'undefined') {
  // 只在服务器端执行
  console.log('🚀 服务器启动，清理所有通知SSE连接...');
  notificationSSEManager.cleanup();
}