// SSE管理器初始化文件
// 在服务器启动时自动清理所有SSE连接

import { sseConnectionManager } from './connection-manager';
import { notificationSSEManager } from './notification-manager';

// 注意：自动清理逻辑已移至启动脚本，避免模块导入时重复执行

// 导出清理函数，供手动调用
export function cleanupAllSSEConnections() {
  const taskStats = sseConnectionManager.getStats();
  const notificationStats = notificationSSEManager.getStats();
  const totalConnections = taskStats.totalConnections + notificationStats.totalConnections;
  
  sseConnectionManager.cleanup();
  notificationSSEManager.cleanup();
  
  if (totalConnections > 0) {
    console.log(`✅ 已清理 ${totalConnections} 个SSE连接`);
  } else {
    console.log('✅ SSE连接清理完成（无遗留连接）');
  }
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