# 智译平台后端actions文档



## 目录结构

```cmd
actions/
├── auth/                # 用户认证相关操作
│   └── user-actions.ts  # 用户操作
├── points/              # 积分相关操作
│   └── point-actions.ts # 积分操作
├── notifications/       # 通知相关操作
│   └── notification-actions.ts # 通知操作
├── tasks/               # 任务管理操作
│   └── task-actions.ts  # 任务操作
└── files/               # 文件管理操作（目前为空）
```

## 1. 用户认证 (auth)

### user-actions.ts

这个文件处理用户认证和用户信息管理，包括：

#### 主要功能：

1. **初始化用户**：`initializeUser(clerkId, email)`
   - 首次登录时调用
   - 检查用户是否已存在
   - 创建新用户并赠送初始积分（20积分）
   - 记录初始积分交易

2. **获取当前用户信息**：`getCurrentUser()`
   - 使用 Clerk 认证获取当前登录用户
   - 从数据库获取用户详细信息

3. **更新用户积分**：`updateUserPoints(clerkId, pointsChange, description)`
   - 增加或扣除用户积分
   - 支持无限积分用户（只记录交易但不改变余额）
   - 检查积分余额是否足够
   - 记录积分交易

#### 数据结构：

```typescript
export interface User {
  id: number;
  clerkId: string;
  email: string;
  points: number;
  hasInfinitePoints: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 2. 积分系统 (points)

### point-actions.ts

这个文件处理积分相关的操作，包括签到、兑换码和积分历史。

#### 主要功能：

1. **每日签到**：`dailyCheckin()`
   - 检查用户今天是否已签到
   - 签到成功后增加5积分
   - 记录签到历史
   - 创建签到成功通知

2. **检查今日是否已签到**：`checkTodayCheckin()`
   - 查询当天是否已有签到记录

3. **兑换码兑换**：`redeemCode(code)`
   - 验证兑换码是否存在且有效
   - 检查兑换码是否过期
   - 检查使用次数限制
   - 检查用户是否已使用过此兑换码
   - 增加用户积分
   - 记录兑换历史
   - 更新兑换码使用次数

4. **获取积分交易历史**：`getPointTransactions(limit)`
   - 获取用户的积分交易记录

5. **获取签到历史**：`getCheckinHistory(limit)`
   - 获取用户的签到记录

6. **获取用户积分统计**：`getPointsSummary()`
   - 获取当前积分余额
   - 是否拥有无限积分
   - 总共获得的积分
   - 总共消费的积分
   - 今日是否已签到

#### 数据结构：

```typescript
export interface PointTransaction {
  id: number;
  userId: string;
  taskId: number | null;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: Date;
}

