# 智译平台工具函数库lib文档

## 目录结构

```
lib/
├── processing/             # 文件处理相关工具
│   └── task-processor.ts   # 任务处理器
├── external/               # 外部服务集成
│   ├── core-services.ts    # 核心服务客户端
│   └── pdf-utils.ts        # PDF处理工具
├── hooks/                  # 自定义React hooks
│   ├── use-sse-with-reconnect.ts  # SSE连接hook
│   ├── use-notifications.ts        # 通知系统hook
│   └── use-scroll-animation.ts     # 滚动动画hook
├── sse/                    # SSE相关工具
│   ├── connection-manager.ts  # SSE连接管理器
│   ├── notification-manager.ts # 通知管理器
│   └── init.ts             # SSE初始化
├── utils/                  # 工具函数子目录
│   └── webhook-utils.ts    # Webhook工具
├── utils.ts                # 通用工具函数
├── init-server.ts          # 服务器初始化
├── pdf-utils.ts            # PDF工具
├── config.ts               # 应用配置
├── constants.ts            # 常量定义
└── test_sse.js             # SSE测试脚本
```

## 核心配置文件

### config.ts

包含应用的核心配置参数，使用TypeScript常量对象确保类型安全：

- **数据库配置**：连接URL
- **Clerk认证配置**：公钥、密钥、登录/注册URL
- **Supabase配置**：URL和密钥
- **文件存储配置**：存储路径、大小限制(300MB)、页数限制(800页)
- **积分系统配置**：初始积分(20)、签到积分(5)、各服务消费标准
- **SSE配置**：心跳间隔(30秒)、连接超时(1小时)、清理间隔(1分钟)
- **API配置**：基础URL、超时设置
- **外部服务配置**：各微服务端口设置

### constants.ts

定义应用中使用的常量和枚举值：

- **任务类型映射**：各种任务类型的中文标签
- **任务状态映射**：任务状态的中文描述
- **交易类型映射**：积分交易类型的中文描述
- **文件限制**：大小和页数限制
- **支持的文件类型**：按类别分组的文件扩展名
- **API路径**：应用中使用的API端点路径
- **错误和成功消息**：标准化的提示信息
- **积分规则**：各服务的积分计算标准
- **正则表达式**：常用的验证模式
- **时间常量**：任务过期时间和SSE相关时间设置

## 工具函数库 (utils.ts)

提供了丰富的通用工具函数：

- **类名合并**：`cn()` - 用于Tailwind类名合并
- **格式化函数**：
  - `formatFileSize()` - 文件大小格式化
  - `formatTime()` - 时间格式化
  - `formatRelativeTime()` - 相对时间格式化
  - `formatProgress()` - 进度格式化
- **文件操作**：
  - `getFileExtension()` - 获取文件扩展名
  - `isValidFileType()` - 验证文件类型
  - `validateFileFormat()` - 验证文件格式
  - `getFileFormatConfig()` - 获取文件格式配置
  - `getAcceptedExtensions()` - 获取接受的扩展名
  - `getAcceptedTypes()` - 获取接受的MIME类型
- **字符串处理**：
  - `generateRandomString()` - 生成随机字符串
  - `getErrorMessage()` - 获取错误信息
- **积分计算**：
  - `calculatePoints()` - 计算任务所需积分
- **异步操作**：
  - `withRetry()` - 带重试的异步操作
  - `ConcurrencyController` - 并发控制器
  - `makeApiRequest()` - API请求封装
- **函数优化**：
  - `debounce()` - 防抖函数
  - `throttle()` - 节流函数
- **URL处理**：
  - `buildUrl()` - 构建URL
- **剪贴板操作**：
  - `copyToClipboard()` - 复制到剪贴板

## SSE相关工具

### connection-manager.ts

实现了基于Server-Sent Events的实时通信管理：

- **TaskSSEManager类**：管理任务状态的SSE连接
  - `addConnection()` - 添加新连接
  - `removeConnection()` - 移除连接
  - `pushToTask()` - 向特定任务推送状态更新
  - `sendHeartbeat()` - 发送心跳保持连接
  - `cleanup()` - 清理所有连接
  - `getStats()` - 获取连接统计信息

注意：自动清理逻辑已移至启动脚本，避免模块导入时重复执行

### notification-manager.ts

管理用户通知的SSE连接：

- **NotificationSSEManager类**：
  - 管理用户通知连接
  - 支持向特定用户推送通知
  - 提供连接状态管理和心跳机制

注意：自动清理逻辑已移至启动脚本，避免模块导入时重复执行

## React Hooks

### use-sse-with-reconnect.ts

提供SSE连接的React Hook，支持自动重连：

- **useSSEWithReconnect**：
  - `connect()` - 建立SSE连接
  - `disconnect()` - 断开连接
  - 自动处理连接错误和重试
  - 支持消息处理回调

### use-notifications.ts

通知系统的React Hook：

- **useNotifications**：
  - `unreadCount` - 未读通知数量
  - `notifications` - 通知列表
  - `markAsRead()` - 标记通知已读
  - `refresh()` - 刷新通知
  - 自动定期检查新通知

### use-scroll-animation.ts

滚动动画效果的React Hook：

- **useScrollAnimation**：
  - 实现页面滚动时的动画效果
  - 支持元素进入视图时的动画触发

## 外部服务集成

### core-services.ts

提供与外部微服务的集成：

- **CoreServiceClient**：基础API客户端
  - 支持长时间运行的请求
  - 提供重试和超时机制
- **专用客户端**：
  - `PDFToMarkdownClient` - PDF解析服务
  - `ImageToMarkdownClient` - 图片转Markdown服务
  - `MarkdownTranslationClient` - Markdown翻译服务
  - `PDFTranslationClient` - PDF翻译服务
  - `FormatConversionClient` - 格式转换服务
- **CoreServiceManager**：统一管理所有服务客户端

### pdf-utils.ts

PDF文件处理工具：

- PDF页数计算
- PDF元数据提取
- PDF预处理功能

## 文件处理工具

### task-processor.ts

任务处理核心逻辑：

- **TaskProcessor类**：
  - 支持所有任务类型的处理
  - 集成SSE状态推送
  - 处理任务完成和失败逻辑
  - 积分计算和扣除
  - 文件保存和下载
- **任务类型定义**：
  - `pdf-to-markdown`
  - `image-to-markdown`
  - `markdown-translation`
  - `pdf-translation`
  - `format-conversion`
- **任务参数类型**：各任务类型的特定参数定义

## 服务器初始化

### init-server.ts

服务器启动时的初始化逻辑：

- 数据库连接初始化
- SSE管理器初始化
- 清理过期连接的定时任务设置