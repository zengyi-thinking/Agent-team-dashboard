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
