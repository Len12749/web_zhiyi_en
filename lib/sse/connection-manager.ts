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
        // 检查控制器状态，避免重复关闭
        if (connection.controller.desiredSize !== null) {
          connection.controller.close();
        }
      } catch (error) {
        // 忽略已关闭连接的错误，但记录其他错误
        if (error.code !== 'ERR_INVALID_STATE') {
          console.error(`关闭SSE连接失败: ${connectionId}`, error);
        }
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
    const taskConnections: string[] = []; // 收集该任务的所有连接

    this.connections.forEach((connection, connectionId) => {
      if (connection.taskId === taskId) {
        taskConnections.push(connectionId); // 记录任务连接
        
        try {
          // 检查控制器状态
          if (connection.controller.desiredSize === null) {
            connectionsToRemove.push(connectionId);
            return;
          }

          const data = `data: ${JSON.stringify(fullMessage)}\n\n`;
          connection.controller.enqueue(new TextEncoder().encode(data));
          connection.lastHeartbeat = new Date();
          sentCount++;
        } catch (error) {
          connectionsToRemove.push(connectionId);
        }
      }
    });

    // 清理失效连接
    connectionsToRemove.forEach(id => this.removeConnection(id));

    // 如果任务完成或失败，关闭该任务的所有连接
    if (message.type === 'status_update' && message.data) {
      const status = message.data.status;
      if (status === 'completed' || status === 'failed') {
        // 延迟关闭连接，确保消息已发送
        setTimeout(() => {
          taskConnections.forEach(connectionId => {
            if (this.connections.has(connectionId)) {
              this.removeConnection(connectionId);
            }
          });
        }, 100);
      }
    }

    // 简化日志：只在有连接时记录
    if (sentCount > 0) {
      console.log(`📤 任务 ${taskId} 推送到 ${sentCount} 个连接: ${fullMessage.type}`);
    }
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
}

// 单例实例
export const sseConnectionManager = new SSEConnectionManager();

// 定期清理过期连接（每分钟执行一次）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sseConnectionManager.cleanupExpiredConnections();
  }, 60 * 1000);
} 
 