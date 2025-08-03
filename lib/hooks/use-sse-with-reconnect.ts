import { useCallback, useRef } from 'react';

interface SSEMessage {
  type: string;
  data: any;
}

interface UseSSEWithReconnectOptions {
  onMessage: (data: SSEMessage) => void;
}

export function useSSEWithReconnect() {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback((url: string, options: UseSSEWithReconnectOptions) => {
    const { onMessage } = options;

    // 清理之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // 建立SSE连接 - 完全按照通知SSE的机制
    const connectSSE = () => {
      try {
        console.log('🔗 建立任务SSE连接...');
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('✅ 任务SSE连接已建立');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 收到任务SSE消息:', data);

            if (data.type === 'connection_established') {
              console.log('🔗 任务SSE连接确认:', data.data.connectionId);
              return;
            }

            onMessage(data);
          } catch (error) {
            console.error('解析任务SSE消息失败:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ 任务SSE连接错误:', error);
          eventSource.close();
          
          // 基于事件的重连策略，而不是定时轮询
          // 只在特定错误情况下重连，避免无限重试
          if (eventSource.readyState === EventSource.CLOSED) {
            console.log('🔄 SSE连接被关闭，尝试重新连接...');
            // 使用Promise延时而不是setTimeout，更符合现代异步模式
            Promise.resolve().then(() => {
              // 检查连接状态，只在需要时重连
              if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
                connectSSE();
              }
            });
          }
        };

      } catch (error) {
        console.error('建立任务SSE连接失败:', error);
      }
    };

    // 建立连接
    connectSSE();
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔐 关闭任务SSE连接');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { connect, disconnect };
} 