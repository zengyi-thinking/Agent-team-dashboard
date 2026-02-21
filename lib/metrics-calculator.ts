/**
 * Performance Metrics Calculator
 * 计算Token使用量、响应时间等性能指标
 */

import type { TeamConfig, Task } from './types'

export interface TeamMetrics {
  teamName: string
  tokenUsage: TokenMetrics
  responseTime: ResponseTimeMetrics
  taskEfficiency: TaskEfficiencyMetrics
  agentActivity: AgentActivityMetrics
}

export interface TokenMetrics {
  estimatedTotal: number
  estimatedByAgent: Record<string, number>
  averagePerTask: number
}

export interface ResponseTimeMetrics {
  averageTaskCompletion: number // 平均任务完成时间（毫秒）
  fastestTask: number
  slowestTask: number
  byAgent: Record<string, number>
}

export interface TaskEfficiencyMetrics {
  totalTasks: number
  completedTasks: number
  completionRate: number
  averageTasksPerAgent: number
  tasksByStatus: Record<string, number>
}

export interface AgentActivityMetrics {
  activeAgents: number
  mostActiveAgent: string
  agentContributions: Record<string, number>
}

/**
 * 计算团队性能指标
 */
export function calculateTeamMetrics(
  config: TeamConfig,
  tasks: Task[]
): TeamMetrics {
  const tokenMetrics = calculateTokenMetrics(config, tasks)
  const responseTimeMetrics = calculateResponseTimeMetrics(tasks)
  const taskEfficiencyMetrics = calculateTaskEfficiencyMetrics(config, tasks)
  const agentActivityMetrics = calculateAgentActivityMetrics(config, tasks)

  return {
    teamName: config.name,
    tokenUsage: tokenMetrics,
    responseTime: responseTimeMetrics,
    taskEfficiency: taskEfficiencyMetrics,
    agentActivity: agentActivityMetrics,
  }
}

/**
 * 计算Token使用量（估算）
 */
function calculateTokenMetrics(
  config: TeamConfig,
  tasks: Task[]
): TokenMetrics {
  // 简单估算：每个任务约1000-5000 tokens
  const estimatedTokensPerTask = 2500
  const estimatedTotal = tasks.length * estimatedTokensPerTask

  const estimatedByAgent: Record<string, number> = {}
  const tasksPerAgent: Record<string, number> = {}

  tasks.forEach((task) => {
    if (task.assignedTo) {
      tasksPerAgent[task.assignedTo] = (tasksPerAgent[task.assignedTo] || 0) + 1
    }
  })

  Object.entries(tasksPerAgent).forEach(([agentId, count]) => {
    estimatedByAgent[agentId] = count * estimatedTokensPerTask
  })

  // 添加团队成员基础token使用
  config.members.forEach((member) => {
    const baseTokens = 10000 // 初始化和上下文加载
    estimatedByAgent[member.agentId] =
      (estimatedByAgent[member.agentId] || 0) + baseTokens
  })

  return {
    estimatedTotal,
    estimatedByAgent,
    averagePerTask: tasks.length > 0 ? estimatedTotal / tasks.length : 0,
  }
}

/**
 * 计算响应时间指标
 */
function calculateResponseTimeMetrics(tasks: Task[]): ResponseTimeMetrics {
  const completedTasks = tasks.filter((t) => t.completedAt)

  if (completedTasks.length === 0) {
    return {
      averageTaskCompletion: 0,
      fastestTask: 0,
      slowestTask: 0,
      byAgent: {},
    }
  }

  const completionTimes = completedTasks.map(
    (t) => (t.completedAt || 0) - t.createdAt
  )

  const averageTaskCompletion =
    completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length

  const fastestTask = Math.min(...completionTimes)
  const slowestTask = Math.max(...completionTimes)

  const byAgent: Record<string, number> = {}
  const agentTimes: Record<string, number[]> = {}

  completedTasks.forEach((task) => {
    if (task.assignedTo) {
      if (!agentTimes[task.assignedTo]) {
        agentTimes[task.assignedTo] = []
      }
      agentTimes[task.assignedTo].push(
        (task.completedAt || 0) - task.createdAt
      )
    }
  })

  Object.entries(agentTimes).forEach(([agentId, times]) => {
    byAgent[agentId] = times.reduce((a, b) => a + b, 0) / times.length
  })

  return {
    averageTaskCompletion,
    fastestTask,
    slowestTask,
    byAgent,
  }
}

/**
 * 计算任务效率指标
 */
function calculateTaskEfficiencyMetrics(
  config: TeamConfig,
  tasks: Task[]
): TaskEfficiencyMetrics {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

  const tasksByStatus: Record<string, number> = {}
  tasks.forEach((task) => {
    tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
  })

  const activeAgents = config.members.length
  const averageTasksPerAgent =
    activeAgents > 0 ? totalTasks / activeAgents : 0

  return {
    totalTasks,
    completedTasks,
    completionRate,
    averageTasksPerAgent,
    tasksByStatus,
  }
}

/**
 * 计算Agent活动指标
 */
function calculateAgentActivityMetrics(
  config: TeamConfig,
  tasks: Task[]
): AgentActivityMetrics {
  const agentContributions: Record<string, number> = {}

  tasks.forEach((task) => {
    if (task.assignedTo) {
      agentContributions[task.assignedTo] =
        (agentContributions[task.assignedTo] || 0) + 1
    }
  })

  // 添加没有任务的成员
  config.members.forEach((member) => {
    if (!(member.agentId in agentContributions)) {
      agentContributions[member.agentId] = 0
    }
  })

  const activeAgents = Object.values(agentContributions).filter(
    (count) => count > 0
  ).length

  let mostActiveAgent = ''
  let maxContributions = 0

  Object.entries(agentContributions).forEach(([agentId, count]) => {
    if (count > maxContributions) {
      maxContributions = count
      mostActiveAgent = agentId
    }
  })

  return {
    activeAgents,
    mostActiveAgent,
    agentContributions,
  }
}

/**
 * 格式化时间显示
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  }
  return `${seconds}秒`
}

/**
 * 格式化Token数量
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}
