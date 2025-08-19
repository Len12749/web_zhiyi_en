import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由，不需要认证的页面
const publicRoutes = [
  '/',
  '/pdf-to-markdown',
  '/image-to-markdown', 
  '/markdown-translation',
  '/pdf-translation',
  '/format-conversion',
  '/file-history',
  '/notifications',
  '/login',
  '/signup',
  '/about',
];

// API 路由模式
const publicApiRoutes = [
  '/api/auth',
  '/api/webhooks',
  '/api/tasks/webhook',
];

function isPublicRoute(pathname: string): boolean {
  // 检查精确匹配的公开路由
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // 检查 API 路由
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return true;
  }
  
  // 检查静态文件
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return true;
  }
  
  return false;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 如果是公开路由，直接通过
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // 检查用户是否已认证 - 简单检查 cookie 是否存在
  const sessionCookie = request.cookies.get('casdoor-session');
  const authenticated = !!sessionCookie?.value;
  
  if (!authenticated) {
    // 未认证用户重定向到登录页
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 