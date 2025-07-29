"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Clock,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/common/auth-guard';

// 通知类型
type NotificationType = 'success' | 'warning' | 'info' | 'error';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  taskId?: string;
}

const notificationIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
  error: AlertCircle
};

const notificationColors = {
  success: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  error: 'text-red-600 bg-red-100 dark:bg-red-900/20'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 获取通知
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.notifications || []);
        }
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        setSelectedNotifications(prev => 
          prev.filter(id => id !== notificationId)
        );
      }
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedNotifications.length} 条通知吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'deleteMultiple', 
          notificationIds: selectedNotifications 
        }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => !selectedNotifications.includes(notification.id))
        );
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    if (isBatchMode) {
      setSelectedNotifications([]);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载通知中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              通知中心
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看系统通知和任务处理状态更新
            </p>
          </motion.div>

          {/* 操作栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* 批量管理按钮 */}
                <Button 
                  onClick={toggleBatchMode}
                  variant={isBatchMode ? "default" : "outline"}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isBatchMode ? '退出批量管理' : '批量管理'}
                </Button>

                {/* 批量操作 */}
                {isBatchMode && selectedNotifications.length > 0 && (
                  <div className="flex gap-2">
                    <Button onClick={handleBatchDelete} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除 ({selectedNotifications.length})
                    </Button>
                  </div>
                )}
              </div>

              {/* 全选操作 */}
              {isBatchMode && (
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">全选</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* 通知列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {notifications.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  暂无通知
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  当系统有重要更新或任务状态变化时，我们会及时通知您
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const Icon = notificationIcons[notification.type];
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      {/* 选择框 - 只在批量管理模式下显示 */}
                      {isBatchMode && (
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                        />
                      )}

                      {/* 图标 */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(notification.createdAt)}
                              {notification.taskId && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                  任务 #{notification.taskId}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 操作按钮 - 只在非批量管理模式下显示 */}
                          {!isBatchMode && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* 设置说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
          >
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              通知设置
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• 任务完成、失败或需要您关注时会发送通知</li>
              <li>• 重要的系统公告和维护信息也会通过通知发送</li>
              <li>• 通知将保留30天，您可以随时删除不需要的通知</li>
              <li>• 使用批量管理功能可以高效管理多条通知</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
} 