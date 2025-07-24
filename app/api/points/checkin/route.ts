import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { dailyCheckin } from "@/actions/points/point-actions";
import { getErrorMessage } from "@/lib/utils";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "用户未认证",
          code: "UNAUTHORIZED",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const result = await dailyCheckin();

    // 根据业务逻辑返回不同的HTTP状态码
    let statusCode = 200;
    if (!result.success) {
      if (result.message === "今日已签到") {
        statusCode = 409; // Conflict
      } else {
        statusCode = 500; // Internal Server Error
      }
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    }, { status: statusCode });

  } catch (error) {
    console.error("签到API错误:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: getErrorMessage(error),
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
 