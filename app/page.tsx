"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import { FileText, Image, Languages, Globe, RefreshCw, History, ArrowRight, Zap, Shield, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SubscriptionCard, SubscriptionPlan } from '@/components/common/subscription-card';
import { useScrollAnimation } from '@/lib/hooks/use-scroll-animation';

const features = [
  {
    id: 'pdf-to-markdown',
    title: 'PDF Parsing',
    description: 'Convert PDFs into editable Markdown text with our proprietary model, with translation support. Leveraging large language models for standardized mathematical formula output, with options to parse tables as markdown or images.',
    icon: FileText,
    href: '/pdf-to-markdown',
    gradient: 'from-blue-500 to-cyan-500',
    points: '2 points/page, 3 points/page with translation',
  },
  {
    id: 'image-to-markdown',
    title: 'Image Recognition',
    description: 'Convert uploaded images into Markdown text using large language models, supporting various image formats with intelligent text recognition.',
    icon: Image,
    href: '/image-to-markdown',
    gradient: 'from-purple-500 to-pink-500',
    points: '5 points/image',
  },
  {
    id: 'markdown-translation',
    title: 'Markdown Translation',
    description: 'Translate Markdown files using our proprietary translation strategy combined with large language models, providing excellent context consistency and supporting translation between multiple languages.',
    icon: Languages,
    href: '/markdown-translation',
    gradient: 'from-green-500 to-emerald-500',
    points: '2 points/10k characters',
  },
  {
    id: 'pdf-translation',
    title: 'PDF Translation',
    description: 'Translate PDFs while preserving the original layout using our proprietary model, maintaining document format and structure with support for multiple languages.',
    icon: Globe,
    href: '/pdf-translation',
    gradient: 'from-orange-500 to-red-500',
    points: '2 points/page',
  },
  {
    id: 'format-conversion',
    title: 'Format Conversion',
    description: 'Convert Markdown to various formats including Word, PDF, HTML, and LaTeX to meet different document output requirements.',
    icon: RefreshCw,
    href: '/format-conversion',
    gradient: 'from-indigo-500 to-purple-500',
    points: '1 point/conversion',
  },
  {
    id: 'file-history',
    title: 'File History',
    description: 'All processed files are retained for seven days, available for download and manual deletion within this period for convenient management of processing records.',
    icon: History,
    href: '/file-history',
    gradient: 'from-gray-500 to-slate-500',
    points: 'Free to view',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Efficient Processing',
    description: 'Fast and accurate document processing based on large language models',
  },
  {
    icon: Shield,
    title: 'Safe & Reliable',
    description: 'Encrypted data transmission, automatic file cleanup, protecting your privacy',
  },
  {
    icon: Clock,
    title: '7-Day Storage',
    description: 'Results stored for 7 days, download anytime for convenient management',
  },
];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Standard',
    price: {
      monthly: 10,
      yearly: 100
    },
    features: [
      '4,000 points monthly',
      'Premium user badge'
    ],
    color: 'blue'
  },
  {
    name: 'Premium',
    price: {
      monthly: 30,
      yearly: 300
    },
    features: [
      '10,000 points monthly',
      'Premium user badge'
    ],
    color: 'purple'
  }
];



export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubscriptionCardOpen, setIsSubscriptionCardOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  
  // 为每个section创建滚动动画hook
  const heroAnimation = useScrollAnimation();
  const featuresAnimation = useScrollAnimation();
  const pointsAnimation = useScrollAnimation();
  const subscriptionAnimation = useScrollAnimation();
  const benefitsAnimation = useScrollAnimation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroAnimation.ref} className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                ZhiYi
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Intelligent document processing service platform based on large language models, making document processing simple and efficient
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/pdf-to-markdown">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/file-history">
                  View History
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresAnimation.ref} className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Core Features</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: featuresAnimation.isVisible ? 0.1 * index : 0 }}
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
        </div>
      </section>

      {/* Points System Section */}
      <section ref={pointsAnimation.ref} className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pointsAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Points System</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Simple and transparent points mechanism, making every point valuable</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={pointsAnimation.isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: pointsAnimation.isVisible ? 0.2 : 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center mb-6">
                <Zap className="h-5 w-5 mr-2" />
                Earn Points
              </h3>
              <ul className="space-y-3">
                {[
                  { text: 'Registration bonus', points: '100 points' },
                  { text: 'Daily check-in', points: '10 points' },
                  { text: 'Special holiday free points', points: null },
                  { text: 'Redemption codes', points: null },
                  { text: 'Recharge', points: null },
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="flex-grow">{item.text}</span>
                    {item.points && (
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.points}</span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={pointsAnimation.isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: pointsAnimation.isVisible ? 0.4 : 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center mb-6">
                <Shield className="h-5 w-5 mr-2" />
                Usage Rates
              </h3>
              <ul className="space-y-3">
                {[
                  { service: 'PDF Parsing', cost: '2 points/page' },
                  { service: 'PDF Parsing + Translation', cost: '3 points/page' },
                  { service: 'Image Recognition', cost: '5 points/image' },
                  { service: 'Markdown Translation', cost: '2 points/10k chars' },
                  { service: 'PDF Translation', cost: '2 points/page' },
                  { service: 'Format Conversion', cost: '1 point/conversion' },
                ].map((item, index) => (
                  <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>{item.service}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{item.cost}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pointsAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: pointsAnimation.isVisible ? 0.6 : 0 }}
            className="text-center space-y-4"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto mb-4">
              <h4 className="text-md font-medium text-blue-900 dark:text-blue-300 mb-2">
                Points Deduction Policy
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-2 text-left">
                We use a "process first, pay later" model:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 text-left">
                <li className="text-left">• When uploading files, we only check if you have enough points, but don't deduct immediately</li>
                <li className="text-left">• Points are only deducted when you download the file for the first time</li>
              </ul>
            </div>

            {isLoaded && (
              isSignedIn ? (
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/dashboard">
                    View My Points
                  </Link>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg font-medium">
                    Sign In to View Points
                  </Button>
                </SignInButton>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* Subscription Section */}
      <section ref={subscriptionAnimation.ref} className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={subscriptionAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Subscription Plans</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Choose a subscription plan that suits you and enjoy more points</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={subscriptionAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: subscriptionAnimation.isVisible ? 0.1 * index : 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative"
              >

                <h3 className={`text-2xl font-bold mb-4 text-${plan.color}-600 dark:text-${plan.color}-400`}>{plan.name}</h3>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price.monthly}<span className="text-lg text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or ${plan.price.yearly}/year
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
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
                  className={`w-full bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white py-2 px-4 rounded-lg transition-colors`}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsSubscriptionCardOpen(true);
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe to {plan.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsAnimation.ref} className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose ZhiYi?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Professional, secure, and efficient document processing services</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={benefitsAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: benefitsAnimation.isVisible ? 0.1 * index : 0 }}
                  className="text-center group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
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


      {/* 订阅卡片弹窗 */}
      {selectedPlan && (
        <SubscriptionCard
          plan={selectedPlan}
          isOpen={isSubscriptionCardOpen}
          onClose={() => setIsSubscriptionCardOpen(false)}
        />
      )}
    </div>
  );
} 