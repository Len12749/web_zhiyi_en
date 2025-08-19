// Casdoor 配置
export const casdoorConfig = {
  get endpoint() { return process.env.NEXT_PUBLIC_CASDOOR_ENDPOINT! },
  get clientId() { return process.env.NEXT_PUBLIC_CASDOOR_CLIENT_ID! },
  get organization() { return process.env.NEXT_PUBLIC_CASDOOR_ORGANIZATION! },
  get application() { return process.env.NEXT_PUBLIC_CASDOOR_APPLICATION! },
  get redirectUri() { return process.env.CASDOOR_REDIRECT_URI! },
  get homeUrl() { return process.env.CASDOOR_HOME_URL! },
};

// 生成登录 URL
export function getSignInUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: casdoorConfig.clientId,
    response_type: 'code',
    redirect_uri: casdoorConfig.redirectUri,
    scope: 'read',
    state: state || casdoorConfig.application,
  });
  return `${casdoorConfig.endpoint}/login/oauth/authorize?${params.toString()}`;
}

// 生成注册 URL  
export function getSignUpUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: casdoorConfig.clientId,
    response_type: 'code',
    redirect_uri: casdoorConfig.redirectUri,
    scope: 'read',
    state: state || casdoorConfig.application,
  });
  return `${casdoorConfig.endpoint}/signup/oauth/authorize?${params.toString()}`;
}

// 生成登出 URL
export function getSignOutUrl(): string {
  return `${casdoorConfig.endpoint}/logout?redirect_uri=${encodeURIComponent(casdoorConfig.homeUrl)}`;
}

// 用户信息类型定义
export interface CasdoorUser {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  organization: string;
  type: string;
  isAdmin: boolean;
  createdTime: string;
  updatedTime: string;
}

// 会话信息类型定义
export interface UserSession {
  user: CasdoorUser;
  token: string;
  expiresAt: number;
}