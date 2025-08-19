import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { CasdoorUser } from './casdoor';

const JWT_SECRET = process.env.CASDOOR_JWT_SECRET || 'fallback-secret';
const SESSION_COOKIE_NAME = 'casdoor-session';

export function auth(request?: NextRequest) {
  let token: string | undefined;
  
  if (request) {
    // 从请求中获取 token
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    // 从服务端 cookies 中获取 token
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) {
    return { userId: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.user?.id || null };
  } catch (error) {
    console.error('Token verification failed in auth():', error);
    return { userId: null };
  }
}

export async function currentUser(): Promise<CasdoorUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.user || null;
  } catch (error) {
    return null;
  }
}