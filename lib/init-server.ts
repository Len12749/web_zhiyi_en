// 服务器端初始化文件
// 在应用启动时执行一次性的初始化操作

// 导入SSE管理器初始化
import './sse/init';

// 服务器启动时的其他初始化操作
if (typeof window === 'undefined') {
  console.log('🚀 智译平台服务器启动中...');
  
  // 记录启动时间
  const startTime = new Date().toISOString();
  console.log(`📅 服务器启动时间: ${startTime}`);
  
  // 检查环境变量
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATA_STORAGE_PATH'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  缺少环境变量:', missingEnvVars.join(', '));
  } else {
    console.log('✅ 所有必需的环境变量已配置');
  }
  
  console.log('�� 智译平台服务器启动完成');
} 