"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Image, 
  Languages, 
  Globe, 
  RefreshCw, 
  History, 
  Crown,
  Bell, 
  User, 
  Menu,
  X,
  Home,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/theme-toggle';
import { useUser, useAuth } from '@/hooks/use-auth';
import { getSignInUrl, getSignUpUrl } from '@/lib/casdoor';
import { UserButton } from '../common/user-button';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/pdf-to-markdown', label: 'PDF Parsing', icon: FileText },
  { href: '/image-to-markdown', label: 'Image Recognition', icon: Image },
  { href: '/markdown-translation', label: 'Markdown Translation', icon: Languages },
  { href: '/pdf-translation', label: 'PDF Translation', icon: Globe },
  { href: '/format-conversion', label: 'Format Conversion', icon: RefreshCw },
  { href: '/file-history', label: 'File History', icon: History },
  { href: '/subscription', label: 'Subscription', icon: Crown },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/40 dark:border-gray-700/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">ZhiYi</div>
          </Link>

          {/* Desktop Navigation - Icon + Label - 绝对居中 */}
          <div className="hidden lg:flex items-end justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={`relative flex flex-col items-center px-2 py-2 rounded-lg transition-all duration-200 min-w-0 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-center h-5 mb-1">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight break-words" style={{ maxWidth: '72px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{item.label}</span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Medium Screen Navigation - Compact - 绝对居中 */}
          <div className="hidden md:flex lg:hidden items-center justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 flex-shrink-0 ml-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-md"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              
              {/* Always show login/signup buttons for signed out users */}
              {!isSignedIn && (
                <>
                  <Link href={getSignInUrl('zhiyi-platform')}>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href={getSignUpUrl('zhiyi-platform')}>
                    <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md transition-colors shadow-md hover:shadow-lg">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}

              {/* Show additional features for signed in users */}
              {isSignedIn && (
                <>
                {/* Notifications */}
                <div className="relative group">
                  <Link
                    href="/notifications"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Notifications
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                  </div>
                </div>
                
                {/* Personal Center */}
                <div className="relative group">
                  <Link
                    href="/dashboard"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Dashboard"
                  >
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Dashboard
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                  </div>
                </div>
                
                {/* User Button - Always on the right */}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
                  {/* 移动端主题切换 */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Settings</span>
                      <ThemeToggle />
                    </div>
                  </div>
                  
                  {/* Signed In - Mobile */}
                  {isSignedIn && (
                    <>
                      <Link
                        href="/notifications"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      
                      {/* 退出登录按钮 - 移动端底部 */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}

                  {/* Signed Out - Mobile */}
                  {!isSignedIn && (
                    <>
                      <Link href={getSignInUrl('zhiyi-platform')}>
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full text-left"
                        >
                          <User className="h-4 w-4" />
                          <span>Sign In</span>
                        </button>
                      </Link>
                      <Link href={getSignUpUrl('zhiyi-platform')}>
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-colors w-full text-left shadow-md hover:shadow-lg"
                        >
                          <User className="h-4 w-4" />
                          <span>Sign Up</span>
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 