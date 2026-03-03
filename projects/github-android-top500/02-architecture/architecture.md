# 架构设计文档

## 架构概览

本项目采用**前后端分离的单体应用架构**，前端使用React构建SPA，后端使用Node.js/Express提供REST API服务。数据存储采用轻量级SQLite数据库，支持快速部署和低资源运行。

---

## 架构风格

| 项目 | 选择 | 说明 |
|------|------|------|
| **整体架构** | 单体应用 | 适合中小型项目，部署简单 |
| **前端架构** | 组件化 + 状态管理 | React组件化开发，React Query管理服务端状态 |
| **后端架构** | 分层架构 | Controller -> Service -> Repository |
| **数据存储** | 文件数据库 | SQLite，无需独立数据库服务 |

### 设计原则

- **SOLID原则**: 单一职责、开闭原则
- **DRY**: 数据获取逻辑封装复用
- **KISS**: 保持简单，避免过度设计
- **关注点分离**: 前后端分离，业务逻辑与展示分离

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        React Frontend (SPA)                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │ RepoTable│  │SearchBar │  │FilterPanel│  │ExportBtn│               │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │ │
│  │       │             │             │             │                      │ │
│  │       └─────────────┴─────────────┴─────────────┘                      │ │
│  │                           │                                            │ │
│  │                    React Query (状态管理)                               │ │
│  │                           │                                            │ │
│  │                        Axios (HTTP客户端)                               │ │
│  └───────────────────────────┼────────────────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Node.js + Express Backend                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          API Layer (Controller)                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │RepoRouter│  │ExportRtr │  │StatusRtr │  │RefreshRtr│               │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │ │
│  └───────┼─────────────┼─────────────┼─────────────┼──────────────────────┘ │
│          │             │             │             │                         │
│  ┌───────┴─────────────┴─────────────┴─────────────┴──────────────────────┐ │
│  │                         Service Layer                                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │RepoService│  │ExportSvc │  │StatusSvc │  │RefreshSvc│               │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │ │
│  └───────┼─────────────┼─────────────┼─────────────┼──────────────────────┘ │
│          │             │             │             │                         │
│  ┌───────┴─────────────┴─────────────┴─────────────┴──────────────────────┐ │
│  │                       Repository Layer                                  │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                           │ │
│  │  │   RepoRepository │  │  MetadataRepo    │                           │ │
│  │  └────────┬─────────┘  └────────┬─────────┘                           │ │
│  └───────────┼─────────────────────┼─────────────────────────────────────┘ │
│              │                     │                                        │
│  ┌───────────┴─────────────────────┴─────────────────────────────────────┐ │
│  │                        Data Layer                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    SQLite Database                                │ │ │
│  │  │    ┌─────────────┐    ┌─────────────┐                           │ │ │
│  │  │    │repositories │    │  metadata   │                           │ │ │
│  │  │    └─────────────┘    └─────────────┘                           │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      External Services                                 │ │
│  │  ┌──────────────────┐    ┌──────────────────────────────────────────┐│ │
│  │  │   Crawler Module │───▶│        GitHub REST API                   ││ │
│  │  │   (node-cron)    │    │  (Octokit Client)                        ││ │
│  │  └──────────────────┘    └──────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
github-android-top500/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── components/           # UI组件
│   │   │   ├── RepoTable/        # 项目列表表格
│   │   │   ├── SearchBar/        # 搜索栏
│   │   │   ├── FilterPanel/      # 筛选面板
│   │   │   ├── StatusBar/        # 状态栏
│   │   │   └── ExportButton/     # 导出按钮
│   │   ├── hooks/                # 自定义Hooks
│   │   │   ├── useRepos.ts       # 项目数据Hook
│   │   │   └── useStatus.ts      # 状态Hook
│   │   ├── services/             # API服务
│   │   │   └── api.ts            # Axios封装
│   │   ├── types/                # 类型定义
│   │   │   └── index.ts          # 共享类型
│   │   ├── utils/                # 工具函数
│   │   │   └── format.ts         # 格式化工具
│   │   ├── constants/            # 常量定义
│   │   │   └── index.ts          # 筛选选项等
│   │   ├── styles/               # 全局样式
│   │   │   └── global.css        # 全局CSS
│   │   ├── App.tsx               # 主应用组件
│   │   └── main.tsx              # 入口文件
│   ├── public/                   # 静态资源
│   ├── index.html                # HTML模板
│   ├── package.json              # 前端依赖
│   ├── vite.config.ts            # Vite配置
│   └── tsconfig.json             # TypeScript配置
│
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── controllers/          # 控制器层
│   │   │   ├── repoController.ts # 项目控制器
│   │   │   ├── exportController.ts # 导出控制器
│   │   │   └── statusController.ts # 状态控制器
│   │   ├── services/             # 服务层
│   │   │   ├── repoService.ts    # 项目服务
│   │   │   ├── crawlerService.ts # 爬虫服务
│   │   │   └── exportService.ts  # 导出服务
│   │   ├── repositories/         # 数据访问层
│   │   │   ├── repoRepository.ts # 项目数据仓库
│   │   │   └── metaRepository.ts # 元数据仓库
│   │   ├── models/               # 数据模型
│   │   │   └── types.ts          # 类型定义
│   │   ├── routes/               # 路由定义
│   │   │   └── index.ts          # API路由
│   │   ├── middleware/           # 中间件
│   │   │   ├── errorHandler.ts   # 错误处理
│   │   │   └── validator.ts      # 参数验证
│   │   ├── utils/                # 工具函数
│   │   │   ├── logger.ts         # 日志工具
│   │   │   └── githubClient.ts   # GitHub API客户端
│   │   ├── scheduler/            # 定时任务
│   │   │   └── cron.ts           # Cron任务
│   │   ├── database/             # 数据库
│   │   │   ├── init.ts           # 数据库初始化
│   │   │   └── data.db           # SQLite数据库文件
│   │   ├── config/               # 配置
│   │   │   └── index.ts          # 配置管理
│   │   └── index.ts              # 入口文件
│   ├── package.json              # 后端依赖
│   └── tsconfig.json             # TypeScript配置
│
├── package.json                  # 根项目配置
├── README.md                     # 项目说明
└── .env.example                  # 环境变量示例
```

---

## 模块详细设计

### 前端模块

#### RepoTable 组件
```
职责: 展示项目列表，支持排序
状态: 无本地状态（使用React Query）
依赖: Ant Design Table, useRepos Hook
```

#### SearchBar 组件
```
职责: 提供搜索输入框
状态: 本地输入状态（debounce后更新URL参数）
依赖: Ant Design Input
```

#### FilterPanel 组件
```
职责: 提供筛选选项（语言、star范围、更新时间）
状态: 筛选条件（与URL参数同步）
依赖: Ant Design Select, DatePicker
```

#### StatusBar 组件
```
职责: 显示数据更新状态、上次更新时间
状态: 从useStatus Hook获取
依赖: Ant Design Tag, Tooltip
```

#### ExportButton 组件
```
职责: 触发Excel下载
状态: 导出进度
依赖: Ant Design Button, file-saver
```

### 后端模块

#### CrawlerService
```
职责: 从GitHub API获取数据
关键方法:
  - fetchTopAndroidRepos(): 批量获取项目
  - handleRateLimit(): 处理速率限制
  - retry(): 重试机制
