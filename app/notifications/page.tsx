"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Check,
  Clock
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
  isRead: boolean;
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);

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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('标记所有已读失败:', error);
    }
  };

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
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBatchDelete = async () => {
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

  const handleBatchMarkAsRead = async () => {
    try {
      // 批量标记已读，通过单独调用每个通知的API
      await Promise.all(
        selectedNotifications.map(id => 
          fetch(`/api/notifications/${id}`, { method: 'PATCH' })
        )
      );
      
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('批量标记已读失败:', error);
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
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
                {/* 过滤器 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    全部 ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'unread' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    未读 ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'read' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    已读 ({notifications.length - unreadCount})
                  </button>
                </div>

                {/* 批量操作 */}
                {selectedNotifications.length > 0 && (
                  <div className="flex gap-2">
                    <Button onClick={handleBatchMarkAsRead} variant="outline" size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      标记已读 ({selectedNotifications.length})
                    </Button>
                    <Button onClick={handleBatchDelete} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除 ({selectedNotifications.length})
                    </Button>
                  </div>
                )}
              </div>

              {/* 全部操作 */}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    全部已读
                  </Button>
                )}
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">全选</span>
              </div>
            </div>
          </motion.div>

          {/* 通知列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredNotifications.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {filter === 'unread' ? '暂无未读通知' : filter === 'read' ? '暂无已读通知' : '暂无通知'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'unread' ? '所有通知都已阅读' : '当系统有重要更新或任务状态变化时，我们会及时通知您'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const Icon = notificationIcons[notification.type];
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border transition-all duration-200 ${
                      notification.isRead 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* 选择框 */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                      />

                      {/* 图标 */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
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

                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="标记已读"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
            </ul>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
} 