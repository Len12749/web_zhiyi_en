// SSE连接测试脚本
// 在浏览器控制台运行此脚本来测试SSE连接

function testSSEConnection(taskId) {
  console.log(`🔄 开始测试任务 ${taskId} 的SSE连接...`);
  
  const eventSource = new EventSource(`/api/sse/tasks/${taskId}`);
  
  eventSource.onopen = () => {
    console.log(`✅ SSE连接已建立，任务ID: ${taskId}`);
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`🔔 收到SSE消息:`, data);
      
      if (data.type === 'status_update') {
        console.log(`📊 状态更新: ${data.data?.status} ${data.data?.progress}% ${data.data?.message || ''}`);
      }
    } catch (error) {
      console.error(`❌ 消息解析失败:`, error, event.data);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error(`❌ SSE连接错误:`, error);
    eventSource.close();
  };
  
  // 10秒后关闭连接
  setTimeout(() => {
    console.log(`⏰ 测试结束，关闭SSE连接`);
    eventSource.close();
  }, 10000);
  
  return eventSource;
}

// 使用示例:
// testSSEConnection(123) // 替换为实际的任务ID

console.log('SSE测试脚本已加载，调用 testSSEConnection(taskId) 来测试'); 