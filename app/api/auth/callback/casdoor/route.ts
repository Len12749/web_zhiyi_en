import { NextRequest, NextResponse } from 'next/server';
import { casdoorConfig } from '@/lib/casdoor';
import { createSessionToken, getSessionCookieOptions } from '@/lib/auth';
import { initializeUser } from '@/actions/auth/user-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${casdoorConfig.homeUrl}/login?error=missing_code`);
    }

    // 向 Casdoor 交换访问令牌
    const tokenResponse = await fetch(`${casdoorConfig.endpoint}/api/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: casdoorConfig.clientId,
        client_secret: process.env.CASDOOR_CLIENT_SECRET,
        code,
        redirect_uri: casdoorConfig.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${casdoorConfig.homeUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    
    // 使用访问令牌获取用户信息
    const userResponse = await fetch(`${casdoorConfig.endpoint}/api/get-account`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text());
      return NextResponse.redirect(`${casdoorConfig.homeUrl}/login?error=user_info_failed`);
    }

    const userData = await userResponse.json();
    const userInfo = {
      id: userData.name, // Casdoor 使用 name 作为唯一标识符
      name: userData.name,
      displayName: userData.displayName || userData.name,
      email: userData.email,
      avatar: userData.avatar,
      organization: userData.organization,
      type: userData.type || 'normal',
      isAdmin: userData.isAdmin || false,
      createdTime: userData.createdTime,
      updatedTime: userData.updatedTime,
    };

    // 初始化用户（仅首次创建，已有用户不更新邮箱）
    try {
      await initializeUser(userInfo.id, userInfo.email || '');
    } catch (e) {
      console.error('initializeUser failed:', e);
      // 不阻断登录流程
    }

    // 创建会话 token
    const sessionToken = createSessionToken(userInfo);

    // 设置会话 cookie
    const cookieOptions = getSessionCookieOptions();
    const response = NextResponse.redirect(`${casdoorConfig.homeUrl}/dashboard`);
    
    // 记录登录成功
    console.log('用户登录成功:', userInfo.name);
    
    response.cookies.set(cookieOptions.name, sessionToken, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
      domain: cookieOptions.domain, // 添加域名设置
    });

    return response;

  } catch (error) {
    console.error('Casdoor callback error:', error);
    return NextResponse.redirect(`${casdoorConfig.homeUrl}/login?error=auth_failed`);
  }
}