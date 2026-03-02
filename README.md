# 虚拟软件公司（Virtual Software Company）

一个由多个 AI subagent（Skills）组成的虚拟软件开发系统，模拟真实软件开发流程。

## 🚀 快速开始

### 1. 启动新项目

```bash
/company-run "开发一个待办事项应用"
```

### 2. 继续已有项目

```bash
/company-run todo-app
```

### 3. 查看项目状态

```bash
/company-run todo-app --status
```

## 📁 目录结构

```
VirtualSoftwareCompany/
├── company-config/           # 公司配置
│   ├── code-standards.yaml   # 代码规范
│   ├── architecture-patterns.yaml  # 架构模式库
│   ├── test-standards.yaml   # 测试规范
│   └── role-boundaries.yaml  # 角色边界定义
│
├── projects/                 # 项目目录
│   └── {project-name}/
│       ├── project-state.yaml    # 项目状态
│       ├── 01-requirements/      # 需求分析
│       ├── 02-architecture/      # 架构设计
│       ├── 03-acceptance/        # 验收标准
│       ├── 04-dt-tests/          # DT测试用例
│       ├── 05-code/              # 业务代码
│       ├── 06-reviews/           # 代码审核
│       ├── 07-test-design/       # 测试设计
│       ├── 08-test-cases/        # 测试用例
│       └── 09-reports/           # 测试报告
│
└── coordination/             # 协调配置
    ├── workflow-state.yaml   # 工作流状态
    └── handover-log.yaml     # 交接日志
```

## 👥 角色说明

| 角色 | 命令 | 职责 |
|------|------|------|
| 项目经理 | `/pm` | 需求分析、项目规格、资源计划 |
| 架构设计师 | `/architect` | 软件规格、架构设计、技术选型 |
| 开发测试人员 | `/dev-tester` | DT测试设计（TDD） |
| 开发人员 | `/developer` | 代码实现、自测DT用例 |
| 审核人员 | `/reviewer` | 代码审核、反馈意见 |
| 测试经理 | `/test-manager` | 测试计划、验收标准 |
| 测试人员 | `/tester` | 测试用例、测试执行、测试报告 |
| 主控协调器 | `/company-run` | 流程协调、状态管理 |

## 🔄 工作流程

```
用户需求
    │
    ▼
┌─────────────────┐
│  /pm            │ 需求分析
│  01-requirements│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /architect     │ 架构设计
│  02-architecture│
│  03-acceptance  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│/dev-  │ │/test- │
│tester │ │manager│
│04-dt- │ │07-test│
│tests  │ │design │
└───┬───┘ └───┬───┘
    │         │
    ▼         │
┌───────┐     │
│/dev-  │     │
│eloper │     │
│05-code│     │
└───┬───┘     │
    │         │
    ▼         │
┌───────┐     │
│/review│     │
│er     │     │
│06-    │     │
│reviews│     │
└───┬───┘     │
    │         │
    ▼         │
┌───────┬─────┘
│/tester│
│08-test│
│cases  │
│09-    │
│reports│
└───┬───┘
    │
    ▼
  完成
```

## 🛠 技术栈

### 默认支持
- **前端**: TypeScript + React/Vue + Vite
- **后端**: Node.js + Express/NestJS
- **测试**: Vitest + Playwright

### 预留扩展
- Android (Kotlin)
- HarmonyOS (ArkTS)

## ⚙️ 配置说明

### 代码规范
`company-config/code-standards.yaml` 包含：
- 命名规范
- TypeScript 规范
- React 规范
- Git 规范

### 架构模式
`company-config/architecture-patterns.yaml` 包含：
- 分层架构
- 组件化架构
- MVVM
- 清洁架构
- 微服务

### 测试规范
`company-config/test-standards.yaml` 包含：
- 测试金字塔
- 测试命名
- 覆盖率要求
- Mock 规范

## 🔒 职责边界

每个角色都有严格的职责边界控制：

- ✅ **允许的操作** - 明确列出可以做的事情
- ❌ **禁止的操作** - 明确列出不允许做的事情
- 📁 **允许访问的文件** - 只能读写指定目录
- 🤝 **允许交互的角色** - 只能与指定角色协作

## 📝 示例项目

### 创建待办事项应用

```bash
# 1. 启动项目
/company-run "开发一个待办事项应用，支持添加、完成、删除功能"

# 系统将自动：
# - 创建项目目录
# - 调用 /pm 分析需求
# - 调用 /architect 设计架构
# - 调用 /dev-tester 设计测试
# - 调用 /test-manager 设计测试计划
# - 调用 /developer 实现代码
# - 调用 /reviewer 审核代码
# - 调用 /tester 执行测试
# - 输出测试报告
```

## 📄 License

MIT
