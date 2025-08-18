import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { redeemCode } from "@/actions/points/point-actions";
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
          message: "User not authenticated",
          code: "UNAUTHORIZED",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request body format",
          code: "INVALID_JSON",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { code } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please enter a valid redemption code",
          code: "INVALID_REDEEM_CODE",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const result = await redeemCode(code.trim().toUpperCase());

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    }, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error("兑换码API错误:", error);
    
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
 