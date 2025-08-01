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
          
          // 3秒后重连 - 和通知SSE一样
          setTimeout(() => {
            console.log('🔄 重新连接任务SSE...');
            connectSSE();
          }, 3000);
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