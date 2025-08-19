import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { notificationSSEManager, generateRandomString } from "@/lib/sse/notification-manager";

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // 创建SSE流
    const stream = new ReadableStream({
      async start(controller) {
        const connectionId = generateRandomString(16);
        
        // 注册SSE连接
        notificationSSEManager.addConnection(connectionId, userId, controller);

        // 发送连接确认
        const initialMessage = {
          type: "connection_established",
          data: {
            connectionId,
            timestamp: new Date().toISOString()
          }
        };

        const data = `data: ${JSON.stringify(initialMessage)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        console.log(`📤 通知SSE连接确认已发送 [用户: ${userId}] [连接ID: ${connectionId}]`);

        // 设置连接关闭处理
        request.signal.addEventListener('abort', () => {
          console.log(`🔐 通知SSE连接中断 [用户: ${userId}] [连接ID: ${connectionId}]`);
          notificationSSEManager.removeConnection(connectionId);
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error("通知SSE连接错误:", error);
    return NextResponse.json(
              { success: false, message: "Failed to establish notification SSE connection" },
      { status: 500 }
    );
  }
}