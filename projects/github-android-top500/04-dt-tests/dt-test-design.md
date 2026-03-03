# DT 测试设计

## 项目信息
- **项目名称**: github-android-top500
- **测试框架**: Vitest (前端 + 后端)
- **测试类型**: 单元测试 + 集成测试

---

## 测试策略

### 测试范围

| 层级 | 测试类型 | 覆盖目标 | 说明 |
|------|----------|----------|------|
| 前端 | 单元测试 | 80% | 工具函数、Hooks |
| 前端 | 组件测试 | 70% | 核心组件渲染和交互 |
| 后端 | 单元测试 | 85% | Service、Repository层 |
| 后端 | 集成测试 | 70% | API端点 |

### 测试优先级

| 优先级 | 模块/功能 | 测试类型 | 覆盖目标 | 理由 |
|--------|-----------|----------|----------|------|
| P0 | 数据爬取服务 | 单元+集成 | 100% | 核心功能 |
| P0 | 数据存储服务 | 单元 | 100% | 核心功能 |
| P0 | Excel导出服务 | 单元 | 100% | 核心功能 |
| P0 | REST API | 集成 | 100% | 核心功能 |
| P1 | 筛选/排序逻辑 | 单元 | 90% | 重要功能 |
| P1 | 前端表格组件 | 组件 | 80% | 重要功能 |
| P1 | API客户端 | 单元 | 80% | 重要功能 |
| P2 | 工具函数 | 单元 | 70% | 辅助功能 |
| P2 | 状态组件 | 组件 | 60% | 辅助功能 |

### 测试框架配置

#### 前端测试框架
```typescript
// vitest.config.ts
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
}
```

#### 后端测试框架
```typescript
// vitest.config.ts
{
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
}
```

---

## 测试分类

### 1. 后端单元测试

#### 1.1 工具函数测试 (utils/)
- `dateUtils.test.ts` - 日期格式化、解析
- `validationUtils.test.ts` - 参数验证
- `formatUtils.test.ts` - 数据格式化

#### 1.2 服务层测试 (services/)
- `crawlerService.test.ts` - GitHub API调用、数据转换
- `repoService.test.ts` - 项目查询、筛选、排序
- `exportService.test.ts` - Excel生成
- `schedulerService.test.ts` - 定时任务管理

#### 1.3 数据层测试 (repositories/)
- `repoRepository.test.ts` - 数据库CRUD操作
- `metaRepository.test.ts` - 元数据管理

### 2. 后端集成测试

#### 2.1 API端点测试 (api/)
- `reposApi.test.ts` - /api/repos 端点
- `exportApi.test.ts` - /api/export 端点
- `statusApi.test.ts` - /api/status 端点
- `refreshApi.test.ts` - /api/refresh 端点

### 3. 前端单元测试

#### 3.1 工具函数测试 (utils/)
- `queryParams.test.ts` - URL参数处理
- `filterUtils.test.ts` - 筛选逻辑
- `sortUtils.test.ts` - 排序逻辑

#### 3.2 Hooks测试 (hooks/)
- `useRepos.test.ts` - 项目数据获取
- `useStatus.test.ts` - 状态获取
- `useDebounce.test.ts` - 防抖处理

### 4. 前端组件测试

#### 4.1 核心组件 (components/)
- `RepoTable.test.tsx` - 表格渲染、排序、分页
- `SearchBar.test.tsx` - 搜索输入
- `FilterPanel.test.tsx` - 筛选交互
- `StatusBar.test.tsx` - 状态显示
- `ExportButton.test.tsx` - 导出按钮

---

## 测试数据策略

### 工厂函数
```typescript
// test/factories/repository.ts
export function createMockRepository(overrides?: Partial<Repository>): Repository {
  return {
    id: 1,
    rank: 1,
    name: 'test-repo',
    fullName: 'owner/test-repo',
    description: 'Test repository',
    url: 'https://api.github.com/repos/owner/test-repo',
    htmlUrl: 'https://github.com/owner/test-repo',
    stars: 1000,
    forks: 100,
    language: 'Java',
    license: 'MIT',
    ownerId: 1,
    ownerName: 'owner',
    ownerAvatar: 'https://avatar.url',
    ownerType: 'User',
    isFork: false,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    pushedAt: '2024-01-15T00:00:00Z',
    openIssues: 10,
    watchers: 50,
    topics: ['android', 'kotlin'],
    homepage: null,
    ...overrides
  };
}
```

### Mock策略
- **GitHub API**: 使用 `vi.fn()` mock Octokit
- **数据库**: 使用内存SQLite或mock
- **文件系统**: Mock文件写入操作

---

## 测试覆盖目标

### 总体目标
| 类型 | 目标覆盖率 |
|------|------------|
| 语句覆盖率 | >= 80% |
| 分支覆盖率 | >= 70% |
| 函数覆盖率 | >= 85% |
| 行覆盖率 | >= 80% |

### 按模块目标
| 模块 | 目标覆盖率 | 关键测试点 |
|------|------------|------------|
| crawlerService | 100% | API调用、错误处理、重试 |
| repoRepository | 100% | CRUD操作、查询性能 |
| exportService | 100% | Excel生成、格式验证 |
| API端点 | 100% | 请求验证、响应格式 |
| RepoTable | 80% | 渲染、排序、分页 |
| 筛选逻辑 | 90% | 各筛选条件组合 |

---

## 边界条件清单

### 数据边界
- [ ] 空数据集
- [ ] 单条数据
- [ ] 最大数据量（500条）
- [ ] 数据字段为null

### 参数边界
- [ ] 分页：page=0, page=-1, page>totalPages
- [ ] 每页条数：pageSize=0, pageSize>100
- [ ] 搜索：空字符串、特殊字符、超长字符串
- [ ] 排序：无效字段名

### 时间边界
- [ ] 缓存刚好过期
- [ ] GitHub API速率限制
- [ ] 网络超时

### 并发边界
- [ ] 同时触发多次刷新
- [ ] 并发导出请求

---

## 测试执行计划

### 开发阶段
1. 编写测试用例（先于实现）
2. 运行单个测试文件调试
3. 确保新增代码有对应测试

### 提交前
1. 运行全部测试
2. 检查覆盖率报告
3. 修复失败用例

### CI/CD
1. 每次提交自动运行
2. 覆盖率低于阈值则失败
3. 生成测试报告

---

## 测试命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- crawlerService.test.ts

# 运行带覆盖率
npm test -- --coverage

# 监听模式
npm test -- --watch

# 更新快照
npm test -- -u
```
