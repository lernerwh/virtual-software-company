# 软件规格说明

## 系统概述

**项目名称**: GitHub Android Top 500 Explorer

**系统描述**: 一个轻量级Web应用，用于自动爬取、展示和导出GitHub上star数量排名前500的Android开源项目。系统采用前后端分离架构，前端提供直观的数据浏览和导出界面，后端负责GitHub API数据获取和缓存管理。

**核心价值**:
- 自动化数据采集，省去手动整理
- 实时展示最新排名，支持多维度筛选
- 一键导出Excel，方便离线分析

---

## 技术规格

### 前端规格

| 项目 | 规格 |
|------|------|
| **框架** | React 18.2+ |
| **语言** | TypeScript 5.x |
| **UI组件库** | Ant Design 5.x |
| **构建工具** | Vite 5.x |
| **状态管理** | React Query (TanStack Query) 5.x |
| **HTTP客户端** | Axios 1.x |
| **样式方案** | CSS Modules + Ant Design主题 |
| **Excel导出** | xlsx (SheetJS) 0.18.x |

### 后端规格

| 项目 | 规格 |
|------|------|
| **运行时** | Node.js 18 LTS |
| **框架** | Express 4.x |
| **语言** | TypeScript 5.x |
| **数据存储** | SQLite3 (better-sqlite3) |
| **GitHub API客户端** | Octokit 3.x |
| **Excel生成** | ExcelJS 4.x |
| **定时任务** | node-cron 3.x |
| **进程管理** | PM2 (生产环境) |

### API规格

| 项目 | 规格 |
|------|------|
| **协议** | RESTful API |
| **认证** | 无用户认证（GitHub Token服务端配置） |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |
| **跨域** | CORS enabled |

---

## 模块划分

### 模块 1: 数据爬取模块 (Crawler)

**职责**:
- 调用GitHub Search API获取Android项目列表
- 实现分页获取，处理API速率限制
- 数据清洗和标准化
- 错误重试机制

**对外接口**:
```typescript
interface CrawlerService {
  fetchTopAndroidRepos(limit: number): Promise<Repository[]>;
  getFetchStatus(): FetchStatus;
}
```

**依赖模块**:
- GitHub API Client (Octokit)
- Data Storage Module

---

### 模块 2: 数据存储模块 (Storage)

**职责**:
- 项目数据的持久化存储
- 缓存管理（24小时过期）
- 元数据管理（更新时间、状态）

**对外接口**:
```typescript
interface StorageService {
  saveRepositories(repos: Repository[]): void;
  getRepositories(): Repository[];
  getMetadata(): Metadata;
  clearCache(): void;
}
```

**依赖模块**: 无

---

### 模块 3: REST API模块 (API)

**职责**:
- 提供前端所需的数据接口
- 请求参数验证
- 响应格式化
- 错误处理

**对外接口**:
```
GET  /api/repos          - 获取项目列表（支持分页、搜索、筛选、排序）
GET  /api/repos/:id      - 获取单个项目详情
GET  /api/export         - 导出Excel文件
POST /api/refresh        - 触发数据刷新
GET  /api/status         - 获取数据更新状态
```

**依赖模块**:
- Data Storage Module
- Crawler Module
- Export Module

---

### 模块 4: 导出模块 (Export)

**职责**:
- 生成Excel文件
- 支持字段选择
- 流式输出大文件

**对外接口**:
```typescript
interface ExportService {
  exportToExcel(repos: Repository[], options?: ExportOptions): Buffer;
}
```

**依赖模块**: 无

---

### 模块 5: 前端展示模块 (Frontend)

**职责**:
- 项目列表渲染（表格组件）
- 搜索、筛选、排序交互
- 分页控制
- Excel下载触发
- 数据刷新状态展示

**子组件**:
- `App` - 主应用
- `RepoTable` - 项目列表表格
- `SearchBar` - 搜索栏
- `FilterPanel` - 筛选面板
- `StatusBar` - 状态栏
- `ExportButton` - 导出按钮

**依赖模块**:
- REST API Module (通过HTTP)

---

### 模块 6: 定时任务模块 (Scheduler)

**职责**:
- 定时触发数据更新（每24小时）
- 任务状态管理
- 失败重试

**对外接口**:
```typescript
interface SchedulerService {
  start(): void;
  stop(): void;
  getStatus(): ScheduleStatus;
}
```

**依赖模块**:
- Crawler Module
- Data Storage Module

---

## 数据模型

### Repository (项目实体)

