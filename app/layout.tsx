import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '../components/providers';
import { Navigation } from '../components/layout/navigation';
import GlobalNotification from '../components/common/global-notification';
import React from 'react';

// 导入服务器端初始化（只在服务器端执行）
if (typeof window === 'undefined') {
  require('../lib/init-server');
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智译平台 - 智能文档处理服务",
  description: "基于AI的文档处理平台，支持PDF解析、图片转Markdown、文档翻译、格式转换等功能",
  keywords: ["AI", "文档处理", "PDF解析", "翻译", "Markdown"],
  authors: [{ name: "智译平台" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Navigation />
            <main>
              {children}
            </main>
            <GlobalNotification />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
} 