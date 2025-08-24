import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/lib/scheduler';

// 获取调度器状态（开发环境）
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return NextResponse.json(
      { success: false, message: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const status = getSchedulerStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        schedulerRunning: status.running,
        nextRunTime: status.nextRun,
        serverTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}