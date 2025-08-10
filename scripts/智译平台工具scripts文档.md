# 智译平台工具scripts文档

## 概述

智译平台的`scripts`目录包含了一系列用于服务管理、启动和管理员操作的工具脚本。这些脚本为平台的运行、维护和管理提供了便捷的工具支持。主要包括：

1. **服务启动与管理脚本**：用于启动和管理各个微服务
2. **平台启动脚本**：用于启动Next.js前端应用
3. **管理员工具脚本**：用于管理用户积分、兑换码等后台操作

## 目录结构

```
scripts/
├── services/                      # 微服务管理脚本
│   ├── service-manager.bat        # 服务管理器（主控制面板）
│   ├── start-pdf-to-markdown.bat  # PDF解析服务启动脚本
│   ├── start-image-to-markdown.bat # 图片转Markdown服务启动脚本
│   ├── start-markdown-translation.bat # Markdown翻译服务启动脚本
│   ├── start-pdf-translation.bat  # PDF翻译服务启动脚本
│   └── start-format-conversion.bat # 格式转换服务启动脚本
├── start.js                       # Next.js应用启动脚本
└── admin_script.py                # 管理员工具脚本（积分系统管理）
```

## 服务管理脚本

### service-manager.bat

**功能**：智译平台服务管理器，提供图形化菜单界面，用于启动、管理和监控所有微服务。

**使用方法**：
1. 双击运行`service-manager.bat`
2. 在菜单中选择相应选项：
   - 选项1-5：启动单个服务
   - 选项A：启动所有服务
   - 选项S：检查服务状态
   - 选项Q：退出管理器

**主要功能**：
- 单独启动各个微服务
- 一键启动所有微服务
- 检查各服务运行状态
- 提供服务端口和环境信息

**示例输出**：
```
========================================
     ZhiYi Platform - Service Manager
========================================

Please select service to start:

[1] PDF to Markdown (Port 8002, docling env)
[2] Image to Markdown (Port 8004, docling env)  
[3] Markdown Translation (Port 8003, docling env)
[4] PDF Translation (Port 8005, test env)
[5] Format Conversion (Port 8001, docling env)

[A] Start All Services (Multi-terminal)
[S] Check Service Status
[Q] Exit

========================================
```

### 服务启动脚本

平台包含5个微服务启动脚本，每个脚本负责启动一个特定的服务：

1. **start-pdf-to-markdown.bat**
   - 功能：启动PDF解析服务
   - 端口：8002
   - 环境：docling

2. **start-image-to-markdown.bat**
   - 功能：启动图片转Markdown服务
   - 端口：8004
   - 环境：docling

3. **start-markdown-translation.bat**
   - 功能：启动Markdown翻译服务
   - 端口：8003
   - 环境：docling

4. **start-pdf-translation.bat**
   - 功能：启动PDF翻译服务
   - 端口：8005
   - 环境：test

5. **start-format-conversion.bat**
   - 功能：启动格式转换服务
   - 端口：8001
   - 环境：docling

**使用方法**：
- 直接双击运行对应脚本启动单个服务
- 或通过service-manager.bat统一管理

**脚本工作流程**：
1. 激活指定的Conda环境
2. 切换到相应服务目录
3. 设置环境变量
4. 启动Python服务

## 平台启动脚本

### start.js

**功能**：启动Next.js前端应用，并在启动前清理SSE连接。

**主要特点**：
- 在启动前自动清理所有SSE连接，确保连接状态干净
- 设置较长的请求超时时间，适应文档处理的长时间操作
- 处理进程退出和中断信号

**使用方法**：
```bash
node scripts/start.js
```

**关键参数**：
- `UNDICI_BODY_TIMEOUT=3600000`：请求体超时设置为1小时
- `UNDICI_HEADERS_TIMEOUT=300000`：请求头超时设置为5分钟
- 端口：3000

## 管理员工具脚本

### admin_script.py

**功能**：智译平台积分系统管理工具，提供交互式界面进行积分和用户管理。

**主要功能**：
1. **兑换码管理**
   - 创建新兑换码
   - 查看现有兑换码
   - 启用/禁用兑换码
   - 删除兑换码

2. **用户积分管理**
   - 查看用户列表
   - 查看用户详情
   - 修改用户积分
   - 查看用户积分交易记录

3. **无限积分设置**
   - 为指定用户设置无限积分
   - 取消用户的无限积分权限

**使用方法**：
```bash
python scripts/admin_script.py
```

**交互式界面**：
```
==================================================
🛠️  智译平台积分系统管理工具
==================================================
1. 💳 兑换码管理
2. 👤 用户积分管理
3. 🌟 无限积分设置
4. 📊 系统统计
0. 🚪 退出
```

**使用示例**：

1. **创建兑换码**：
   - 选择"兑换码管理" -> "创建新兑换码"
   - 输入积分值、最大使用次数和有效期
   - 系统生成兑换码并保存到数据库

2. **修改用户积分**：
   - 选择"用户积分管理" -> "修改用户积分"
   - 输入用户ID或邮箱
   - 输入要增加或减少的积分数量
   - 系统更新用户积分并记录交易

3. **设置无限积分**：
   - 选择"无限积分设置"
   - 输入用户ID或邮箱
   - 确认设置
   - 系统更新用户权限

## 注意事项

1. **环境依赖**：
   - 服务启动脚本依赖于Conda环境
   - 管理员脚本依赖于psycopg2-binary库

2. **数据库连接**：
   - 管理员脚本默认连接本地PostgreSQL数据库
   - 默认连接URL：`postgresql://postgres:postgres@127.0.0.1:54322/postgres`

3. **权限要求**：
   - 管理员脚本需要数据库写入权限
   - 服务启动脚本需要相应目录的访问权限

4. **错误处理**：
   - 所有脚本都包含基本的错误处理机制
   - 服务启动失败会显示相应错误信息
