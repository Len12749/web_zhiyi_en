import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getPointsSummary } from "@/actions/points/point-actions";
import { getErrorMessage } from "@/lib/utils";

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const result = await getPointsSummary();

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    }, { 
      status: result.success ? 200 : 500 
    });
  } catch (error) {
    console.error("积分统计API错误:", error);
    
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
 