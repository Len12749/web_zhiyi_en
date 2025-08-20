import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { ClerkProvider } from '@clerk/nextjs'; // 已替换为 Casdoor
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
  title: "Zpdf - Intelligent Document Processing Service",
  description: "AI-based document processing platform supporting PDF parsing, handwritten image recognition, document translation, format conversion and more",
  keywords: ["AI", "Document Processing", "PDF Parsing", "Translation", "Markdown"],
  authors: [{ name: "Zpdf" }],
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
    <html lang="en" suppressHydrationWarning>
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
  );
} 