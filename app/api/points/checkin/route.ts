import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { dailyCheckin } from "@/actions/points/point-actions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const result = await dailyCheckin();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { 
        status: result.message === "今日已签到" ? 409 : 500 
      });
    }
  } catch (error) {
    console.error("签到API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 