"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/use-notifications';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

export default function GlobalNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { notifications: dbNotifications, markAsRead } = useNotifications();

  // 监听数据库通知更新
  useEffect(() => {
    if (dbNotifications && dbNotifications.length > 0) {
      // 获取最新的未读通知
      const latestUnread = dbNotifications
        .filter(n => !n.isRead)
        .slice(0, 1); // 只显示最新的一条

      if (latestUnread.length > 0) {
        const notification = latestUnread[0];
        const notificationItem: NotificationItem = {
          id: notification.id.toString(),
          type: getNotificationType(notification.type),
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.createdAt),
          autoClose: true,
          duration: 5000, // 5秒后自动消失
        };

        // 避免重复添加相同通知
        setNotifications(prev => {
          const exists = prev.some(n => n.id === notificationItem.id);
          if (!exists) {
            return [notificationItem, ...prev.slice(0, 2)]; // 最多显示3个通知
          }
          return prev;
        });

        // 标记为已读
        markAsRead(notification.id);
      }
    }
  }, [dbNotifications, markAsRead]);

  // 定期刷新通知（更频繁）
  useEffect(() => {
    const interval = setInterval(() => {
      // 刷新通知数据
      const event = new CustomEvent('refreshNotifications');
      window.dispatchEvent(event);
    }, 10000); // 每10秒刷新一次

    return () => clearInterval(interval);
  }, []);

  // 自动关闭通知
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationType = (type: string): NotificationItem['type'] => {
    switch (type) {
      case 'task_completed':
        return 'success';
      case 'task_failed':
        return 'error';
      case 'points_awarded':
        return 'success';
      case 'points_deducted':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.3
            }}
            className={`
              relative w-full rounded-lg border p-4 shadow-lg backdrop-blur-sm
              ${getBackgroundColor(notification.type)}
            `}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            {/* 通知内容 */}
            <div className="flex items-start space-x-3 pr-6">
              {/* 图标 */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>

              {/* 文本内容 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
            </div>

            {/* 自动关闭进度条 */}
            {notification.autoClose && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ 
                  duration: (notification.duration || 5000) / 1000,
                  ease: "linear"
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 