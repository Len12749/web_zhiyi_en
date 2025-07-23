"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { isSignedIn } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!isSignedIn) {
      setUnreadCount(0);
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      // 获取最新的通知
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.notifications || []);
          setUnreadCount(result.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isSignedIn) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications?countOnly=true');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUnreadCount(result.count || 0);
        }
      }
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        // 更新本地状态
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        
        // 更新未读数量
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // 每30秒检查一次通知
    const interval = setInterval(fetchNotifications, 30000);
    
    // 监听自定义刷新事件
    const handleRefresh = () => {
      fetchNotifications();
    };
    
    window.addEventListener('refreshNotifications', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, [isSignedIn]);

  return {
    unreadCount,
    notifications,
    loading,
    refreshUnreadCount: fetchUnreadCount,
    markAsRead,
    refresh: fetchNotifications,
  };
} 