export interface CheckinRecord {
  id: number;
  userId: string;
  checkinDate: string;
  pointsEarned: number;
  createdAt: Date;
}
```

## 3. 通知系统 (notifications)

### notification-actions.ts

这个文件处理系统通知的创建和管理。

#### 主要功能：

1. **创建通知**：`createNotification(userId, type, title, message, taskId?)`
   - 支持四种通知类型：success、warning、info、error
   - 通过 SSE 实时推送通知给用户
   - 将通知保存到数据库

2. **获取用户通知**：`getUserNotifications(countOnly?)`
   - 获取30天内的用户通知
   - 支持只获取未读数量
   - 按创建时间倒序排列

3. **标记通知为已读**：`markNotificationAsRead(notificationId)`
   - 将单个通知标记为已读

4. **标记所有通知为已读**：`markAllNotificationsAsRead()`
   - 将用户所有未读通知标记为已读

5. **删除通知**：`deleteNotification(notificationId)`
   - 删除单个通知

6. **批量删除通知**：`deleteNotifications(notificationIds)`
   - 批量删除多个通知

7. **清理过期通知**：`cleanupExpiredNotifications()`
   - 删除30天前的所有通知

#### 数据结构：

```typescript
export type NotificationType = 'success' | 'warning' | 'info' | 'error';
```

## 4. 任务管理 (tasks)

### task-actions.ts

这个文件处理文件处理任务的创建和管理，是平台的核心业务逻辑。

#### 主要功能：

1. **创建处理任务**：`createProcessingTask(taskType, inputFilename, inputFileSize, inputStoragePath, processingParams, pageCount?)`
   - 根据任务类型计算所需积分
   - 检查用户积分是否足够（但不扣除）
   - 创建任务记录，记录所需积分

2. **获取用户任务列表**：`getUserTasks(limit)`
   - 获取用户的任务历史记录

3. **根据ID获取任务**：`getTaskById(taskId, skipUserCheck)`
   - 获取任务详细信息
   - 支持跳过用户权限检查（用于内部调用）

4. **更新任务状态**：`updateTaskStatus(taskId, status, progressPercent?, statusMessage?, externalTaskId?)`
   - 更新任务处理状态
   - 记录处理进度
   - 记录开始和完成时间

5. **完成任务**：`completeTask(taskId, resultStoragePath, resultFileSize, resultFilename)`
   - 标记任务为完成状态
   - 记录处理结果信息（不扣除积分）
   - 创建完成通知

6. **任务失败**：`failTask(taskId, errorCode, errorMessage)`
   - 标记任务为失败状态
   - 记录错误信息（不需要返还积分，因为未扣除）
   - 推送失败状态到 SSE
   - 创建失败通知

7. **删除任务**：`deleteTask(taskId)`
   - 验证任务归属
   - 删除任务记录

#### 数据结构：

```typescript
export interface ProcessingTask {
  id: number;
  userId: string;
  taskType: string;
  taskStatus: string;
  progressPercent: number;
  statusMessage: string | null;
  inputFilename: string;
  inputFileSize: number;
  inputStoragePath: string;
  processingParams: any;
  externalTaskId: string | null;
  requiredPoints: number;
  hasBeenDownloaded: boolean;
  resultStoragePath: string | null;
  resultFileSize: number | null;
  resultFilename: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date;
}
```

## 5. 文件管理 (files)

目前 files 目录为空，文件上传和管理功能可能通过 API 路由直接实现，或者尚未完成开发。

## 技术实现特点

1. **服务器端操作**：所有文件都使用 `"use server";` 声明，确保代码在服务器端执行

2. **Clerk 认证集成**：使用 `auth()` 函数获取当前用户信息

3. **Drizzle ORM**：使用 Drizzle ORM 进行数据库操作，如 `db.select()`, `db.insert()`, `db.update()`, `db.delete()`

4. **SSE 实时通知**：通过 Server-Sent Events 实现实时状态更新和通知推送

5. **积分系统**：完整的积分计算、扣除和返还机制

6. **错误处理**：所有操作都有完善的错误处理和日志记录

7. **权限验证**：任务操作前验证用户权限，确保安全性

## 业务流程示例

### PDF 解析任务流程

1. 用户上传 PDF 文件
2. 调用 `createProcessingTask('pdf-to-markdown', ...)` 创建任务
3. 系统计算所需积分并检查是否足够（不扣除）
4. 任务开始处理，通过 SSE 推送实时进度
5. 处理完成后，调用 `completeTask(...)` 更新任务状态
6. 系统发送通知给用户，用户可查看处理结果
7. 用户首次下载文件时，系统检查并扣除积分
8. 如果处理失败，调用 `failTask(...)` 记录错误并通知用户

### 积分兑换流程

1. 用户输入兑换码
2. 调用 `redeemCode(code)` 验证兑换码
3. 系统检查兑换码有效性和使用限制
4. 增加用户积分并记录交易
5. 更新兑换码使用次数

### 每日签到流程

1. 用户点击签到
2. 调用 `dailyCheckin()` 检查是否已签到
3. 增加用户积分并记录签到
4. 发送签到成功通知