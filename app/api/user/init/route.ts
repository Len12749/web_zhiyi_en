import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { initializeUser } from "@/actions/auth/user-actions";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user?.emailAddresses[0]?.emailAddress) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0].emailAddress;

    // 初始化用户
    const result = await initializeUser(userId, email);

    if (result.success) {
      return NextResponse.json(result, { 
        status: result.user ? (result.message === "用户已存在" ? 200 : 201) : 200 
      });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("用户初始化API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 
 