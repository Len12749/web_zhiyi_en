// 任务状态SSE连接管理器 - 完全按照通知SSE的简单机制
class TaskSSEManager {
  private connections = new Map<string, {
    userId: string;
    taskId: number;
    controller: ReadableStreamDefaultController<Uint8Array>;
    connectionId: string;
  }>();

  // 添加连接
  addConnection(connectionId: string, userId: string, taskId: number, controller: ReadableStreamDefaultController<Uint8Array>) {
    this.connections.set(connectionId, {
      userId,
      taskId,
      controller,
      connectionId
    });
    
    console.log(`🔗 任务SSE连接已建立 [用户: ${userId}] [任务: ${taskId}] [连接ID: ${connectionId}]`);
    console.log(`📊 当前活跃任务连接数: ${this.connections.size}`);
  }

  // 移除连接
  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      console.log(`🔐 任务SSE连接已移除 [用户: ${connection.userId}] [任务: ${connection.taskId}] [连接ID: ${connectionId}]`);
      console.log(`📊 当前活跃任务连接数: ${this.connections.size}`);
    }
  }

  // 推送状态更新给特定任务
  pushToTask(taskId: number, statusUpdate: {
    type: string;
    data: any;
  }) {
    const taskConnections = Array.from(this.connections.values())
      .filter(conn => conn.taskId === taskId);

    if (taskConnections.length === 0) {
      console.log(`⚠️  任务 ${taskId} 没有活跃的SSE连接`);
      return;
    }

    const message = {
      type: statusUpdate.type,
      data: statusUpdate.data
    };

    const data = `data: ${JSON.stringify(message)}\n\n`;
    const encodedData = new TextEncoder().encode(data);

    taskConnections.forEach(conn => {
      try {
        conn.controller.enqueue(encodedData);
        console.log(`📤 状态已推送给任务 ${taskId} [连接ID: ${conn.connectionId}]: ${statusUpdate.type}`);
      } catch (error) {
        console.error(`❌ 推送状态失败 [连接ID: ${conn.connectionId}]:`, error);
        // 移除失效的连接
        this.removeConnection(conn.connectionId);
      }
    });
  }

  // 发送心跳消息保持连接活跃
  sendHeartbeat(taskId: number) {
    const heartbeatMessage = {
      type: 'heartbeat',
      data: {
        timestamp: new Date().toISOString(),
        taskId: taskId
      }
    };
    this.pushToTask(taskId, heartbeatMessage);
  }

  // 清理所有连接
  cleanup() {
    const connectionCount = this.connections.size;
    this.connections.clear();
    console.log(`🧹 所有任务SSE连接已清理，共清理 ${connectionCount} 个连接`);
  }

  // 获取连接统计信息
  getStats() {
    return {
      totalConnections: this.connections.size,
      connectionsByTask: Array.from(this.connections.values()).reduce((acc, conn) => {
        acc[conn.taskId] = (acc[conn.taskId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };
  }
}

// 导出单例实例
export const sseConnectionManager = new TaskSSEManager();

// 生成随机字符串 - 和通知SSE完全一样
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
  console.log('🚀 服务器启动，清理所有SSE连接...');
  sseConnectionManager.cleanup();
}
 