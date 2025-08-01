// SSE管理器初始化文件
// 在服务器启动时自动清理所有SSE连接

import { sseConnectionManager } from './connection-manager';
import { notificationSSEManager } from './notification-manager';

// 服务器启动时自动清理所有SSE连接
if (typeof window === 'undefined') {
  // 只在服务器端执行
  console.log('🚀 服务器启动，开始清理所有SSE连接...');
  
  // 清理任务SSE连接
  sseConnectionManager.cleanup();
  
  // 清理通知SSE连接
  notificationSSEManager.cleanup();
  
  console.log('✅ 所有SSE连接清理完成');
}

// 导出清理函数，供手动调用
export function cleanupAllSSEConnections() {
  console.log('🧹 手动清理所有SSE连接...');
  
  const taskStats = sseConnectionManager.getStats();
  const notificationStats = notificationSSEManager.getStats();
  
  sseConnectionManager.cleanup();
  notificationSSEManager.cleanup();
  
  console.log('📊 清理前统计:');
  console.log(`  - 任务SSE连接: ${taskStats.totalConnections} 个`);
  console.log(`  - 通知SSE连接: ${notificationStats.totalConnections} 个`);
  console.log('✅ 所有SSE连接已清理完成');
}

// 导出获取统计信息的函数
export function getSSEStats() {
  const taskStats = sseConnectionManager.getStats();
  const notificationStats = notificationSSEManager.getStats();
  
  return {
    taskConnections: taskStats,
    notificationConnections: notificationStats,
    total: taskStats.totalConnections + notificationStats.totalConnections
  };
} 