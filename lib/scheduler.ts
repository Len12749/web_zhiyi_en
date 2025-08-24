import { processExpiredMemberships, distributeMonthlyPoints } from './membership-manager';

let schedulerRunning = false;
let intervalId: NodeJS.Timeout | null = null;

// 计算到下一天凌晨12点的毫秒数
function getMillisecondsUntilNextRun(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // 明天凌晨12点
  
  return tomorrow.getTime() - now.getTime();
}

// 执行会员维护任务
async function runMembershipTasks() {
  try {
    console.log('🕐 开始执行会员维护任务...', new Date().toISOString());

    // 处理过期会员
    const expiredResult = await processExpiredMemberships();
    console.log(`✅ 处理了 ${expiredResult.processed} 个过期会员`);

    // 发放积分
    const pointsResult = await distributeMonthlyPoints();
    console.log(`💰 为 ${pointsResult.distributed} 个用户发放了积分`);

    console.log('✅ 会员维护任务完成!');
  } catch (error) {
    console.error('❌ 会员维护任务失败:', error);
  }
}

// 启动调度器
export function startMembershipScheduler() {
  if (schedulerRunning) {
    // console.log('⚠️  会员调度器已在运行');
    return;
  }

  // 只在production环境下启动调度器
  if (process.env.NODE_ENV !== 'production') {
    // console.log('⚠️  开发环境下不启动调度器');
    return;
  }

  schedulerRunning = true;

  // 立即执行一次（可选）
  // runMembershipTasks();

  // 计算到下一次执行的时间
  const timeUntilNextRun = getMillisecondsUntilNextRun();
  console.log(`🚀 会员积分调度器已启动，下次执行时间: ${new Date(Date.now() + timeUntilNextRun).toLocaleString()}`);

  // 设置初始定时器
  setTimeout(() => {
    // 执行任务
    runMembershipTasks();

    // 然后每24小时执行一次
    intervalId = setInterval(() => {
      runMembershipTasks();
    }, 24 * 60 * 60 * 1000); // 24小时

  }, timeUntilNextRun);
}

// 停止调度器
export function stopMembershipScheduler() {
  if (!schedulerRunning) {
    console.log('⚠️  会员调度器未在运行');
    return;
  }

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  schedulerRunning = false;
  console.log('🛑 会员调度器已停止');
}

// 手动执行一次任务（用于测试）
export async function runMembershipTasksManually() {
  console.log('🔧 手动执行会员维护任务...');
  await runMembershipTasks();
}

// 获取调度器状态
export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    nextRun: schedulerRunning ? new Date(Date.now() + getMillisecondsUntilNextRun()).toISOString() : null
  };
}