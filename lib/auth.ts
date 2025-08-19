import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { CasdoorUser, UserSession } from './casdoor';

// JWT 密钥
const JWT_SECRET = process.env.CASDOOR_JWT_SECRET || 'fallback-secret';
const SESSION_COOKIE_NAME = 'casdoor-session';

// 验证 JWT Token
export function verifyToken(token: string): CasdoorUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.user || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 创建会话 Token
export function createSessionToken(user: CasdoorUser): string {
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天过期
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

// 从请求中获取用户信息
export function getUserFromRequest(request: NextRequest): CasdoorUser | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  
  return verifyToken(token);
}

// 从 cookies 中获取用户信息（服务端组件）
export function getUserFromCookies(): CasdoorUser | null {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  
  return verifyToken(token);
}

// 检查用户是否已登录
export function isAuthenticated(request?: NextRequest): boolean {
  if (request) {
    return getUserFromRequest(request) !== null;
  } else {
    return getUserFromCookies() !== null;
  }
}

// 获取当前用户
export function getCurrentUser(request?: NextRequest): CasdoorUser | null {
  if (request) {
    return getUserFromRequest(request);
  } else {
    return getUserFromCookies();
  }
}

// 创建会话 Cookie 选项
export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7天
  };
}

// 清除会话
export function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}