依赖: Octokit, node-cron
```

#### RepoService
```
职责: 项目数据业务逻辑
关键方法:
  - getRepos(query): 查询项目列表
  - getRepoById(id): 获取单个项目
  - refreshData(): 刷新数据
依赖: RepoRepository, CrawlerService
```

#### ExportService
```
职责: 生成Excel文件
关键方法:
  - exportToExcel(repos, options): 生成Excel
  - streamExport(): 流式导出大文件
依赖: ExcelJS
```

---

## 数据流

### 1. 页面加载流程
```
用户访问 → React应用加载 → useRepos Hook触发
    → Axios请求 GET /api/repos → 后端Controller
    → Service层查询 → Repository层读取SQLite
    → 返回JSON响应 → React Query缓存 → 组件渲染
```

### 2. 数据刷新流程
```
用户点击刷新 → POST /api/refresh → Controller
    → 触发CrawlerService → 调用GitHub API
    → 数据清洗转换 → Repository层写入SQLite
    → 更新Metadata → 返回状态 → 前端刷新
```

### 3. Excel导出流程
```
用户点击导出 → GET /api/export → Controller
    → Service层查询数据 → ExportService生成Excel
    → 流式响应 → 浏览器下载文件
```

---

## 安全设计

### 认证机制
- **无用户认证**: 本应用为公开数据展示，无需用户登录
- **GitHub API认证**: 使用服务端Token，不暴露给前端

### 数据安全
| 项目 | 措施 |
|------|------|
| GitHub Token | 存储在环境变量，禁止提交到Git |
| API密钥 | 后端独占，前端不可见 |
| XSS防护 | React自动转义，Ant Design安全渲染 |
| CORS | 配置允许的源 |

### 输入验证
```typescript
// 后端参数验证
const validateQuery = (query: any): RepoQuery => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  // ... 其他验证
};
```

---

## 性能设计

### 缓存策略
| 层级 | 策略 | 说明 |
|------|------|------|
| 数据层 | SQLite + 24小时缓存 | 减少API调用 |
| 服务层 | 内存缓存Metadata | 快速状态查询 |
| 前端 | React Query缓存 | 避免重复请求 |

### 懒加载
- 表格分页加载，每次20条
- 图片使用懒加载（头像等）

### 代码分割
```typescript
// Vite自动代码分割
const RepoTable = lazy(() => import('./components/RepoTable'));
```

### Excel导出优化
- 使用流式写入，避免内存溢出
- Web Worker处理大数据（可选）

---

## 扩展性设计

### API版本控制
```
/api/v1/repos  - 当前版本
/api/v2/repos  - 未来版本
```

### 配置化
```typescript
// config/index.ts
export const config = {
  cacheDuration: process.env.CACHE_DURATION_HOURS || 24,
  cronSchedule: process.env.CRON_SCHEDULE || '0 0 * * *',
  repoLimit: 500,
};
```

### 插件机制（预留）
- 数据源可替换（未来支持GitLab等）
- 导出格式可扩展（CSV、JSON等）

---

## 错误处理

### 后端错误处理
```typescript
// 统一错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
    }
  });
});
```

### 前端错误处理
```typescript
// React Query错误处理
const { data, error, isLoading } = useQuery({
  queryKey: ['repos'],
  queryFn: fetchRepos,
  retry: 2,
  onError: (err) => message.error('加载数据失败'),
});
```

---

## 日志设计

### 日志级别
- `error`: 错误日志（API失败、异常）
- `warn`: 警告日志（速率限制接近）
- `info`: 信息日志（数据更新、导出）
- `debug`: 调试日志（开发环境）

### 日志格式
```
[2024-01-15 10:30:00] [INFO] Data refresh started
[2024-01-15 10:30:05] [INFO] Fetched 100 repos
[2024-01-15 10:31:00] [INFO] Data refresh completed, total: 500
```
