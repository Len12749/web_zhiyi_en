import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 清除会话 cookie
    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.json({ success: true });
    
    response.cookies.set(cookieOptions.name, '', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: 0, // 立即过期
      domain: cookieOptions.domain, // 添加域名设置
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // 重定向到首页
  return NextResponse.redirect(new URL('/', request.url));
}