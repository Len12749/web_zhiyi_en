# 智译平台前端app文档

本文档详细介绍了智译平台前端 app 目录的结构、页面组件和 API 路由。App 目录采用 Next.js 15 的 App Router 架构，实现了前端页面渲染和 API 路由功能。

## 目录结构

```
app/
├── (auth)/                # 认证相关页面
│   ├── login/             # 登录页面
│   └── signup/            # 注册页面
├── api/                   # API 路由
│   ├── admin/             # 管理员 API
│   ├── files/             # 文件相关 API
│   ├── notifications/     # 通知相关 API
│   ├── points/            # 积分相关 API
│   ├── sse/               # SSE 连接端点
│   ├── tasks/             # 任务相关 API
│   └── user/              # 用户相关 API
├── dashboard/             # 仪表盘页面
├── file-history/          # 文件历史页面
├── format-conversion/     # 格式转换功能页面
├── image-to-markdown/     # 图片转 Markdown 功能页面
├── markdown-translation/  # Markdown 翻译功能页面
├── notifications/         # 通知中心页面
├── pdf-to-markdown/       # PDF 解析功能页面
├── pdf-translation/       # PDF 翻译功能页面
├── profile/               # 用户个人资料页面
├── about/                 # 关于页面
├── globals.css            # 全局样式
├── layout.tsx             # 根布局组件
└── page.tsx               # 首页
```

## 核心文件

### layout.tsx

根布局组件，定义了整个应用的基础结构，包括：

- 使用 `ClerkProvider` 提供用户认证
- 设置全局元数据和视口配置
- 引入全局样式和字体
- 集成导航栏和全局通知组件
- 服务器端初始化

```tsx
// 根布局组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Navigation />
            <main>
              {children}
            </main>
            <GlobalNotification />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### page.tsx

首页组件，展示平台的主要功能和介绍：

- 使用 `"use client"` 声明为客户端组件
- 展示六大核心功能卡片，包括：
  - PDF 解析
  - 图片转 Markdown
  - Markdown 翻译
  - PDF 翻译
  - 格式转换
  - 文件历史
- 使用 Framer Motion 实现动画效果
- 展示平台优势和团队信息
- 根据用户登录状态显示不同内容

## 功能模块页面

### pdf-to-markdown/page.tsx

PDF 解析功能页面，实现了：

- 文件上传（支持拖放）
- PDF 页数检测
- 表格处理模式选择（Markdown 或图片）
- 翻译选项配置
- 任务处理状态实时更新（通过 SSE）
- 结果下载

```tsx
// PDF 解析页面组件
export default function PDFToMarkdownPage() {
  // 状态管理
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });
  
  // 处理参数
  const [tableMode, setTableMode] = useState<'markdown' | 'image'>('markdown');
  const [enableTranslation, setEnableTranslation] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [outputOptions, setOutputOptions] = useState<string[]>(['original']);
  
  // 文件处理逻辑
  // ...
}
```

其他功能模块页面（如 `image-to-markdown`、`markdown-translation` 等）采用类似的结构和模式。

## API 路由

### api/tasks/create/route.ts

任务创建 API 路由，处理文件处理任务的创建：

- 验证用户认证
- 检查文件大小限制
- 计算所需积分
- 创建任务记录
- 异步启动任务处理
- 返回 SSE 连接 URL

```ts
export async function POST(request: NextRequest) {
  // 验证用户认证
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "用户未认证" },
      { status: 401 }
    );
  }
  
  // 解析请求体和创建任务
  // ...
  
  // 延迟启动任务处理
  setTimeout(async () => {
    try {
      await processTaskAsync(result.taskId!, userId, taskType, inputStoragePath, processingParams);
    } catch (error) {
      // 错误处理
    }
  }, 500);
  
  // 返回响应
  // ...
}
```

### api/sse/tasks/[taskId]/route.ts

任务 SSE 连接 API 路由，实现实时状态更新：

- 验证用户认证和任务权限
- 创建 SSE 流
- 注册 SSE 连接
- 发送连接确认和初始状态
- 处理连接关闭

```ts
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  // 验证用户和任务
  // ...
  
  // 创建 SSE 流
  const stream = new ReadableStream({
    async start(controller) {
      const connectionId = generateRandomString(16);
      
      // 注册 SSE 连接
      sseConnectionManager.addConnection(connectionId, userId, taskId, controller);
      
      // 发送连接确认和初始状态
      // ...
      
      // 设置连接关闭处理
      request.signal.addEventListener('abort', () => {
        sseConnectionManager.removeConnection(connectionId);
      });
    },
  });
  
  // 返回 SSE 响应
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      // ...
    },
  });
}
```

其他 API 路由实现了文件上传、任务状态查询、结果下载、积分管理、通知系统等功能。

## 技术实现特点

1. **客户端组件**：所有页面组件使用 `"use client"` 声明为客户端组件，支持交互和状态管理

2. **SSE 实时更新**：使用 Server-Sent Events 实现任务处理状态的实时更新

3. **拖放上传**：支持文件拖放上传，提升用户体验

4. **状态管理**：使用 React 的 useState 和 useCallback 管理组件状态

5. **动画效果**：使用 Framer Motion 实现页面动画效果

6. **响应式设计**：适配不同屏幕尺寸的响应式布局

7. **认证集成**：与 Clerk 认证系统无缝集成

8. **错误处理**：完善的错误捕获和用户反馈机制

## 页面组织和路由

智译平台采用 Next.js 15 的 App Router 架构，页面组织遵循以下规则：

1. 每个功能模块对应一个目录，包含 `page.tsx` 文件和 `_components` 子目录
2. API 路由按功能分类，位于 `api` 目录下
3. 认证相关页面放在 `(auth)` 目录（使用括号表示路由分组）
4. 全局组件和布局放在根目录

## SSE 实时更新机制

智译平台使用 Server-Sent Events (SSE) 实现任务处理状态的实时更新：

1. 任务创建后，返回 SSE 连接 URL
2. 前端建立 EventSource 连接
3. 后端将连接注册到 SSE 管理器
4. 任务处理过程中，通过 SSE 推送状态更新
5. 前端实时显示处理进度和状态
6. 连接关闭时，从 SSE 管理器移除连接

这种机制避免了传统的轮询方式，提高了实时性和效率。

## 页面组件结构

每个功能页面的组件结构通常包括：

1. **文件上传区域**：支持拖放和点击上传
2. **参数配置区域**：设置处理参数和选项
3. **处理状态区域**：显示任务处理进度和状态
4. **结果展示区域**：提供下载按钮和结果预览

这种一致的结构确保了用户在不同功能间的无缝体验。