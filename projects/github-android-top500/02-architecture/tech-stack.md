# 技术选型

## 技术栈总览

| 层次 | 技术 | 版本 | 选择理由 |
|------|------|------|----------|
| **语言** | TypeScript | 5.x | 类型安全，IDE支持好，与JS生态兼容 |
| **前端框架** | React | 18.x | 组件化，生态成熟，团队熟悉 |
| **UI组件库** | Ant Design | 5.x | 表格功能强大，中文文档完善 |
| **状态管理** | TanStack Query | 5.x | 专为服务端状态设计，自动缓存 |
| **构建工具** | Vite | 5.x | 开发体验好，HMR快，构建快 |
| **HTTP客户端** | Axios | 1.x | 拦截器，请求取消，错误处理 |
| **运行时** | Node.js | 18 LTS | 与前端统一语言，生态丰富 |
| **后端框架** | Express | 4.x | 轻量级，社区活跃，中间件丰富 |
| **数据库** | SQLite | 3.x | 零配置，单文件，适合小型应用 |
| **Excel处理** | xlsx (SheetJS) | 0.18.x | 功能完善，社区版免费 |
| **GitHub API** | Octokit | 3.x | 官方SDK，类型支持好 |
| **定时任务** | node-cron | 3.x | 简单可靠，Cron表达式支持 |

---

## 详细说明

### 前端技术

#### 语言: TypeScript
- **优势**: 静态类型检查，减少运行时错误
- **IDE支持**: VSCode完美支持，智能提示
- **生态系统**: DefinitelyTyped提供大量类型定义
- **配置**: strict模式开启，确保类型安全

#### 框架: React 18
- **组件化**: 函数组件 + Hooks，代码简洁
- **并发特性**: 自动批处理，Transition API
- **生态系统**: 组件库丰富，社区活跃
- **学习曲线**: 相比Vue略陡，但更灵活

#### UI组件库: Ant Design 5
- **组件丰富**: 60+ 高质量组件
- **表格功能**: 强大的Table组件，支持排序、筛选、分页
- **设计系统**: 完整的设计规范
- **国际化**: 内置多语言支持
- **定制性**: CSS-in-JS，主题可配置

#### 状态管理: TanStack Query (React Query)
```
选择理由：
1. 专为服务端状态设计，自动处理缓存、重试、轮询
2. 无需手动管理loading/error状态
3. 自动去重、后台刷新
4. DevTools支持，调试方便
5. 比Redux更适合数据获取场景
```

#### 构建工具: Vite
```
选择理由：
1. 开发服务器启动快（ESM）
2. HMR响应快
3. 生产构建使用Rollup，输出优化
4. 配置简单，开箱即用
5. TypeScript支持好
```

#### HTTP客户端: Axios
```
选择理由：
1. 拦截器支持（添加Token、错误处理）
2. 请求/响应转换
3. 自动JSON转换
4. 取消请求支持
5. 比fetch更完善的错误处理
```

---

### 后端技术

#### 运行时: Node.js 18 LTS
- **统一技术栈**: 前后端使用同一语言
- **npm生态**: 包管理方便
- **异步IO**: 适合IO密集型应用
- **LTS版本**: 稳定可靠，长期支持

#### 框架: Express
```
选择理由：
1. 轻量级，无过多约定
2. 中间件生态丰富
3. 社区活跃，文档完善
4. 学习成本低
5. 适合中小型项目

备选方案：
- Fastify: 性能更好，但生态略小
- NestJS: 功能强大，但对本项目过于复杂
```

#### 数据库: SQLite
```
选择理由：
1. 零配置，无需安装数据库服务
2. 单文件存储，部署简单
3. 读写性能足够（500条数据）
4. 支持完整SQL语法
5. better-sqlite3性能优秀

备选方案：
- LowDB: JSON存储，但查询能力弱
- PostgreSQL: 功能强大，但需要独立服务
```

#### Excel处理: xlsx (SheetJS)
```
选择理由：
1. 社区版免费，功能足够
2. 支持浏览器和Node.js
3. 多种格式支持（xlsx, csv, ods）
4. 流式读写支持
5. 活跃维护

备选方案：
- ExcelJS: 功能更全，但体积更大
- excel4node: 仅支持Node.js
```

#### GitHub API客户端: Octokit
```
选择理由：
1. GitHub官方SDK
2. TypeScript类型完善
3. 支持REST和GraphQL
4. 自动重试、分页处理
5. 插件机制
```

---

### 开发工具

#### 代码规范: ESLint + Prettier
```json
{
  "eslint": "^8.x",
  "prettier": "^3.x",
  "@typescript-eslint/eslint-plugin": "^6.x",
  "@typescript-eslint/parser": "^6.x"
}
```

#### 测试框架
| 类型 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Vitest | 快速，与Vite集成好 |
| API测试 | Supertest | Express API测试 |
| E2E测试 | Playwright | 跨浏览器测试（可选） |

#### 版本控制: Git
- 主分支: main
- 分支策略: feature/*, fix/*
- Commit规范: Conventional Commits

---

## 依赖清单

### 前端依赖 (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0",
    "@ant-design/icons": "^5.2.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/file-saver": "^2.0.5",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

### 后端依赖 (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.4.0",
    "octokit": "^3.1.0",
    "node-cron": "^3.0.3",
    "exceljs": "^4.4.0",
    "dotenv": "^16.3.0",
    "winston": "^3.11.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8",
    "@types/node-cron": "^3.0.11",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
    "vitest": "^1.2.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.2"
  }
}
```

---

## 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| GitHub API速率限制 | 高 | 中 | 使用认证Token，本地缓存，请求队列 |
| Octokit版本升级 | 低 | 低 | 锁定主版本号，及时跟进更新日志 |
| Ant Design 5.x breaking changes | 低 | 低 | 锁定版本，阅读迁移指南 |
| SQLite并发写入限制 | 低 | 低 | 单进程部署，写入串行化 |
| xlsx库体积较大 | 低 | 中 | 使用CDN或按需加载 |

---

## 版本兼容性

### Node.js
- 最低版本: 18.0.0
- 推荐版本: 18.19.0 LTS
- 支持版本: 18.x, 20.x

### 浏览器
| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 移动端
- 响应式支持: >=768px
- 完整支持: >=1024px
