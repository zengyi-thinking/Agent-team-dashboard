# Agent Team Dashboard

一个用于监控 Claude Code Agent Teams 的可视化面板，支持实时数据同步、通信日志可视化、任务依赖图、性能指标追踪和数据导出。

## 功能特性

### 核心功能
- 📊 **Agent Teams 概览**：查看所有创建的 Agent Team 及其成员信息
- 👥 **成员管理**：查看每个团队的成员、角色和模型配置
- 📝 **任务追踪**：监控团队任务的创建、分配和完成状态
- 💬 **历史对话**：浏览与 Claude Code 的历史对话记录

### 高级功能
- 🔄 **实时数据同步**：通过WebSocket实时监听~/.claude/目录变化，自动更新数据
- 💭 **通信日志可视化**：从实际日志文件读取Agent之间的消息传递记录
- 📈 **任务依赖图**：使用React Flow可视化展示任务之间的依赖关系
- 📊 **性能指标面板**：追踪Token使用量、响应时间、任务完成率等关键指标
- 📤 **导出功能**：支持导出团队报告和对话历史（JSON/Markdown/PDF/CSV）
- 🌓 **深色模式**：支持浅色、深色和跟随系统主题切换

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 运行开发服务器：
```bash
# 仅运行Next.js开发服务器
npm run dev

# 同时运行WebSocket服务器和Next.js
npm run dev:ws
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 技术栈

- **框架**：Next.js 15 with App Router
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **组件库**：Radix UI (shadcn/ui)
- **图标**：Lucide React
- **图表**：Recharts
- **流程图**：React Flow
- **主题**：next-themes
- **实时通信**：WebSocket (ws)
- **文件监听**：Chokidar

## 数据来源

Dashboard 从以下位置读取数据：

- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`
- Conversations: `~/.claude/conversations/`
- Logs: `~/.claude/logs/` 和 `~/.claude/sessions/`

## 架构说明

### Agent Teams 核心组件

- **Team Lead**：主会话，负责任务分解、分配和结果综合
- **Teammates**：独立的 Claude Code 实例，各自处理分配的任务
- **Task List**：共享的工作项列表
- **Mailbox**：代理间消息传递系统

### WebSocket 实时同步

WebSocket服务器监听以下目录的变化：
- `~/.claude/teams/` - 团队配置变化
- `~/.claude/tasks/` - 任务状态变化
- `~/.claude/conversations/` - 对话记录变化

当检测到变化时，服务器会推送更新到所有连接的客户端，自动刷新数据。

### 适用场景

- 研究和审查：多个队友同时调查不同方面
- 新模块或功能：队友各自拥有独立部分
- 竞争假设调试：队友并行测试不同理论
- 跨层协调：前端、后端和测试由不同队友负责

## 使用指南

### 查看团队详情

1. 点击任意团队卡片打开详情对话框
2. 在详情对话框中可以查看：
   - **成员**：团队成员列表和详细信息
   - **任务**：所有任务的列表和状态
   - **性能**：Token使用量、响应时间、完成率等指标
   - **图表**：任务状态图和依赖关系图
   - **日志**：Agent之间的通信日志

### 导出数据

点击团队详情右上角的"导出"按钮，选择：
- 导出格式：JSON、Markdown、PDF 或 CSV
- 包含内容：任务列表、性能指标、对话历史

### 主题切换

使用右上角的主题切换按钮：
- ☀️ 浅色模式
- 🌙 深色模式
- 💻 跟随系统

## 项目结构

```
agent-team-dashboard/
├── app/
│   ├── api/                    # API路由
│   │   ├── teams/             # Teams相关API
│   │   └── conversations/     # Conversations API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局（含ThemeProvider）
│   └── page.tsx               # 主页面
├── components/
│   ├── ui/                    # 基础UI组件
│   ├── communication-flow.tsx # 通信日志可视化
│   ├── task-dependency-graph.tsx # 任务依赖图
│   ├── metrics-panel.tsx      # 性能指标面板
│   ├── export-panel.tsx       # 导出功能面板
│   ├── theme-toggle.tsx       # 主题切换按钮
│   └── ...
├── hooks/
│   └── use-websocket.ts       # WebSocket Hook
├── lib/
│   ├── websocket-server.ts    # WebSocket服务器
│   ├── log-reader.ts          # 日志读取器
│   ├── metrics-calculator.ts  # 性能指标计算
│   ├── export-handler.ts      # 导出处理器
│   └── types.ts               # TypeScript类型
└── package.json
```

## 开发建议

- 启动时使用 `npm run dev:ws` 同时运行WebSocket服务器
- WebSocket默认运行在3001端口
- 日志文件需要符合特定格式才能被解析
- 导出PDF功能依赖jsPDF，中文支持需要额外配置字体

## 后续改进

- [ ] 添加更多日志格式支持
- [ ] 任务依赖关系编辑功能
- [ ] 实时任务状态更新（通过WebSocket）
- [ ] 团队比较功能
- [ ] 自定义指标和仪表盘
- [ ] 多语言支持
