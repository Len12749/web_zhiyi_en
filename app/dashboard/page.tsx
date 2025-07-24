"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  User, 
  Coins, 
  Gift, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Image, 
  Languages, 
  Globe,
  RefreshCw,
  History,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { makeApiRequest } from '@/lib/utils';

interface PointsSummary {
  currentPoints: number;
  hasInfinitePoints: boolean;
  totalEarned: number;
  totalSpent: number;
  todayChecked: boolean;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface AsyncAction {
  loading: boolean;
  error: string | null;
}

interface CheckinResponse {
  success: boolean;
  points?: number;
  message: string;
}

interface RedeemResponse {
  success: boolean;
  points?: number;
  message: string;
}

// 简化的异步状态管理 Hook
const useAsyncOperation = <T,>(initialData: T | null = null) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    retryCount: 0
  });

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const result = await operation();
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        retryCount: 0
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
      throw error;
    }
  }, []);

  const retry = useCallback(async (operation: () => Promise<T>) => {
    return execute(operation);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, [initialData]);

  return { ...state, execute, retry, reset };
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  // 异步状态管理
  const pointsSummary = useAsyncOperation<PointsSummary>(null);
  const [checkinAction, setCheckinAction] = useState<AsyncAction>({ loading: false, error: null });
  const [redeemAction, setRedeemAction] = useState<AsyncAction>({ loading: false, error: null });
  
  // 本地状态
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // 快捷操作配置
  const quickActions = [
    {
      title: 'PDF解析',
      description: '将PDF转换为Markdown',
      icon: FileText,
      href: '/pdf-to-markdown',
      color: 'bg-blue-500',
    },
    {
      title: '图片转Markdown',
      description: '智能识别图片内容',
      icon: Image,
      href: '/image-to-markdown',
      color: 'bg-green-500',
    },
    {
      title: 'Markdown翻译',
      description: '保留格式的文档翻译',
      icon: Languages,
      href: '/markdown-translation',
      color: 'bg-purple-500',
    },
    {
      title: 'PDF翻译',
      description: '保留排版的PDF翻译',
      icon: Globe,
      href: '/pdf-translation',
      color: 'bg-orange-500',
    },
    {
      title: '格式转换',
      description: '多种文档格式转换',
      icon: RefreshCw,
      href: '/format-conversion',
      color: 'bg-red-500',
    },
    {
      title: '文件历史',
      description: '查看处理历史记录',
      icon: History,
      href: '/file-history',
      color: 'bg-gray-500',
    },
  ];

  // 初始化用户和获取积分信息
  const initializeUserAndFetchPoints = useCallback(async () => {
    if (!user?.id || !user?.emailAddresses[0]?.emailAddress) {
      throw new Error('用户信息不完整');
    }

    // 并发执行用户初始化和积分获取
    const [initResult, pointsResult] = await Promise.allSettled([
      makeApiRequest('/api/user/init', {
        method: 'POST',
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
        }),
      }),
      makeApiRequest<PointsSummary>('/api/points/summary')
    ]);

    // 检查用户初始化结果
    if (initResult.status === 'rejected') {
      console.warn('用户初始化失败，但继续获取积分信息:', initResult.reason);
    } else if (!initResult.value.success) {
      console.warn('用户初始化失败，但继续获取积分信息:', initResult.value.message);
    }

    // 检查积分获取结果
    if (pointsResult.status === 'rejected') {
      throw pointsResult.reason;
    }

    if (!pointsResult.value.success) {
      throw new Error(pointsResult.value.message || '获取积分信息失败');
    }

    return pointsResult.value.data || (pointsResult.value as any).summary;
  }, [user]);

  // 初始化效果
  useEffect(() => {
    if (isLoaded && user) {
      pointsSummary.execute(initializeUserAndFetchPoints);
    }
  }, [isLoaded, user, initializeUserAndFetchPoints, pointsSummary.execute]);

  // 每日签到
  const handleCheckin = useCallback(async () => {
    if (checkinAction.loading || pointsSummary.data?.todayChecked) {
      return;
    }

    setCheckinAction({ loading: true, error: null });

    try {
      const response = await makeApiRequest<CheckinResponse>('/api/points/checkin', {
        method: 'POST',
      });

      if (!response.success) {
        throw new Error(response.message || '签到失败');
      }

      // 乐观更新本地状态
      if (pointsSummary.data) {
        const earnedPoints = response.data?.points || (response as any).points || 5;
        pointsSummary.execute(async () => ({
          ...pointsSummary.data!,
          currentPoints: pointsSummary.data!.currentPoints + earnedPoints,
          totalEarned: pointsSummary.data!.totalEarned + earnedPoints,
          todayChecked: true,
        }));
      }

      // 触发通知刷新
      const refreshEvent = new CustomEvent('refreshNotifications');
      window.dispatchEvent(refreshEvent);

      setCheckinAction({ loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '签到失败';
      setCheckinAction({ loading: false, error: errorMessage });
      console.error('签到失败:', error);
    }
  }, [checkinAction.loading, pointsSummary.data, pointsSummary.execute]);

  // 兑换码兑换
  const handleRedeem = useCallback(async () => {
    const trimmedCode = redeemCode.trim();
    if (!trimmedCode || redeemAction.loading) {
      return;
    }

    setRedeemAction({ loading: true, error: null });
    setRedeemMessage('');

    try {
      const response = await makeApiRequest<RedeemResponse>('/api/points/redeem', {
        method: 'POST',
        body: JSON.stringify({ code: trimmedCode }),
      });

      if (!response.success) {
        throw new Error(response.message || '兑换失败');
      }

      // 乐观更新本地状态
      const earnedPoints = response.data?.points || (response as any).points;
      if (pointsSummary.data && earnedPoints) {
        pointsSummary.execute(async () => ({
          ...pointsSummary.data!,
          currentPoints: pointsSummary.data!.currentPoints + earnedPoints,
          totalEarned: pointsSummary.data!.totalEarned + earnedPoints,
        }));
      }

      setRedeemSuccess(true);
      setRedeemMessage(`兑换成功！获得 ${earnedPoints || 0} 积分`);
      setRedeemCode('');
      setRedeemAction({ loading: false, error: null });

      // 3秒后清除消息
      setTimeout(() => {
        setRedeemMessage('');
        setRedeemSuccess(false);
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '兑换失败，请稍后重试';
      setRedeemAction({ loading: false, error: errorMessage });
      setRedeemSuccess(false);
      setRedeemMessage(errorMessage);

      // 5秒后清除错误消息
      setTimeout(() => {
        setRedeemMessage('');
        setRedeemAction(prev => ({ ...prev, error: null }));
      }, 5000);
    }
  }, [redeemCode, redeemAction.loading, pointsSummary.data, pointsSummary.execute]);

  // 重试积分加载
  const retryPointsLoad = useCallback(() => {
    pointsSummary.retry(initializeUserAndFetchPoints);
  }, [pointsSummary.retry, initializeUserAndFetchPoints]);

  // 加载状态
  if (!isLoaded || pointsSummary.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (pointsSummary.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            加载失败
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {pointsSummary.error}
          </p>
          <Button onClick={retryPointsLoad} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            个人中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            欢迎回来，{user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：用户信息和积分 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 用户信息卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user?.firstName || '用户'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 积分信息卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                  积分余额
                  {pointsSummary.retryCount > 0 && (
                    <span className="ml-2 text-xs text-orange-500">
                      (已重试 {pointsSummary.retryCount} 次)
                    </span>
                  )}
                </h3>
                {pointsSummary.data?.hasInfinitePoints && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    无限积分
                  </span>
                )}
              </div>
              
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {pointsSummary.data?.hasInfinitePoints ? '∞' : pointsSummary.data?.currentPoints || 0}
              </div>
            </motion.div>

            {/* 每日签到卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  每日签到
                </h3>
                <Gift className="h-5 w-5 text-green-500" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                每日签到可获得 5 积分奖励
              </p>

              {checkinAction.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {checkinAction.error}
                  </p>
                </div>
              )}

              <Button
                onClick={handleCheckin}
                disabled={checkinAction.loading || pointsSummary.data?.todayChecked}
                className="w-full"
                variant={pointsSummary.data?.todayChecked ? "outline" : "default"}
              >
                {checkinAction.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    签到中...
                  </>
                ) : pointsSummary.data?.todayChecked ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    今日已签到
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    立即签到
                  </>
                )}
              </Button>
            </motion.div>

            {/* 兑换码卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-purple-500" />
                  兑换码
                </h3>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                输入兑换码获得积分奖励
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="输入兑换码"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={redeemAction.loading}
                    maxLength={20}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={redeemAction.loading || !redeemCode.trim()}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    {redeemAction.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        兑换中
                      </>
                    ) : (
                      '兑换'
                    )}
                  </Button>
                </div>
                
                {redeemMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-md text-sm ${
                      redeemSuccess 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {redeemMessage}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* 右侧：快捷操作 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                快捷操作
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.title}
                    href={action.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 