```typescript
interface Repository {
  id: number;                    // GitHub Repository ID
  rank: number;                  // 排名（按star数）
  name: string;                  // 仓库名称
  fullName: string;              // 完整名称 (owner/repo)
  description: string | null;    // 项目描述
  url: string;                   // GitHub URL
  htmlUrl: string;               // GitHub页面URL
  stars: number;                 // star数量
  forks: number;                 // fork数量
  language: string | null;       // 主要编程语言
  license: string | null;        // 开源协议
  ownerId: number;               // 作者ID
  ownerName: string;             // 作者名称
  ownerAvatar: string;           // 作者头像
  ownerType: 'User' | 'Organization';  // 作者类型
  isFork: boolean;               // 是否为Fork项目
  createdAt: string;             // 创建时间 (ISO 8601)
  updatedAt: string;             // 更新时间 (ISO 8601)
  pushedAt: string;              // 最后推送时间 (ISO 8601)
  openIssues: number;            // 未关闭Issue数
  watchers: number;              // 关注者数
  topics: string[];              // 主题标签
  homepage: string | null;       // 项目主页
}
```

### Metadata (元数据)

```typescript
interface Metadata {
  lastUpdateTime: string | null;   // 最后更新时间
  updateStatus: 'idle' | 'updating' | 'success' | 'error';
  totalCount: number;              // 项目总数
  errorMessage: string | null;     // 错误信息
  nextScheduledTime: string | null; // 下次计划更新时间
}
```

### API响应格式

```typescript
// 列表响应
interface RepoListResponse {
  data: Repository[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  metadata: Metadata;
}

// 单个项目响应
interface RepoDetailResponse {
  data: Repository;
}

// 状态响应
interface StatusResponse {
  metadata: Metadata;
}

// 通用错误响应
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## 接口定义

### REST API 端点

#### 1. 获取项目列表
```
GET /api/repos

Query Parameters:
  - page: number (default: 1)
  - pageSize: number (default: 20, max: 100)
  - search: string (optional)
  - language: 'Java' | 'Kotlin' | 'Other' (optional)
  - starRange: '0-1000' | '1000-5000' | '5000-10000' | '10000+' (optional)
  - updateRange: 'week' | 'month' | 'quarter' | 'year' (optional)
  - sortBy: 'stars' | 'forks' | 'updatedAt' | 'createdAt' (default: 'stars')
  - sortOrder: 'asc' | 'desc' (default: 'desc')

Response: RepoListResponse
```

#### 2. 获取项目详情
```
GET /api/repos/:id

Path Parameters:
  - id: number (GitHub Repository ID)

Response: RepoDetailResponse
```

#### 3. 导出Excel
```
GET /api/export

Query Parameters:
  - format: 'xlsx' | 'csv' (default: 'xlsx')
  - search: string (optional, 与列表搜索一致)
  - language: string (optional)
  - starRange: string (optional)
  - updateRange: string (optional)
  - fields: string (comma-separated, 指定导出字段)

Response: Binary file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
```

#### 4. 触发数据刷新
```
POST /api/refresh

Request Body: {}

Response: StatusResponse
```

#### 5. 获取状态
```
GET /api/status

Response: StatusResponse
```

---

## 技术约束

### GitHub API约束

| 约束 | 描述 | 处理策略 |
|------|------|----------|
| 速率限制 | 认证5000次/小时 | 本地缓存、批量请求 |
| 搜索结果限制 | 单次最多1000条 | 分页获取Top 500 |
| 请求超时 | 默认30秒 | 配置更长超时、重试机制 |

### 性能约束

| 约束 | 描述 |
|------|------|
| 内存限制 | Node.js 默认堆内存 ~1.4GB |
| 文件大小 | Excel文件控制在10MB以内 |
| 响应时间 | API响应 < 1秒 |

### 安全约束

| 约束 | 描述 |
|------|------|
| GitHub Token | 必须存储在服务端环境变量 |
| API密钥保护 | 禁止在前端暴露任何密钥 |
| 输入验证 | 所有用户输入需验证 |

---

## 部署规格

### 开发环境
```yaml
Node.js: 18.x LTS
npm: 9.x
操作系统: macOS / Linux / Windows
```

### 生产环境
```yaml
运行时: Node.js 18.x LTS
进程管理: PM2
反向代理: Nginx (可选)
SSL: Let's Encrypt
```

### 环境变量
```bash
# 服务端
GITHUB_TOKEN=ghp_xxxxx          # GitHub Personal Access Token
PORT=3001                       # 服务端口
CACHE_DURATION_HOURS=24         # 缓存时长
CRON_SCHEDULE=0 0 * * *         # 定时任务 (每天凌晨)
```
