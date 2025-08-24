import { NextRequest, NextResponse } from 'next/server';
import { processExpiredMemberships, distributeMonthlyPoints } from '@/lib/membership-manager';
import { runMembershipTasksManually, getSchedulerStatus } from '@/lib/scheduler';

// 这个API可以通过cron job调用，建议每天运行一次
export async function POST(request: NextRequest) {
  try {
    // 简单的API密钥验证（生产环境中应该使用更安全的方式）
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.ADMIN_API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Running membership maintenance tasks...');

    // 处理过期会员
    const expiredResult = await processExpiredMemberships();
    console.log(`Processed ${expiredResult.processed} expired memberships`);

    // 发放每月积分
    const pointsResult = await distributeMonthlyPoints();
    console.log(`Distributed points to ${pointsResult.distributed} members`);

    return NextResponse.json({
      success: true,
      message: 'Membership tasks completed successfully',
      results: {
        expiredMemberships: expiredResult.processed,
        pointsDistributed: pointsResult.distributed
      }
    });

  } catch (error) {
    console.error('Error running membership tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 手动触发任务的GET端点（用于测试）
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return NextResponse.json(
      { success: false, message: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    console.log('Running membership maintenance tasks (development mode)...');

    // 使用统一的手动执行函数
    await runMembershipTasksManually();

    // 获取调度器状态
    const schedulerStatus = getSchedulerStatus();

    return NextResponse.json({
      success: true,
      message: 'Membership tasks completed successfully (development)',
      scheduler: schedulerStatus
    });

  } catch (error) {
    console.error('Error running membership tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}