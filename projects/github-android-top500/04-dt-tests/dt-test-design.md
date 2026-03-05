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
| **P0** | **代码统计服务** | **单元+集成** | **100%** | **v1.1.0新增** |
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
- `statsService.test.ts` - **[v1.1.0] Git克隆、cloc调用、统计结果解析、临时文件清理**

#### 1.3 数据层测试 (repositories/)
- `repoRepository.test.ts` - 数据库CRUD操作
- `metaRepository.test.ts` - 元数据管理

### 2. 后端集成测试

#### 2.1 API端点测试 (api/)
- `reposApi.test.ts` - /api/repos 端点
- `exportApi.test.ts` - /api/export 端点
- `statusApi.test.ts` - /api/status 端点
- `refreshApi.test.ts` - /api/refresh 端点
- `statsApi.test.ts` - **[v1.1.0] /api/repos/:id/stats 端点、进度查询、结果获取**

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
- `StatsButton.test.tsx` - **[v1.1.0] 统计触发按钮、状态切换、禁用状态**
- `StatsProgress.test.tsx` - **[v1.1.0] 进度展示、克隆/统计状态显示**
- `StatsResult.test.tsx` - **[v1.1.0] 统计结果展示、各语言行数、详细视图**

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

---

## 📋 增量测试设计 (v1.1.0)

### 新增功能：代码行数统计

#### 测试策略
- **测试优先级**: P0（核心新增功能）
- **测试类型**: 单元测试 + 集成测试 + 组件测试
- **覆盖目标**: 100%（关键路径）
- **Mock策略**:
  - Git克隆操作使用 mock
  - cloc 工具调用使用 mock
  - 文件系统操作使用 mock

---

### 后端测试设计

#### 1. statsService.test.ts（单元测试）

**测试范围**: StatsService 的核心逻辑

| 测试场景 | 测试用例 | 预期结果 | 优先级 |
|---------|---------|---------|--------|
| Git克隆 | should clone repo with --depth 1 | 生成正确的git clone命令 | P0 |
| Git克隆 | should handle clone timeout | 超时后取消克隆并报错 | P0 |
| Git克隆 | should handle clone failure | 克隆失败返回错误信息 | P0 |
| cloc调用 | should call cloc with correct path | 正确调用cloc并传递路径 | P0 |
| cloc调用 | should parse cloc JSON output | 正确解析cloc输出结果 | P0 |
| cloc调用 | should handle cloc not installed | cloc未安装时返回友好错误 | P0 |
| 结果解析 | should calculate total lines | 正确计算总行数 | P0 |
| 结果解析 | should extract language stats | 正确提取各语言统计 | P1 |
| 临时清理 | should remove temp directory after stats | 统计完成后删除临时目录 | P0 |
| 临时清理 | should cleanup on failure | 失败时也清理临时目录 | P0 |
| 并发控制 | should reject concurrent stats request | 同时只能有一个统计任务 | P1 |
| 任务状态 | should update job status correctly | 正确更新任务状态 | P1 |

**Mock示例**:
```typescript
// Mock child_process.exec
vi.mock('child_process', () => ({
  exec: vi.fn((cmd, options, callback) => {
    if (cmd.includes('git clone')) {
      callback(null, { stdout: 'Cloning done', stderr: '' });
    } else if (cmd.includes('cloc')) {
      callback(null, {
        stdout: JSON.stringify({
          Java: { nFiles: 100, blank: 500, comment: 300, code: 5000 },
          Kotlin: { nFiles: 50, blank: 200, comment: 100, code: 2000 }
        })
      });
    }
  })
}));

// Mock fs.rm
vi.mock('fs/promises', () => ({
  rm: vi.fn().mockResolvedValue(undefined)
}));
```

---

#### 2. statsApi.test.ts（集成测试）

**测试范围**: 统计相关的API端点

| 端点 | 测试用例 | 预期结果 | 优先级 |
|------|---------|---------|--------|
| POST /api/repos/:id/stats | should trigger stats job | 返回202和jobId | P0 |
| POST /api/repos/:id/stats | should reject if stats running | 返回409冲突 | P0 |
| POST /api/repos/:id/stats | should return 404 for invalid repo | 仓库不存在返回404 | P1 |
| GET /api/repos/:id/stats | should return stats status | 返回任务状态和进度 | P0 |
| GET /api/repos/:id/stats | should return stats result | 返回统计结果 | P0 |
| GET /api/repos/:id/stats | should return 404 if no stats | 未统计时返回404 | P1 |
| GET /api/stats/progress | should return overall progress | 返回整体统计进度 | P1 |

