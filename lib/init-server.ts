// 服务器端初始化文件
// 在应用启动时执行一次性的初始化操作

// 导入SSE管理器（不再自动执行清理）
import './sse/init';

// 静默检查环境变量，只在缺少时警告
if (typeof window === 'undefined') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CASDOOR_CLIENT_ID',
    'CASDOOR_CLIENT_SECRET',
    'DATA_STORAGE_PATH'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  缺少环境变量:', missingEnvVars.join(', '));
  }
} 