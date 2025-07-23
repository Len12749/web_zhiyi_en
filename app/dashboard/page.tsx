"use client";

import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PointsSummary {
  currentPoints: number;
  hasInfinitePoints: boolean;
  totalEarned: number;
  totalSpent: number;
  todayChecked: boolean;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
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

  // 初始化用户并获取积分信息
  useEffect(() => {
    const initializeUserAndFetchPoints = async () => {
      try {
        // 初始化用户
        if (user?.id && user?.emailAddresses[0]?.emailAddress) {
          const initResponse = await fetch('/api/user/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.emailAddresses[0].emailAddress,
            }),
          });

          if (!initResponse.ok) {
            console.error('用户初始化失败');
          }
        }

        // 获取积分统计
        const pointsResponse = await fetch('/api/points/summary');
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          if (pointsData.success) {
            setPointsSummary(pointsData.summary);
          }
        }
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeUserAndFetchPoints();
    }
  }, [user]);

  // 每日签到
  const handleCheckin = async () => {
    setCheckinLoading(true);
    try {
      const response = await fetch('/api/points/checkin', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新积分信息
        if (pointsSummary) {
          setPointsSummary({
            ...pointsSummary,
            currentPoints: pointsSummary.currentPoints + (result.points || 5),
            totalEarned: pointsSummary.totalEarned + (result.points || 5),
            todayChecked: true,
          });
        }
        
        // TODO: 显示成功通知
        alert(`签到成功！获得 ${result.points || 5} 积分`);
      } else {
        // TODO: 显示错误通知
        alert(result.message || '签到失败');
      }
    } catch (error) {
      console.error('签到失败:', error);
      alert('签到失败，请稍后重试');
    } finally {
      setCheckinLoading(false);
    }
  };

  // 兑换码兑换
  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    
    setRedeemLoading(true);
    setRedeemMessage('');
    
    try {
      const response = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新积分信息
        if (pointsSummary && result.points) {
          setPointsSummary({
            ...pointsSummary,
            currentPoints: pointsSummary.currentPoints + result.points,
            totalEarned: pointsSummary.totalEarned + result.points,
          });
        }
        
        setRedeemSuccess(true);
        setRedeemMessage(`兑换成功！获得 ${result.points || 0} 积分`);
        setRedeemCode('');
        
        // 3秒后清除消息
        setTimeout(() => {
          setRedeemMessage('');
        }, 3000);
      } else {
        setRedeemSuccess(false);
        setRedeemMessage(result.message || '兑换失败');
        
        // 5秒后清除错误消息
        setTimeout(() => {
          setRedeemMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('兑换失败:', error);
      setRedeemSuccess(false);
      setRedeemMessage('兑换失败，请稍后重试');
      
      setTimeout(() => {
        setRedeemMessage('');
      }, 5000);
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
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
                </h3>
                {pointsSummary?.hasInfinitePoints && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    无限积分
                  </span>
                )}
              </div>
              
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {pointsSummary?.hasInfinitePoints ? '∞' : pointsSummary?.currentPoints || 0}
              </div>

              {pointsSummary && !pointsSummary.hasInfinitePoints && (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>累计获得:</span>
                    <span className="text-green-600 dark:text-green-400">
                      +{pointsSummary.totalEarned}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>累计消费:</span>
                    <span className="text-red-600 dark:text-red-400">
                      -{pointsSummary.totalSpent}
                    </span>
                  </div>
                </div>
              )}
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

              <Button
                onClick={handleCheckin}
                disabled={checkinLoading || pointsSummary?.todayChecked}
                className="w-full"
                variant={pointsSummary?.todayChecked ? "outline" : "default"}
              >
                {checkinLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    签到中...
                  </>
                ) : pointsSummary?.todayChecked ? (
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
                    disabled={redeemLoading}
                    maxLength={20}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={redeemLoading || !redeemCode.trim()}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    {redeemLoading ? (
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