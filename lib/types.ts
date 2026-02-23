export interface TeamConfig {
  name: string
  description: string
  createdAt: number
  leadAgentId: string
  leadSessionId: string
  members: TeamMember[]
}

export interface TeamMember {
  agentId: string
  name: string
  agentType: string
  model: string
  joinedAt: number
  tmuxPaneId: string
  cwd: string
  subscriptions: string[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: string
  dependsOn?: string[]
  createdAt: number
  completedAt?: number
}

export interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: number
  type: 'direct' | 'broadcast'
}

export interface ConversationHistory {
  teamName: string
  messages: Message[]
  tasks: Task[]
}

export interface TeamSummary {
  config: TeamConfig
  memberCount: number
  activeMembers: number
  taskCount: number
  lastActivity?: number
}

// ============ MCP Server Types ============

export interface MCPServer {
  id: string
  name: string
  type: 'stdio' | 'sse' | 'http'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  enabled: boolean
  capabilities: MCPCapability[]
  status: 'connected' | 'disconnected' | 'error'
  lastPing?: number
  error?: string
}

export interface MCPCapability {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

export interface MCPServerConfig {
  mcpServers: Record<string, MCPServerDefinition>
}

export interface MCPServerDefinition {
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
}

// ============ Skill Types ============

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  tags: string[]
  commands: SkillCommand[]
  source: 'builtin' | 'local' | 'community'
  installedAt?: number
  usageCount: number
  lastUsed?: number
}

export type SkillCategory =
  | 'code'
  | 'design'
  | 'research'
  | 'communication'
  | 'productivity'
  | 'devops'
  | 'data'
  | 'security'
  | 'other'

export interface SkillCommand {
  name: string
  description: string
  usage: string
  examples: string[]
}

// ============ Agent Types ============

export interface Agent {
  id: string
  name: string
  description: string
  agentType: AgentType
  model: AgentModel
  status: AgentStatus
  capabilities: string[]
  currentTask?: string
  joinedAt: number
  lastActivity?: number
  metrics: AgentMetrics
  config: AgentConfig
}

export type AgentType =
  | 'general-purpose'
  | 'code-explorer'
  | 'code-architect'
  | 'code-reviewer'
  | 'test-runner'
  | 'researcher'
  | 'planner'
  | 'implementer'
  | 'communicator'
  | 'custom'

export type AgentStatus =
  | 'idle'
  | 'working'
  | 'thinking'
  | 'waiting'
  | 'error'
  | 'offline'

export type AgentModel =
  | 'sonnet'
  | 'opus'
  | 'haiku'

export interface AgentMetrics {
  tasksCompleted: number
  tasksInProgress: number
  totalTokens: number
  avgResponseTime: number
  successRate: number
}

export interface AgentConfig {
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  tools?: string[]
  mode?: 'auto' | 'manual'
}

// ============ Project Types ============

export interface Project {
  name: string
  path: string
  description?: string
  language?: string
  frameworks?: string[]
  lastOpened: number
  conversationCount: number
  agentTeams?: string[]
  claudeConfig?: ClaudeProjectConfig
}

export interface ClaudeProjectConfig {
  projectPrompts?: string[]
  instructions?: string[]
  prefill?: string
}

// ============ Session Types ============

export interface Session {
  id: string
  agentId: string
  teamId?: string
  projectPath?: string
  startedAt: number
  lastActivity: number
  messages: number
  tokens: number
  status: 'active' | 'paused' | 'ended'
}

// ============ Activity Log Types ============

export interface ActivityLog {
  id: string
  timestamp: number
  type: ActivityType
  agentId?: string
  teamId?: string
  projectPath?: string
  content: string
  metadata?: Record<string, unknown>
}

export type ActivityType =
  | 'agent_start'
  | 'agent_stop'
  | 'task_start'
  | 'task_complete'
  | 'task_fail'
  | 'message_sent'
  | 'message_received'
  | 'file_created'
  | 'file_modified'
  | 'command_executed'
  | 'error'
