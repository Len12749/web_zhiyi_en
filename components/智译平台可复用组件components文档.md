# 智译平台可复用组件components文档

本文档详细介绍了智译平台中的可复用组件，这些组件位于 `components` 目录下，按照功能和用途进行分类，为整个应用提供统一的界面元素和功能模块。

## 目录结构

```
components/
├── common/             # 通用业务组件
│   ├── auth-guard.tsx  # 认证守卫组件
│   ├── global-notification.tsx  # 全局通知组件
│   └── points-preview-card.tsx  # 积分预览卡片
├── layout/             # 布局组件
│   └── navigation.tsx  # 导航栏组件
├── providers/          # 全局 Provider
│   └── index.tsx       # Provider 入口
└── ui/                 # 基础 UI 组件
    ├── button.tsx      # 按钮组件
    └── theme-toggle.tsx  # 主题切换组件
```

## UI 基础组件

### Button

`components/ui/button.tsx` 是一个高度可定制的按钮组件，支持多种样式变体和尺寸。

#### 特点

- **多种变体**：支持 default、outline、ghost、link 四种样式
- **多种尺寸**：支持 default、sm、lg、icon 四种尺寸
- **支持子元素包装**：通过 asChild 属性支持包装子元素
- **完全类型化**：使用 TypeScript 提供完整的类型支持

#### 用法示例

```tsx
// 默认按钮
<Button>点击我</Button>

// 轮廓按钮
<Button variant="outline">轮廓按钮</Button>

// 小尺寸按钮
<Button size="sm">小按钮</Button>

// 图标按钮
<Button size="icon">
  <SomeIcon />
</Button>

// 链接按钮
<Button variant="link">链接样式</Button>
```

### ThemeToggle

`components/ui/theme-toggle.tsx` 是一个主题切换组件，用于在亮色和暗色主题之间切换。

## 通用业务组件

### AuthGuard

`components/common/auth-guard.tsx` 是一个认证守卫组件，用于保护需要用户登录才能访问的页面。

#### 特点

- **自动检测登录状态**：使用 Clerk 的 `useUser` hook 检测用户登录状态
- **加载状态处理**：在检查登录状态时显示加载动画
- **优雅的未登录提示**：未登录时显示友好的提示和登录按钮
- **支持自定义回退内容**：可以通过 fallback 属性自定义未登录时显示的内容
- **动画效果**：使用 Framer Motion 实现平滑的动画效果

#### 用法示例

```tsx
// 基本用法
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// 自定义未登录显示内容
<AuthGuard fallback={<CustomUnauthorizedContent />}>
  <ProtectedContent />
</AuthGuard>
```

### GlobalNotification

`components/common/global-notification.tsx` 是一个全局通知组件，用于显示系统通知、操作结果等信息。

#### 特点

- **实时通知**：通过 SSE (Server-Sent Events) 实现实时通知推送
- **多种通知类型**：支持 success、error、warning、info 四种类型
- **自动关闭**：支持通知自动关闭，可配置持续时间
- **动画效果**：使用 Framer Motion 实现平滑的进入和退出动画
- **自动标记已读**：通知显示后自动标记为已读

#### 通知数据结构

```typescript
interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}
```

## 布局组件

### Navigation

`components/layout/navigation.tsx` 是应用的主导航组件，提供了响应式的导航栏。

#### 特点

- **响应式设计**：适配桌面、平板和移动设备
- **图标导航**：在桌面端使用图标导航，节省空间
- **工具提示**：鼠标悬停时显示导航项名称
- **动画效果**：使用 Framer Motion 实现导航项的过渡动画
- **移动端菜单**：在移动设备上提供抽屉式菜单
- **活动状态指示**：当前页面的导航项有明显的活动状态标识
- **集成用户菜单**：右侧包含通知中心和用户菜单

#### 导航项配置

```typescript
const navigationItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/pdf-to-markdown', label: 'PDF解析', icon: FileText },
  { href: '/image-to-markdown', label: '图片转Markdown', icon: Image },
  { href: '/markdown-translation', label: 'Markdown翻译', icon: Languages },
  { href: '/pdf-translation', label: 'PDF翻译', icon: Globe },
  { href: '/format-conversion', label: '格式转换', icon: RefreshCw },
  { href: '/file-history', label: '文件历史', icon: History },
  { href: '/about', label: '关于我们', icon: Info },
];
```

## Provider 组件

### Providers

`components/providers/index.tsx` 是应用的 Provider 入口，用于提供全局状态和功能。

#### 特点

- **组合多个 Provider**：可以在这里组合多个 Provider，如主题、状态管理等
- **类型安全**：使用 TypeScript 确保类型安全

#### 用法示例

```tsx
// 在 layout.tsx 中使用
<Providers>
  <App />
</Providers>
```
