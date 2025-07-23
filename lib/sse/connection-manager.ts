/**
 * SSE连接管理器
 * 负责管理所有活跃的SSE连接，支持按任务ID推送消息
 */

export interface SSEConnection {
  connectionId: string;
  userId: string;
  taskId: number;
  controller: ReadableStreamDefaultController;
  createdAt: Date;
  lastHeartbeat: Date;
}

export interface SSEMessage {
  type: string;
  taskId: number;
  data: any;
  timestamp: Date;
}

class SSEConnectionManager {
  private connections = new Map<string, SSEConnection>();

  /**
   * 注册新的SSE连接
   */
  addConnection(
    connectionId: string,
    userId: string,
    taskId: number,
    controller: ReadableStreamDefaultController
  ): void {
    const connection: SSEConnection = {
      connectionId,
      userId,
      taskId,
      controller,
      createdAt: new Date(),
      lastHeartbeat: new Date(),
    };

    this.connections.set(connectionId, connection);
    console.log(`SSE连接已注册: ${connectionId}, 用户: ${userId}, 任务: ${taskId}`);
  }

  /**
   * 移除SSE连接
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        connection.controller.close();
      } catch (error) {
        console.error(`关闭SSE连接失败: ${connectionId}`, error);
      }
      this.connections.delete(connectionId);
      console.log(`SSE连接已移除: ${connectionId}`);
    }
  }

  /**
   * 向特定任务的所有连接推送消息
   */
  pushToTask(taskId: number, message: Omit<SSEMessage, 'taskId' | 'timestamp'>): void {
    const fullMessage: SSEMessage = {
      ...message,
      taskId,
      timestamp: new Date(),
    };

    let sentCount = 0;
    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      if (connection.taskId === taskId) {
        try {
          const data = `data: ${JSON.stringify(fullMessage)}\n\n`;
          connection.controller.enqueue(new TextEncoder().encode(data));
          connection.lastHeartbeat = new Date();
          sentCount++;
          console.log(`✅ SSE消息已发送到连接 ${connectionId}: ${fullMessage.type} (任务${taskId})`);
        } catch (error) {
          console.error(`❌ 向连接 ${connectionId} 推送消息失败:`, error);
          connectionsToRemove.push(connectionId);
        }
      }
    });

    // 清理失效连接
    connectionsToRemove.forEach(id => this.removeConnection(id));

    console.log(`📤 任务 ${taskId} 消息推送完成，发送到 ${sentCount} 个连接: ${fullMessage.type}`);
  }

  /**
   * 向特定用户的所有连接推送消息
   */
  pushToUser(userId: string, message: Omit<SSEMessage, 'timestamp'>): void {
    const fullMessage: SSEMessage = {
      ...message,
      timestamp: new Date(),
    };

    let sentCount = 0;
    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        try {
          const data = `data: ${JSON.stringify(fullMessage)}\n\n`;
          connection.controller.enqueue(new TextEncoder().encode(data));
          connection.lastHeartbeat = new Date();
          sentCount++;
        } catch (error) {
          console.error(`向连接 ${connectionId} 推送消息失败:`, error);
          connectionsToRemove.push(connectionId);
        }
      }
    });

    // 清理失效连接
    connectionsToRemove.forEach(id => this.removeConnection(id));

    console.log(`用户 ${userId} 消息推送完成，发送到 ${sentCount} 个连接`);
  }

  /**
   * 发送心跳包到所有连接
   */
  sendHeartbeat(): void {
    const heartbeatMessage = {
      type: 'heartbeat',
      taskId: 0,
      data: { timestamp: new Date() },
      timestamp: new Date(),
    };

    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      try {
        const data = `data: ${JSON.stringify(heartbeatMessage)}\n\n`;
        connection.controller.enqueue(new TextEncoder().encode(data));
        connection.lastHeartbeat = new Date();
      } catch (error) {
        console.error(`向连接 ${connectionId} 发送心跳失败:`, error);
        connectionsToRemove.push(connectionId);
      }
    });

    // 清理失效连接
    connectionsToRemove.forEach(id => this.removeConnection(id));
  }

  /**
   * 清理过期连接（超过5分钟无心跳）
   */
  cleanupExpiredConnections(): void {
    const now = new Date();
    const expireThreshold = 5 * 60 * 1000; // 5分钟
    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      const timeSinceLastHeartbeat = now.getTime() - connection.lastHeartbeat.getTime();
      if (timeSinceLastHeartbeat > expireThreshold) {
        connectionsToRemove.push(connectionId);
      }
    });

    connectionsToRemove.forEach(id => this.removeConnection(id));
    
    if (connectionsToRemove.length > 0) {
      console.log(`清理了 ${connectionsToRemove.length} 个过期连接`);
    }
  }

  /**
   * 获取连接统计信息
   */
  getStats(): {
    totalConnections: number;
    connectionsByUser: Record<string, number>;
    connectionsByTask: Record<number, number>;
  } {
    const connectionsByUser: Record<string, number> = {};
    const connectionsByTask: Record<number, number> = {};

    this.connections.forEach((connection) => {
      // 按用户统计
      connectionsByUser[connection.userId] = (connectionsByUser[connection.userId] || 0) + 1;
      
      // 按任务统计
      connectionsByTask[connection.taskId] = (connectionsByTask[connection.taskId] || 0) + 1;
    });

    return {
      totalConnections: this.connections.size,
      connectionsByUser,
      connectionsByTask,
    };
  }

  /**
   * 检查特定任务是否有活跃连接
   */
  hasActiveConnectionsForTask(taskId: number): boolean {
    let hasConnection = false;
    this.connections.forEach((connection) => {
      if (connection.taskId === taskId) {
        hasConnection = true;
      }
    });
    return hasConnection;
  }
}

// 单例实例
export const sseConnectionManager = new SSEConnectionManager();

// 定期清理过期连接（每分钟执行一次）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sseConnectionManager.cleanupExpiredConnections();
  }, 60 * 1000);

  // 定期发送心跳（每30秒执行一次）
  setInterval(() => {
    sseConnectionManager.sendHeartbeat();
  }, 30 * 1000);
} 
 