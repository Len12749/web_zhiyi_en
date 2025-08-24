'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSignInUrl } from '@/lib/casdoor';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  useEffect(() => {
    // 重定向到 Casdoor 登录页面
    const signInUrl = getSignInUrl(`zhiyi-${encodeURIComponent(redirectPath)}`);
    window.location.href = signInUrl;
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
            className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6"
          >
            <LogIn className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            正在跳转到登录页面
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            请稍候，我们正在为您准备安全的登录环境...
          </p>
          
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
              onClick={() => window.location.href = getSignInUrl(`zhiyi-${encodeURIComponent(redirectPath)}`)}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
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
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}