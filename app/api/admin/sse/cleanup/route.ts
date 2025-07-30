import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cleanupAllSSEConnections, getSSEStats } from '@/lib/sse/init';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    // 获取清理前的统计信息
    const statsBefore = getSSEStats();
    
    // 执行清理
    cleanupAllSSEConnections();
    
    // 获取清理后的统计信息
    const statsAfter = getSSEStats();
    
    return NextResponse.json({
      success: true,
      message: "所有SSE连接已清理",
      stats: {
        before: statsBefore,
        after: statsAfter,
        cleaned: {
          taskConnections: statsBefore.taskConnections.totalConnections,
          notificationConnections: statsBefore.notificationConnections.totalConnections,
          total: statsBefore.total
        }
      }
    });
  } catch (error) {
    console.error("清理SSE连接时出错:", error);
    return NextResponse.json(
      { success: false, message: "清理SSE连接失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    // 获取当前SSE连接统计信息
    const stats = getSSEStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("获取SSE统计信息时出错:", error);
    return NextResponse.json(
      { success: false, message: "获取SSE统计信息失败" },
      { status: 500 }
    );
  }
} 