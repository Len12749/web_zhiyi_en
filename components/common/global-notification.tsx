"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

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
  const { isSignedIn } = useUser();
  const eventSourceRef = useRef<EventSource | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  // SSE连接管理
  useEffect(() => {
    if (!isSignedIn) {
      // 用户未登录，清理连接和通知
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      processedNotificationIds.current.clear();
      return;
    }

    // 建立SSE连接
    const connectSSE = () => {
      try {
        console.log('🔗 建立通知SSE连接...');
        const eventSource = new EventSource('/api/sse/notifications');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('✅ 通知SSE连接已建立');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 收到SSE消息:', data);

            if (data.type === 'connection_established') {
              console.log('🔗 通知SSE连接确认:', data.data.connectionId);
              return;
            }

            if (data.type === 'new_notification') {
              const notification = data.data;
              
              // 检查是否已经处理过
              if (processedNotificationIds.current.has(notification.id.toString())) {
                console.log('⚠️ 通知已处理过，跳过:', notification.id);
                return;
              }

              console.log('🔔 处理新通知:', notification);

              const notificationItem: NotificationItem = {
                id: notification.id.toString(),
                type: getNotificationType(notification.type),
                title: notification.title,
                message: notification.message,
                timestamp: new Date(notification.createdAt),
                autoClose: true,
                duration: 5000,
              };

              // 添加到显示列表
              setNotifications(prev => {
                const newNotifications = [notificationItem, ...prev].slice(0, 3);
                return newNotifications;
              });

              // 标记为已处理
              processedNotificationIds.current.add(notification.id.toString());

              // 自动标记为已读
              markAsRead(notification.id);
            }
          } catch (error) {
            console.error('解析SSE消息失败:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ 通知SSE连接错误:', error);
          eventSource.close();
          
          // 3秒后重连
          setTimeout(() => {
            if (isSignedIn) {
              console.log('🔄 重新连接通知SSE...');
              connectSSE();
            }
          }, 3000);
        };

      } catch (error) {
        console.error('建立通知SSE连接失败:', error);
      }
    };

    // 建立连接
    connectSSE();

    // 清理函数
    return () => {
      if (eventSourceRef.current) {
        console.log('🔐 关闭通知SSE连接');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isSignedIn]);

  // 标记通知为已读
  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  // 自动关闭通知
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach(notification => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
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
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 