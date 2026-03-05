# 测试用例索引

## 项目信息
- **项目名称**: github-android-top500
- **创建日期**: 2026-03-03
- **测试框架**: Vitest

---

## 统计信息

| 指标 | 数值 |
|------|------|
| 总测试文件数 | 9 |
| 总测试用例数 | ~150 |
| 预期覆盖率 | 80%+ |

---

## 用例列表

### 后端测试 (Backend)

#### 工具函数测试
| 文件 | 用例数 | 覆盖功能 | 优先级 |
|------|--------|----------|--------|
| dateUtils.test.ts | 20 | 日期格式化、解析、范围判断、相对时间 | P2 |

#### 服务层测试
| 文件 | 用例数 | 覆盖功能 | 优先级 |
|------|--------|----------|--------|
| crawlerService.test.ts | 18 | GitHub API调用、数据转换、重试机制、状态管理 | P0 |
| exportService.test.ts | 16 | Excel生成、字段选择、格式验证、性能 | P0 |
| **statsService.test.ts** | **25** | **[v1.1.0] Git克隆、cloc调用、统计解析、并发控制、清理** | **P0** |

#### API集成测试
| 文件 | 用例数 | 覆盖功能 | 优先级 |
|------|--------|----------|--------|
| **statsApi.test.ts** | **20** | **[v1.1.0] 统计API端点、状态查询、错误处理、性能** | **P0** |

#### 数据层测试
| 文件 | 用例数 | 覆盖功能 | 优先级 |
|------|--------|----------|--------|
| repoRepository.test.ts | 22 | CRUD操作、查询、筛选、排序、分页 | P0 |

---

### 前端测试 (Frontend)

#### 组件测试
| 文件 | 用例数 | 覆盖功能 | 优先级 |
|------|--------|----------|--------|
| RepoTable.test.tsx | 18 | 表格渲染、排序、分页、链接跳转 | P1 |
| FilterPanel.test.tsx | 15 | 筛选选项、交互、状态显示 | P1 |
| **StatsButton.test.tsx** | **20** | **[v1.1.0] 统计按钮交互、状态切换、错误处理** | **P0** |
| **StatsProgress.test.tsx** | **15** | **[v1.1.0] 进度展示、状态轮询、取消功能** | **P0** |
| **StatsResult.test.tsx** | **20** | **[v1.1.0] 结果展示、语言分布、详细视图** | **P0** |

---

## 测试覆盖详情

### 后端模块覆盖

| 模块 | 测试类型 | 覆盖率目标 | 状态 |
|------|----------|------------|------|
| crawlerService | 单元+集成 | 100% | ✅ 用例已设计 |
| repoRepository | 单元 | 100% | ✅ 用例已设计 |
| exportService | 单元 | 100% | ✅ 用例已设计 |
| dateUtils | 单元 | 90% | ✅ 用例已设计 |
| validationUtils | 单元 | 80% | ⏳ 待设计 |
| repoService | 单元+集成 | 90% | ⏳ 待设计 |
| statusController | 集成 | 80% | ⏳ 待设计 |

### 前端模块覆盖

| 模块 | 测试类型 | 覆盖率目标 | 状态 |
|------|----------|------------|------|
| RepoTable | 组件 | 80% | ✅ 用例已设计 |
| FilterPanel | 组件 | 80% | ✅ 用例已设计 |
| SearchBar | 组件 | 70% | ⏳ 待设计 |
| StatusBar | 组件 | 70% | ⏳ 待设计 |
| ExportButton | 组件 | 70% | ⏳ 待设计 |
| useRepos | Hook | 90% | ⏳ 待设计 |
| useDebounce | Hook | 90% | ⏳ 待设计 |

---

## 测试场景清单

### 数据爬取场景
- [x] 正常获取500个项目
- [x] 数据排序正确（按star降序）
- [x] 数据转换正确
- [x] 空数据处理
- [x] 网络错误重试
- [x] 速率限制处理
- [x] null字段处理

### 数据存储场景
- [x] 保存数据到SQLite
- [x] 查询数据（分页、搜索、筛选、排序）
- [x] 清空数据
- [x] 处理null字段
- [x] 大数据量查询性能

### Excel导出场景
- [x] 生成Excel文件
- [x] 包含所有字段
- [x] 字段选择导出
- [x] 空数据处理
- [x] 特殊字符处理
- [x] 中文字符处理
- [x] 导出性能（500条<5秒）

### 表格展示场景
- [x] 正常渲染数据
- [x] 加载状态
- [x] 空数据状态
- [x] 排序交互
- [x] 分页交互
- [x] 点击跳转GitHub
- [x] 数字格式化

### 筛选交互场景
- [x] 语言筛选
- [x] Star范围筛选
- [x] 更新时间筛选
- [x] 组合筛选
- [x] 重置筛选
- [x] 显示筛选数量

---

## 边界条件覆盖

### 数据边界
- [x] 空数组
- [x] 单条数据
- [x] 最大数据量（500条）
- [x] null字段值

