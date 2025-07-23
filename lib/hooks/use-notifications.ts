"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useNotifications() {
  const { isSignedIn } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUnreadCount();
    
    // 每30秒检查一次未读数量
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [isSignedIn]);

  return {
    unreadCount,
    loading,
    refreshUnreadCount: fetchUnreadCount,
  };
} 