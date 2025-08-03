#!/usr/bin/env node

// 启动脚本：确保每次启动时清理SSE连接
const { spawn } = require('child_process');
const path = require('path');

// 静默清理SSE连接
(async () => {
  try {
    const { cleanupAllSSEConnections } = await import('../lib/sse/init.js');
    cleanupAllSSEConnections();
  } catch (error) {
    // 静默处理，避免在build时报错
  }
})();

// 启动Next.js应用
const nextProcess = spawn('cross-env', [
  'UNDICI_BODY_TIMEOUT=3600000',
  'UNDICI_HEADERS_TIMEOUT=300000',
  'next',
  'start',
  '-p',
  '3000'
], {
  stdio: 'inherit',
  shell: true,
  cwd: path.dirname(__dirname)
});

// 处理进程退出（静默）
nextProcess.on('close', (code) => {
  process.exit(code);
});

// 处理中断信号（静默）
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
});