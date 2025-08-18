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
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0].emailAddress;

    // 初始化用户
    const result = await initializeUser(userId, email);

    if (result.success) {
      return NextResponse.json(result, { 
        status: result.user ? (result.message === "User already exists" ? 200 : 201) : 200 
      });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("用户初始化API错误:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 
 