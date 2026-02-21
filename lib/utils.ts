import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

export function getAgentTypeLabel(agentType: string): string {
  const typeMap: Record<string, string> = {
    'team-lead': '团队负责人',
    'feature-dev:code-architect': '架构师',
    'feature-dev:coder': '开发者',
    'researcher': '研究员',
    'reviewer': '审查者',
    'tester': '测试者',
  }
  return typeMap[agentType] || agentType
}

export function getModelLabel(model: string): string {
  const modelMap: Record<string, string> = {
    'glm-5': 'GLM-5',
    'glm-4.7': 'GLM-4.7',
    'claude-opus-4-6': 'Claude Opus 4.6',
    'claude-sonnet-4-2': 'Claude Sonnet 4.2',
    'claude-haiku-4-1': 'Claude Haiku 4.1',
  }
  return modelMap[model] || model
}
