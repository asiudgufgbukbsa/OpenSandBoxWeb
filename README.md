# OpenSandbox Admin

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

### Overview

OpenSandbox Admin is a modern web-based management console for **OpenSandbox** - a lightweight, secure sandbox environment orchestration platform. This admin dashboard provides a comprehensive interface for managing containerized sandbox instances, monitoring resource usage, and controlling sandbox lifecycles.

### Features

- **Dashboard Overview** - Real-time statistics of sandbox states (Running, Paused, Pending, Failed)
- **Sandbox Management**
  - Create single or batch sandboxes from container images
  - Pause, resume, and delete sandbox instances
  - View detailed sandbox information and configurations
  - Filter and search sandboxes by state or metadata
- **Real-time Metrics** - Live CPU and memory monitoring with SSE (Server-Sent Events)
- **TTL Management** - Extend sandbox expiration time with flexible duration options
- **Batch Operations** - Create multiple sandboxes via JSON import or manual input
- **Responsive Design** - Modern UI built with Element Plus components

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | ^3.5.32 | Frontend framework |
| TypeScript | ~6.0.2 | Type safety |
| Vite | ^8.0.4 | Build tool |
| Pinia | ^3.0.4 | State management |
| Vue Router | ^5.0.4 | Routing |
| Element Plus | ^2.13.6 | UI components |
| ECharts | ^6.0.0 | Data visualization |
| Axios | ^1.14.0 | HTTP client |
| Sass | ^1.99.0 | CSS preprocessing |

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0
- OpenSandbox Lifecycle API server running on backend

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sandboxfront

# Install dependencies
npm install
```

### Configuration

Create environment files in the project root:

**`.env.development`** (Development)
```env
# OpenSandbox Lifecycle API
VITE_LIFECYCLE_API=http://localhost:8080/v1
```

**`.env.production`** (Production)
```env
# Production environment
VITE_LIFECYCLE_API=/api/v1
```

> **Note:** The Lifecycle API is the only endpoint you need to configure. Metrics endpoints are dynamically retrieved per sandbox.

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── api/                    # API client and types
│   ├── index.ts           # Axios instance configuration
│   ├── sandbox.ts         # Sandbox API methods
│   ├── metrics.ts         # Metrics API (SSE support)
│   └── types.ts           # TypeScript type definitions
├── components/            # Vue components
│   ├── common/           # Shared components (StatusBadge, ConfirmDialog)
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── metrics/          # Metrics visualization (Gauges, Charts)
│   └── sandbox/          # Sandbox-specific components
├── composables/          # Vue composables
│   └── usePolling.ts     # Auto-refresh polling hook
├── router/               # Vue Router configuration
├── stores/               # Pinia stores
│   ├── sandbox.ts        # Sandbox state management
│   ├── metrics.ts        # Metrics state management
│   └── notification.ts   # Toast notifications
├── styles/               # Global styles
├── utils/                # Utility functions
│   ├── constants.ts      # Application constants
│   ├── format.ts         # Formatting utilities
│   └── validators.ts     # Form validators
└── views/                # Page components
    ├── Dashboard.vue     # Main dashboard
    ├── SandboxList.vue   # Sandbox listing
    ├── SandboxDetail.vue # Sandbox details & metrics
    ├── CreateSandbox.vue # Single sandbox creation
    ├── BatchCreate.vue   # Batch creation wizard
    └── Settings.vue      # Application settings
```

### API Integration

The admin console integrates with the OpenSandbox Lifecycle API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sandboxes` | GET | List sandboxes with pagination |
| `/sandboxes` | POST | Create a new sandbox |
| `/sandboxes/:id` | GET | Get sandbox details |
| `/sandboxes/:id` | DELETE | Delete a sandbox |
| `/sandboxes/:id/pause` | POST | Pause a running sandbox |
| `/sandboxes/:id/resume` | POST | Resume a paused sandbox |
| `/sandboxes/:id/renew-expiration` | POST | Extend TTL |
| `/sandboxes/:id/endpoints/:port` | GET | Get endpoint for metrics |

### Screenshots

*Screenshots will be added here*

### License

MIT License

---

<a name="中文"></a>
## 中文

### 项目简介

OpenSandbox Admin 是 **OpenSandbox** 的现代化 Web 管理控制台 —— 一个轻量级、安全的沙箱环境编排平台。该管理面板提供了完整的界面来管理容器化沙箱实例、监控资源使用情况以及控制沙箱生命周期。

### 功能特性

- **仪表盘概览** - 实时统计沙箱状态（运行中、已暂停、创建中、失败）
- **沙箱管理**
  - 从容器镜像创建单个或批量沙箱
  - 暂停、恢复和删除沙箱实例
  - 查看详细的沙箱信息和配置
  - 按状态或元数据过滤和搜索沙箱
- **实时监控** - 通过 SSE（服务器推送事件）实时监控 CPU 和内存使用
- **TTL 管理** - 灵活的过期时间延长选项
- **批量操作** - 通过 JSON 导入或手动输入批量创建沙箱
- **响应式设计** - 基于 Element Plus 组件构建的现代 UI

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5.32 | 前端框架 |
| TypeScript | ~6.0.2 | 类型安全 |
| Vite | ^8.0.4 | 构建工具 |
| Pinia | ^3.0.4 | 状态管理 |
| Vue Router | ^5.0.4 | 路由 |
| Element Plus | ^2.13.6 | UI 组件库 |
| ECharts | ^6.0.0 | 数据可视化 |
| Axios | ^1.14.0 | HTTP 客户端 |
| Sass | ^1.99.0 | CSS 预处理 |

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0
- 后端运行 OpenSandbox Lifecycle API 服务

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd sandboxfront

# 安装依赖
npm install
```

