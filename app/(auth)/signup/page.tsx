'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSignUpUrl } from '@/lib/casdoor';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  useEffect(() => {
    // 重定向到 Casdoor 注册页面
    const signUpUrl = getSignUpUrl(`zhiyi-${encodeURIComponent(redirectPath)}`);
    window.location.href = signUpUrl;
  }, [redirectPath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6"
          >
            <UserPlus className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            正在跳转到注册页面
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            请稍候，我们正在为您准备安全的注册环境...
          </p>
          
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            如果页面没有自动跳转，请{' '}
            <button 
              onClick={() => window.location.href = getSignUpUrl(`zhiyi-${encodeURIComponent(redirectPath)}`)}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              点击这里手动跳转
            </button>
          </p>
          
          <div className="pt-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              已有账户？{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                立即登录
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}