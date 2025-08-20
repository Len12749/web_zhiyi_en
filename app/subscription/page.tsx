"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Zap,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/common/auth-guard';
import { SubscriptionCard, SubscriptionPlan } from '@/components/common/subscription-card';
import { makeApiRequest } from '@/lib/utils';

interface PointsSummary {
  currentPoints: number;
  hasInfinitePoints: boolean;
  totalEarned: number;
  totalSpent: number;
  todayChecked: boolean;
  membershipType?: string;
  membershipExpiry?: Date | null;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

// 订阅计划配置
const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: { monthly: 5, yearly: 50 },
    features: [
      '800 points monthly',
      'Points roll over within membership period'
    ],
    color: 'gray'
  },
  {
    name: 'Standard',
    price: { monthly: 10, yearly: 100 },
    features: [
      '2,000 points monthly',
      'Points roll over within membership period'
    ],
    color: 'blue'
  },
  {
    name: 'Premium',
    price: { monthly: 30, yearly: 300 },
    features: [
      '10,000 points monthly',
      'Points roll over within membership period'
    ],
    color: 'purple'
  },
  {
    name: 'Add-on Pack (Members Only)',
    price: { monthly: 10, yearly: 10 },
    oneTime: true,
    oneTimePrice: 10,
    features: [
      '2,000 points one-time',
      'Purchasable only during active subscription'
    ],
    color: 'yellow'
  }
];

const buttonColorMap: Record<string, string> = {
  gray: 'bg-gray-500 hover:bg-gray-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
};

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  
  // 异步状态管理
  const pointsSummary = useAsyncOperation<PointsSummary>(null);
  
  // 订阅卡片状态
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubscriptionCardOpen, setIsSubscriptionCardOpen] = useState(false);

  // 初始化用户和获取积分信息
  const initializeUserAndFetchPoints = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Incomplete user information');
    }

    // 并发执行用户初始化和积分获取
    const [initResult, pointsResult] = await Promise.allSettled([
      makeApiRequest('/api/user/init', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          email: user.email || user.name || '',
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
      throw new Error(pointsResult.value.message || 'Failed to get points information');
    }

    return pointsResult.value.data || (pointsResult.value as any).summary;
  }, [user]);

  // 初始化效果
  useEffect(() => {
    if (isLoaded && user) {
      pointsSummary.execute(initializeUserAndFetchPoints);
    }
  }, [isLoaded, user, initializeUserAndFetchPoints, pointsSummary.execute]);

  // 重试积分加载
  const retryPointsLoad = useCallback(() => {
    pointsSummary.retry(initializeUserAndFetchPoints);
  }, [pointsSummary.retry, initializeUserAndFetchPoints]);

  // 处理订阅点击
  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsSubscriptionCardOpen(true);
  };

  // 加载状态
  if (!isLoaded || pointsSummary.loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading subscription information...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // 错误状态
  if (pointsSummary.error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {pointsSummary.error}
            </p>
            <Button onClick={retryPointsLoad} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isFree = pointsSummary.data?.membershipType === 'free';
  const isStandard = pointsSummary.data?.membershipType === 'standard';
  const isPremium = pointsSummary.data?.membershipType === 'premium';
  const currentPlan = isFree ? 'Free' : isStandard ? 'Standard' : 'Premium';
  const expiryDate = pointsSummary.data?.membershipExpiry ? new Date(pointsSummary.data.membershipExpiry).toLocaleDateString() : 'None';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Premium Subscription
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock more features and get more points with our subscription plans
            </p>
          </motion.div>

          {/* 当前订阅状态 */}
          {!isFree && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Current Plan: {currentPlan}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires: {expiryDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 订阅计划 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative h-full flex flex-col"
              >
                <h3 className={`text-2xl font-bold mb-4 text-${plan.color}-600 dark:text-${plan.color}-400`}>{plan.name}</h3>

                <div className="mb-6">
                  {plan.oneTime ? (
                    <>
                      <div className="flex items-end space-x-2">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">${plan.oneTimePrice}</span>
                        <span className="text-base text-gray-500 dark:text-gray-400 mb-1">/one-time</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 invisible" aria-hidden="true">
                        <span className="inline-flex items-center space-x-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">$300</span>
                          <span className="text-gray-500 dark:text-gray-400">/year</span>
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end space-x-2">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">${plan.price.monthly}</span>
                        <span className="text-base text-gray-500 dark:text-gray-400 mb-1">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center space-x-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price.yearly}</span>
                          <span className="text-gray-500 dark:text-gray-400">/year</span>
                        </span>
                      </p>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className={`w-5 h-5 rounded-full bg-${plan.color}-100 dark:bg-${plan.color}-900/20 flex items-center justify-center mr-3`}>
                        <svg className={`w-3 h-3 text-${plan.color}-500`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${buttonColorMap[plan.color]} text-white py-2 px-4 rounded-lg transition-colors`}
                  onClick={() => handleSubscribe(plan)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe to {plan.name}
                </Button>
              </motion.div>
            ))}
          </motion.div>


        </div>
      </div>

      {/* 订阅卡片弹窗 */}
      {selectedPlan && (
        <SubscriptionCard
          plan={selectedPlan}
          isOpen={isSubscriptionCardOpen}
          onClose={() => setIsSubscriptionCardOpen(false)}
        />
      )}
    </AuthGuard>
  );
}