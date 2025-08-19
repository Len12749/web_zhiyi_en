'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@/hooks/use-auth';
import { LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
import { getSignOutUrl } from '@/lib/casdoor';

interface UserButtonProps {
  afterSignOutUrl?: string;
  appearance?: {
    elements?: {
      avatarBox?: string;
    };
  };
}

export function UserButton({ afterSignOutUrl = '/', appearance }: UserButtonProps) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Casdoor logout handles redirect internally, but for client-side consistency:
    window.location.href = afterSignOutUrl;
  };

  if (!user) {
    return null; // Should not happen if used with AuthGuard, but for safety
  }

  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.name}`;

  return (
    <div className="relative">
      {/* 用户头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${appearance?.elements?.avatarBox || ''}`}
        aria-label="User Profile"
      >
        <img 
          src={avatarUrl} 
          alt={user.displayName || user.name} 
          className="h-full w-full object-cover" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.name}`;
          }}
        />
        <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-500 bg-white dark:bg-slate-800 rounded-full p-0.5" />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 菜单内容 */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
            {/* 用户信息头部 */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img 
                  src={avatarUrl} 
                  alt={user.displayName || user.name}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.name}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.displayName || user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="py-1">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 mr-3" />
                Account Settings
              </Link>
              
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <UserIcon className="h-4 w-4 mr-3" />
                Dashboard
              </Link>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            {/* 登出按钮 */}
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}