**测试示例**:
```typescript
describe('Stats API', () => {
  it('should trigger stats job', async () => {
    const response = await request(app)
      .post('/api/repos/1/stats')
      .expect(202);

    expect(response.body).toHaveProperty('jobId');
    expect(response.body).toHaveProperty('status', 'pending');
  });

  it('should reject concurrent stats', async () => {
    // 第一次请求
    await request(app)
      .post('/api/repos/1/stats')
      .expect(202);

    // 第二次请求应该被拒绝
    await request(app)
      .post('/api/repos/1/stats')
      .expect(409);
  });
});
```

---

### 前端测试设计

#### 3. StatsButton.test.tsx（组件测试）

**测试范围**: 统计触发按钮组件

| 测试场景 | 测试用例 | 预期结果 | 优先级 |
|---------|---------|---------|--------|
| 渲染 | should render button | 正确渲染"统计代码"按钮 | P0 |
| 交互 | should trigger stats on click | 点击触发统计API | P0 |
| 状态 | should disable while stats running | 统计中按钮禁用 | P0 |
| 状态 | should show different states | 显示不同状态文本 | P1 |
| 错误 | should show error message | 失败时显示错误提示 | P0 |

---

#### 4. StatsProgress.test.tsx（组件测试）

**测试范围**: 统计进度展示组件

| 测试场景 | 测试用例 | 预期结果 | 优先级 |
|---------|---------|---------|--------|
| 渲染 | should show cloning progress | 显示"正在克隆仓库..." | P0 |
| 渲染 | should show analyzing progress | 显示"正在统计代码..." | P0 |
| 动画 | should animate progress bar | 进度条正确动画 | P1 |
| 轮询 | should poll status periodically | 定时查询状态 | P0 |

---

#### 5. StatsResult.test.tsx（组件测试）

**测试范围**: 统计结果展示组件

| 测试场景 | 测试用例 | 预期结果 | 优先级 |
|---------|---------|---------|--------|
| 渲染 | should display total lines | 显示总代码行数 | P0 |
| 渲染 | should display language breakdown | 显示各语言行数 | P0 |
| 交互 | should expand details on click | 点击展开详细视图 | P1 |
| 格式 | should format numbers correctly | 数字格式化显示（1,234） | P1 |

---

### 边界条件测试

#### 数据边界
- [ ] 空仓库（0个文件）
- [ ] 大型仓库（10000+文件）
- [ ] 超大单文件（10000+行）
- [ ] 多语言混合仓库
- [ ] 无代码文件仓库（只有图片、文档）

#### 工具边界
- [ ] cloc 未安装
- [ ] git 未安装
- [ ] cloc 版本不兼容
- [ ] 临时目录无写权限

#### 网络边界
- [ ] 仓库 URL 无效
- [ ] 私有仓库（无权限）
- [ ] 克隆超时（大型仓库）
- [ ] 网络中断

#### 并发边界
- [ ] 同时统计多个项目
- [ ] 统计进行中再次点击
- [ ] 页面刷新后继续轮询

---

### 回归测试要求

#### 原有功能验证
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 排序功能正常
- [ ] 分页功能正常
- [ ] 导出功能正常
- [ ] 状态显示正常

#### 性能验证
- [ ] 首页加载时间 < 2秒
- [ ] 搜索响应时间 < 500ms
- [ ] 导出500条 < 5秒

---

### 测试数据策略

#### Mock数据工厂

```typescript
// test/factories/stats.ts
export function createMockStatsJob(overrides?: Partial<StatsJob>): StatsJob {
  return {
    id: 'job-123',
    repoId: 1,
    status: 'completed',
    progress: 100,
    ...overrides
  };
}

export function createMockCodeStats(overrides?: Partial<CodeStats>): CodeStats {
  return {
    repoId: 1,
    totalLines: 7500,
    codeLines: 6000,
    commentLines: 1000,
    blankLines: 500,
    languages: [
      { language: 'Java', files: 100, blank: 500, comment: 800, code: 5000 },
      { language: 'Kotlin', files: 50, blank: 200, comment: 200, code: 2000 }
    ],
    statsAt: '2026-03-05T00:00:00Z',
    ...overrides
  };
}
```

---

### 测试覆盖率目标 (v1.1.0)

| 模块 | 目标覆盖率 | 关键测试点 |
|------|------------|------------|
| statsService | 100% | Git克隆、cloc调用、结果解析、清理 |
| statsController | 100% | API端点、错误处理 |
| StatsButton | 90% | 按钮状态、交互 |
| StatsProgress | 85% | 进度展示、轮询 |
| StatsResult | 85% | 结果展示、格式化 |

---

### 测试执行命令

```bash
# 运行v1.1.0新增测试
npm test -- statsService.test.ts
npm test -- statsApi.test.ts
npm test -- StatsButton.test.tsx

# 运行全部测试（包含回归）
npm test

# 生成覆盖率报告
npm test -- --coverage
```
