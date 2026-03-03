# 测试用例索引

## 项目信息
- **项目名称**: github-android-top500
- **创建日期**: 2026-03-03
- **测试框架**: Vitest

---

## 统计信息

| 指标 | 数值 |
|------|------|
| 总测试文件数 | 6 |
| 总测试用例数 | ~85 |
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
