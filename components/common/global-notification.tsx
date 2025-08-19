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
import { useUser } from '@/hooks/use-auth';

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

              // 翻译通知内容
              const translated = translateNotification(notification.title, notification.message);

              const notificationItem: NotificationItem = {
                id: notification.id.toString(),
                type: getNotificationType(notification.type),
                title: translated.title,
                message: translated.message,
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
          
          // 基于事件的重连策略，避免轮询
          // 只在用户仍然登录且连接确实被关闭时重连
          if (isSignedIn && eventSource.readyState === EventSource.CLOSED) {
            console.log('🔄 通知SSE连接被关闭，尝试重新连接...');
            // 使用Promise而不是setTimeout，符合事件驱动架构
            Promise.resolve().then(() => {
              if (isSignedIn && (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED)) {
                connectSSE();
              }
            });
          }
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

  // 翻译函数：将后端发送的中文通知翻译为英文
  const translateNotification = (title: string, message: string) => {
    // 翻译标题
    const titleTranslations: { [key: string]: string } = {
      '格式转换失败': 'Format Conversion Failed',
      '格式转换成功': 'Format Conversion Successful',
      '格式转换完成': 'Format Conversion Completed',
      'PDF翻译失败': 'PDF Translation Failed',
      'PDF翻译成功': 'PDF Translation Successful',
      'PDF翻译完成': 'PDF Translation Completed',
      'PDF保留排版翻译失败': 'PDF Translation Failed',
      'PDF保留排版翻译成功': 'PDF Translation Successful',
      'PDF保留排版翻译完成': 'PDF Translation Completed',
      'PDF解析失败': 'PDF Parsing Failed',
      'PDF解析成功': 'PDF Parsing Successful',
      'PDF解析完成': 'PDF Parsing Completed',
      'Markdown翻译失败': 'Markdown Translation Failed',
      'Markdown翻译成功': 'Markdown Translation Successful',
      'Markdown翻译完成': 'Markdown Translation Completed',
      '图片识别失败': 'Image Recognition Failed',
      '图片识别成功': 'Image Recognition Successful',
      '图片识别完成': 'Image Recognition Completed',
      '任务失败': 'Task Failed',
      '任务成功': 'Task Successful',
      '任务完成': 'Task Completed',
      '处理失败': 'Processing Failed',
      '处理成功': 'Processing Successful',
      '处理完成': 'Processing Completed',
      '上传成功': 'Upload Successful',
      '上传完成': 'Upload Completed',
      '下载成功': 'Download Successful',
      '下载完成': 'Download Completed',
      '文件处理失败': 'File Processing Failed',
      '文件处理成功': 'File Processing Successful',
      '文件处理完成': 'File Processing Completed',
      '签到成功': 'Check-in Successful'
    };

    // 翻译消息内容
    let translatedMessage = message
      // 成功完成的消息
      .replace(/您的文件\s*['"]([^'"]+)['"]\s*已成功处理完成，可以下载了/, "Your file '$1' has been successfully processed and is ready for download")
      .replace(/文件\s*['"]([^'"]+)['"]\s*已成功处理完成/, "File '$1' has been successfully processed")
      .replace(/文件\s*['"]([^'"]+)['"]\s*处理完成/, "File '$1' processing completed")
      .replace(/您的文件已经处理完成/, "Your file has been processed")
      .replace(/处理完成，可以下载/, "Processing completed, ready for download")
      .replace(/可以下载了/, "ready for download")
      .replace(/已完成处理/, "processing completed")
      
      // 签到相关消息
      .replace(/每日签到完成，获得\s*(\d+)\s*积分奖励！/, "Daily check-in completed, earned $1 points!")
      
      // 失败的消息
      .replace(/文件\s*['"]([^'"]+)['"]\s*处理失败/, "File '$1' processing failed")
      .replace(/文件\s*['"]([^'"]+)['"]\s*处理成功/, "File '$1' processing successful")
      .replace(/文件\s*([^：]+)：\s*(.+)/, "File $1: $2") // 处理 "文件 xxx: 错误信息" 格式
      
      // 积分相关
      .replace(/未消耗积分/, "No points consumed")
      .replace(/已消耗\s*(\d+)\s*积分/, "Consumed $1 points")
      .replace(/积分不足/, "Insufficient points")
      
      // 通用错误
      .replace(/任务创建失败/, "Task creation failed")
      .replace(/上传失败/, "Upload failed")
      .replace(/网络错误/, "Network error")
      .replace(/服务器错误/, "Server error")
      .replace(/文件格式不支持/, "File format not supported")
      .replace(/文件太大/, "File too large")
      .replace(/处理超时/, "Processing timeout")
      .replace(/连接超时/, "Connection timeout")
      .replace(/下载失败/, "Download failed")
      .replace(/解析失败/, "Parsing failed")
      .replace(/翻译失败/, "Translation failed")
      .replace(/转换失败/, "Conversion failed")
      .replace(/识别失败/, "Recognition failed")
      .replace(/获取失败/, "Failed to retrieve")
      .replace(/保存失败/, "Save failed")
      .replace(/删除失败/, "Delete failed")
      .replace(/fetch failed/, "fetch failed"); // 保持英文错误信息不变

    // 如果标题包含中文但不在翻译字典中，尝试简单的模式匹配
    let translatedTitle = titleTranslations[title] || title;
    
    // 通用翻译模式
    if (translatedTitle === title && /[\u4e00-\u9fff]/.test(title)) {
      translatedTitle = title
        .replace(/(.+)失败$/, '$1 Failed')
        .replace(/(.+)成功$/, '$1 Successful') 
        .replace(/(.+)完成$/, '$1 Completed')
        .replace(/PDF保留排版翻译/, 'PDF Translation')
        .replace(/PDF翻译/, 'PDF Translation')
        .replace(/PDF解析/, 'PDF Parsing')
        .replace(/Markdown翻译/, 'Markdown Translation')
        .replace(/格式转换/, 'Format Conversion')
        .replace(/图片识别/, 'Image Recognition')
        .replace(/文件处理/, 'File Processing')
        .replace(/任务/, 'Task')
        .replace(/处理/, 'Processing')
        .replace(/上传/, 'Upload')
        .replace(/下载/, 'Download');
    }

    return {
      title: translatedTitle,
      message: translatedMessage
    };
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
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