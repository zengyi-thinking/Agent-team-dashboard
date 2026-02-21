# Agent Team Dashboard - 项目结构

```
agent-team-dashboard/
├── app/
│   ├── api/
│   │   ├── teams/
│   │   │   ├── route.ts           # 获取所有teams列表
│   │   │   └── [name]/
│   │   │       └── route.ts       # 获取特定team详情
│   │   └── conversations/
│   │       └── route.ts           # 获取历史对话
│   ├── globals.css                # 全局样式
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 主页面
├── components/
│   ├── ui/                        # 基础UI组件
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── separator.tsx
│   │   └── tabs.tsx
│   ├── communication-flow.tsx     # 通信流可视化组件
│   ├── task-card.tsx              # 任务卡片组件
│   ├── task-status-chart.tsx      # 任务状态图表
│   ├── team-card.tsx              # 团队卡片组件
│   └── team-detail-dialog.tsx     # 团队详情弹窗
├── lib/
│   ├── types.ts                   # TypeScript类型定义
│   └── utils.ts                   # 工具函数
├── .eslintrc.json                 # ESLint配置
├── .gitignore                     # Git忽略文件
├── next.config.js                 # Next.js配置
├── package.json                   # 项目依赖
├── postcss.config.js              # PostCSS配置
├── PROJECT_STRUCTURE.md           # 项目结构说明（本文件）
├── README.md                      # 项目说明文档
├── tailwind.config.ts             # Tailwind CSS配置
└── tsconfig.json                  # TypeScript配置
```

## 核心模块说明

### 1. API路由 (`app/api/`)

- **teams/route.ts**: 获取所有Agent Teams的概览信息
- **teams/[name]/route.ts**: 获取特定团队的详细信息和任务列表
- **conversations/route.ts**: 获取历史对话记录

### 2. 页面组件 (`app/`)

- **page.tsx**: 主Dashboard页面，包含：
  - 统计卡片（团队数、成员数、任务数）
  - Tabs导航（Teams、Conversations、Architecture）
  - 团队卡片网格
  - 历史对话列表

### 3. 可视化组件 (`components/`)

- **TeamCard**: 显示单个团队的概览信息
- **TeamDetailDialog**: 显示团队详情的弹窗，包含成员、任务、可视化三个tab
- **CommunicationFlow**: 显示Agent之间的通信流
- **TaskStatusChart**: 使用Recharts显示任务状态分布

### 4. 类型定义 (`lib/types.ts`)

- `TeamConfig`: 团队配置
- `TeamMember`: 团队成员信息
- `Task`: 任务信息
- `Message`: 消息信息
- `ConversationHistory`: 对话历史

## 数据流

```
用户请求 → API路由 → 读取~/.claude/目录 → 返回数据 → 前端渲染
```

### 数据源

- `~/.claude/teams/{team-name}/config.json` - 团队配置
- `~/.claude/tasks/{team-name}/` - 任务数据
- `~/.claude/conversations/` - 对话历史

## 运行命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行ESLint检查
