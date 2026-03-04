# API 接口功能测试用例

## 模块信息
- 模块名称：后端 API 接口
- 测试人员：Tester Agent
- 创建日期：2026-03-04

## 测试用例列表

### TC-API-001: 获取项目列表（默认分页）

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-001 |
| 用例名称 | 获取项目列表（默认分页） |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动，数据已加载 |
| 测试步骤 | GET /api/repos |
| 预期结果 | 1. HTTP 200<br>2. 返回 data 数组<br>3. pagination.pageSize = 20<br>4. pagination.total = 500 |

### TC-API-002: 获取项目列表（自定义分页）

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-002 |
| 用例名称 | 获取项目列表（自定义分页） |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?page=2&pageSize=50 |
| 预期结果 | 1. HTTP 200<br>2. pagination.page = 2<br>3. pagination.pageSize = 50<br>4. data.length = 50 |

### TC-API-003: 获取系统状态

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-003 |
| 用例名称 | 获取系统状态 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/status |
| 预期结果 | 1. HTTP 200<br>2. metadata.updateStatus = 'success'<br>3. metadata.totalCount = 500 |

### TC-API-004: 搜索功能

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-004 |
| 用例名称 | 搜索项目 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?search=retrofit |
| 预期结果 | 1. HTTP 200<br>2. 返回包含 retrofit 的项目<br>3. 所有结果名称或描述包含 retrofit |

### TC-API-005: 语言筛选

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-005 |
| 用例名称 | 按编程语言筛选 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?language=Kotlin |
| 预期结果 | 1. HTTP 200<br>2. 返回 Kotlin 项目<br>3. 所有结果 language = 'Kotlin' |

### TC-API-006: Star数量范围筛选

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-006 |
| 用例名称 | 按Star数量范围筛选 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?starRange=10000+ |
| 预期结果 | 1. HTTP 200<br>2. 返回 stars >= 10000 的项目 |

### TC-API-007: 排序功能

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-007 |
| 用例名称 | 按Fork数排序 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?sortBy=forks&sortOrder=desc |
| 预期结果 | 1. HTTP 200<br>2. 结果按 forks 降序排列 |

### TC-API-008: 组合筛选

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-008 |
| 用例名称 | 组合筛选（搜索+语言+排序） |
| 优先级 | P1 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/repos?search=android&language=Java&sortBy=stars |
| 预期结果 | 1. HTTP 200<br>2. 结果同时满足所有条件 |

### TC-API-009: Excel导出

| 项目 | 内容 |
|------|------|
| 用例ID | TC-API-009 |
| 用例名称 | 导出Excel文件 |
| 优先级 | P0 |
| 前置条件 | 后端服务已启动 |
| 测试步骤 | GET /api/export |
| 预期结果 | 1. HTTP 200<br>2. Content-Type = application/vnd.openxmlformats-...<br>3. 返回二进制文件流 |
