"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, Image, Languages, FileImage, RefreshCw, History, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const features = [
  {
    id: 'pdf-to-markdown',
    title: 'PDF解析',
    description: '将PDF解析成可编辑的Markdown文本，保留图片，同时支持翻译（自动检测源语言），可以选择把表格解析成markdown格式或图片格式。加翻译共8积分/页。',
    icon: FileText,
    href: '/pdf-to-markdown',
    gradient: 'from-blue-500 to-cyan-500',
    points: '5-8积分/页',
  },
  {
    id: 'image-to-markdown',
    title: '图片转Markdown',
    description: '利用大模型将上传的图片解析成Markdown文本，支持多种图片格式，智能识别文本内容。',
    icon: Image,
    href: '/image-to-markdown',
    gradient: 'from-purple-500 to-pink-500',
    points: '5积分/张',
  },
  {
    id: 'markdown-translation',
    title: 'Markdown翻译',
    description: '将Markdown进行翻译，保留原排版，支持多种语言间的互译，确保格式完整性。',
    icon: Languages,
    href: '/markdown-translation',
    gradient: 'from-green-500 to-emerald-500',
    points: '5积分/KB',
  },
  {
    id: 'pdf-translation',
    title: 'PDF翻译',
    description: '将PDF进行翻译，保留原排版，支持多语言翻译，保持文档的原始格式和布局。',
    icon: FileImage,
    href: '/pdf-translation',
    gradient: 'from-orange-500 to-red-500',
    points: '3积分/页',
  },
  {
    id: 'format-conversion',
    title: '格式转换',
    description: '将Markdown转换成word，pdf，html，latex等不同格式，满足各种文档输出需求。',
    icon: RefreshCw,
    href: '/format-conversion',
    gradient: 'from-indigo-500 to-purple-500',
    points: '2积分/页',
  },
  {
    id: 'file-history',
    title: '文件历史',
    description: '所有被处理过的文件将会保留七天，七天内可供下载和主动删除，方便管理处理记录。',
    icon: History,
    href: '/file-history',
    gradient: 'from-gray-500 to-slate-500',
    points: '免费查看',
  },
];

const benefits = [
  {
    icon: Zap,
    title: '高效处理',
    description: '基于最新AI技术，快速准确地处理各类文档',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '数据加密传输，文件自动清理，保护隐私安全',
  },
  {
    icon: Clock,
    title: '7天保存',
    description: '处理结果保存7天，随时下载，方便管理',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                智译平台
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              基于AI的智能文档处理服务平台，让文档处理变得简单高效
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/pdf-to-markdown">
                  开始使用
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/file-history">
                  查看历史
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">核心功能</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">六大强大功能，满足您的文档处理需求</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group"
                >
                  <Link href={feature.href} className="block h-full">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-2xl dark:hover:shadow-slate-700/20 h-full flex flex-col">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                          {feature.points}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* 功能演示板块 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">功能演示</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">直观展示各功能的处理效果</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={`demo-${feature.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index + 0.8 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mr-3`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-32 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-600">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">演示图片 1</span>
                      </div>
                      <div className="h-32 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-600">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">演示图片 2</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">为什么选择智译平台？</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">专业、安全、高效的文档处理服务</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index + 0.4 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Points System Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">积分系统</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  获得途径
                </h3>
                <ul className="space-y-3">
                  {[
                    { text: '注册即送', points: '20积分' },
                    { text: '每日签到领取', points: '5积分' },
                    { text: '特殊节日免费赠送积分', points: null },
                    { text: '兑换码兑换', points: null },
                    { text: '在线充值', points: '1元 = 100积分' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="flex-grow">{item.text}</span>
                      {item.points && (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {item.points}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  消费标准
                </h3>
                <ul className="space-y-3">
                  {[
                    { service: 'PDF解析', cost: '5积分/页' },
                    { service: 'PDF解析+翻译', cost: '8积分/页' },
                    { service: '图片转Markdown', cost: '5积分/张' },
                    { service: 'Markdown翻译', cost: '5积分/KB' },
                    { service: 'PDF翻译', cost: '3积分/页' },
                    { service: '格式转换', cost: '2积分/页' },
                  ].map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                      <span>{item.service}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{item.cost}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-slate-700 pt-8 text-center space-y-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/profile">
                  查看我的积分
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 