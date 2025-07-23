export const config = {
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  // Clerk 认证配置
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/login',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/signup',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
  },
  
  // Supabase 配置
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // 文件存储配置
  storage: {
    basePath: process.env.DATA_STORAGE_PATH || 'E:/zhiyi_data',
    maxFileSize: 300 * 1024 * 1024, // 300MB
    maxPages: 800,
    allowedFileTypes: ['.pdf', '.md', '.jpg', '.jpeg', '.png', '.gif'],
    taskExpiryDays: 7,
  },
  
  // 积分系统配置
  points: {
    initial: 20,           // 注册初始积分
    dailyCheckin: 5,       // 每日签到积分
    
    // 消费标准
    pdfToMarkdown: 5,      // PDF解析每页
    imageToMarkdown: 5,    // 图片转markdown每张
    markdownTranslation: 5, // Markdown翻译每KB
    pdfTranslation: 3,     // PDF翻译每页
    formatConversion: 2,   // 格式转换每页
  },
  
  // SSE 配置
  sse: {
    heartbeatInterval: 30000,    // 30秒心跳
    connectionTimeout: 3600000,  // 1小时超时
    cleanupInterval: 60000,      // 1分钟清理间隔
  },
  
  // API 配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  
  // 外部服务配置
  external: {
    // core_module 服务端口配置
    pdfToMarkdown: 'http://localhost:8001',
    imageToMarkdown: 'http://localhost:8002', 
    markdownTranslation: 'http://localhost:8003',
    pdfTranslation: 'http://localhost:8004',
    formatConversion: 'http://localhost:8005',
  },
} as const; 
 