### 配置

在项目根目录创建环境配置文件：

**`.env.development`**（开发环境）
```env
# OpenSandbox Lifecycle API
VITE_LIFECYCLE_API=http://localhost:8080/v1
```

**`.env.production`**（生产环境）
```env
# 生产环境
VITE_LIFECYCLE_API=/api/v1
```

> **注意：** Lifecycle API 是唯一需要配置的地址，监控端点会针对每个沙箱动态获取。

### 开发

```bash
# 启动开发服务器
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建

```bash
# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

### 项目结构

```
src/
├── api/                    # API 客户端和类型定义
│   ├── index.ts           # Axios 实例配置
│   ├── sandbox.ts         # 沙箱 API 方法
│   ├── metrics.ts         # 监控 API（支持 SSE）
│   └── types.ts           # TypeScript 类型定义
├── components/            # Vue 组件
│   ├── common/           # 通用组件（状态徽章、确认对话框）
│   ├── layout/           # 布局组件（头部、侧边栏）
│   ├── metrics/          # 监控可视化（仪表盘、图表）
│   └── sandbox/          # 沙箱相关组件
├── composables/          # Vue 组合式函数
│   └── usePolling.ts     # 自动刷新轮询钩子
├── router/               # Vue Router 配置
├── stores/               # Pinia 状态存储
│   ├── sandbox.ts        # 沙箱状态管理
│   ├── metrics.ts        # 监控数据状态管理
│   └── notification.ts   # 消息通知
├── styles/               # 全局样式
├── utils/                # 工具函数
│   ├── constants.ts      # 应用常量
│   ├── format.ts         # 格式化工具
│   └── validators.ts     # 表单验证器
└── views/                # 页面组件
    ├── Dashboard.vue     # 主仪表盘
    ├── SandboxList.vue   # 沙箱列表
    ├── SandboxDetail.vue # 沙箱详情与监控
    ├── CreateSandbox.vue # 单个沙箱创建
    ├── BatchCreate.vue   # 批量创建向导
    └── Settings.vue      # 应用设置
```

### API 集成

管理控制台与 OpenSandbox Lifecycle API 集成：

| 接口 | 方法 | 描述 |
|------|------|------|
| `/sandboxes` | GET | 分页获取沙箱列表 |
| `/sandboxes` | POST | 创建新沙箱 |
| `/sandboxes/:id` | GET | 获取沙箱详情 |
| `/sandboxes/:id` | DELETE | 删除沙箱 |
| `/sandboxes/:id/pause` | POST | 暂停运行中的沙箱 |
| `/sandboxes/:id/resume` | POST | 恢复已暂停的沙箱 |
| `/sandboxes/:id/renew-expiration` | POST | 延长过期时间 |
| `/sandboxes/:id/endpoints/:port` | GET | 获取监控端点 |

### 主要页面说明

#### 仪表盘 (Dashboard)
- 展示沙箱状态统计卡片（运行中、已暂停、创建中、失败）
- 提供快捷操作按钮（创建沙箱、批量创建、刷新列表）
- 显示最近创建的沙箱列表

#### 沙箱列表 (Sandbox List)
- 支持按状态筛选和关键词搜索
- 分页展示所有沙箱
- 支持批量选择和删除操作
- 每 30 秒自动刷新数据

#### 沙箱详情 (Sandbox Detail)
- 显示完整的沙箱配置信息（镜像、资源限制、环境变量、元数据等）
- 运行状态的沙箱显示实时资源监控面板
- 支持暂停/恢复/删除操作
- 提供 TTL 续期功能

#### 创建沙箱 (Create Sandbox)
- 支持配置镜像、名称、入口命令
- 可设置 CPU/内存资源限制
- 支持自定义超时时间
- 高级选项：环境变量、网络策略

#### 批量创建 (Batch Create)
- 支持 JSON 配置文件导入
- 支持手动逐条添加
- 预览确认后批量创建
- 实时显示创建进度和结果

### 截图

*截图待添加*

### 许可证

MIT License