### 参数边界
- [x] 分页：page=0, page=-1, page>totalPages
- [x] 每页条数：pageSize=0, pageSize>100
- [x] 搜索：空字符串、特殊字符

### 时间边界
- [x] 日期格式验证
- [x] 时间范围边界

### 性能边界
- [x] 500条数据导出<5秒
- [x] 大数据量查询

---

## 运行测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test

# 带覆盖率运行
npm test -- --coverage

# 监听模式
npm test -- --watch
```

---

## 测试数据工厂

测试用例使用以下工厂函数生成测试数据：

```typescript
// 后端
createMockRepo(overrides?) - 创建单个模拟项目
createMockRepos(count) - 创建多个模拟项目

// 前端
createMockRepo(overrides?) - 创建单个模拟项目
createMockRepos(count) - 创建多个模拟项目
createMockResponse(repos) - 创建模拟API响应
```

---

## 注意事项

1. **Mock策略**:
   - GitHub API 使用 vi.fn() mock
   - 数据库使用内存SQLite
   - 定时器使用 vi.useFakeTimers()

2. **异步测试**:
   - 使用 async/await
   - 使用 waitFor 处理异步更新

3. **清理工作**:
   - afterEach 中清理 mock
   - 数据库连接在 afterEach 中关闭

4. **性能测试**:
   - 大数据量测试可能需要更长超时
   - 使用 --timeout 参数调整

---

## 📋 增量测试索引 (v1.1.0)

### 新增测试文件

#### 后端测试
- **statsService.test.ts** - 代码统计服务单元测试
  - Git克隆功能（浅拷贝、超时、失败处理）
  - cloc工具调用（JSON解析、未安装检测）
  - 统计结果解析（总行数、语言分布）
  - 临时文件清理（成功/失败场景）
  - 并发控制（单任务限制）
  - 任务状态管理（状态更新、进度跟踪）
  - 完整统计流程测试

- **statsApi.test.ts** - 代码统计API集成测试
  - POST /api/repos/:id/stats（触发统计、冲突处理）
  - GET /api/repos/:id/stats（状态查询、结果获取）
  - GET /api/stats/progress（整体进度）
  - 错误处理（404、409、503、408）
  - 性能测试（响应时间、并发）
  - 安全性测试（参数验证、错误屏蔽）

#### 前端测试
- **StatsButton.test.tsx** - 统计按钮组件测试
  - 渲染测试（默认状态、自定义样式）
  - 交互测试（点击触发、防抖）
  - 状态测试（禁用、加载、不同状态）
  - 错误处理（网络错误、冲突、工具未安装）
  - 成功完成（回调触发）
  - 可访问性（ARIA、键盘导航）

- **StatsProgress.test.tsx** - 统计进度组件测试
  - 渲染测试（不同状态、进度条）
  - 动画测试（进度更新、颜色变化）
  - 状态轮询（定时查询、停止条件）
  - 错误处理（错误展示、重试）
  - 取消功能（取消按钮、回调）
  - 可访问性（ARIA属性、屏幕阅读器）
  - 性能测试（内存泄漏）

- **StatsResult.test.tsx** - 统计结果组件测试
  - 渲染测试（总行数、各类型行数）
  - 语言分布（列表、百分比、条形图）
  - 数字格式化（千位分隔符、小数）
  - 详细视图（展开/收起、详细表格）
  - 空状态处理
  - 自定义显示选项
  - 图表展示
  - 可访问性（标题、表格、键盘导航）
  - 导出/刷新功能

---

### 增量测试统计

| 类别 | 新增文件 | 新增用例数 | 覆盖功能 |
|------|---------|-----------|---------|
| 后端单元测试 | 1 | 25 | StatsService |
| 后端集成测试 | 1 | 20 | Stats API |
| 前端组件测试 | 3 | 55 | StatsButton/Progress/Result |
| **合计** | **5** | **100** | **代码统计全流程** |

---

### 回归测试清单

#### 原有功能验证（必须通过）
- [ ] 数据爬取功能正常
- [ ] 数据存储功能正常
- [ ] Excel导出功能正常
- [ ] 搜索/筛选/排序功能正常
- [ ] 表格展示功能正常
- [ ] 原有API端点正常

#### 性能回归验证
- [ ] 首页加载时间 < 2秒
- [ ] 搜索响应时间 < 500ms
- [ ] 导出500条数据 < 5秒
- [ ] 数据库查询性能无明显下降

---

### 新增测试数据工厂

```typescript
// test/factories/stats.ts
export function createMockStatsJob(overrides?: Partial<StatsJob>): StatsJob
export function createMockCodeStats(overrides?: Partial<CodeStats>): CodeStats
export function createMockLanguageStats(): LanguageStats[]
```

---

### 运行增量测试

```bash
# 运行v1.1.0新增测试
npm test -- statsService.test.ts
npm test -- statsApi.test.ts
npm test -- StatsButton.test.tsx
npm test -- StatsProgress.test.tsx
npm test -- StatsResult.test.tsx

# 运行全部测试（包含回归）
npm test

# 生成覆盖率报告
npm test -- --coverage
```
