/**
 * Communication Log Reader
 * 读取Claude Code的通信日志以可视化Agent之间的消息传递
 */

import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

const LOGS_DIR = path.join(homedir(), '.claude', 'logs')
const SESSIONS_DIR = path.join(homedir(), '.claude', 'sessions')

export interface LogMessage {
  id: string
  timestamp: number
  from: string
  to: string
  type: 'task_assignment' | 'status_update' | 'request' | 'response' | 'broadcast'
  content: string
  teamName?: string
}

export interface TeamCommunicationLogs {
  teamName: string
  messages: LogMessage[]
}

/**
 * 从日志文件中解析通信消息
 */
export async function readTeamLogs(teamName: string): Promise<LogMessage[]> {
  const logs: LogMessage[] = []

  try {
    // 尝试从sessions目录读取
    const sessionPath = path.join(SESSIONS_DIR, teamName)
    const sessionExists = await fs.access(sessionPath).then(() => true).catch(() => false)

    if (sessionExists) {
      const files = await fs.readdir(sessionPath)
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.log')) {
          try {
            const filePath = path.join(sessionPath, file)
            const content = await fs.readFile(filePath, 'utf-8')
            const parsed = JSON.parse(content)

            // 解析不同格式的日志
            if (Array.isArray(parsed)) {
              parsed.forEach(item => {
                if (isLogMessage(item)) {
                  logs.push({ ...item, teamName })
                }
              })
            } else if (isLogMessage(parsed)) {
              logs.push({ ...parsed, teamName })
            }

            // 检查messages数组
            if (parsed.messages && Array.isArray(parsed.messages)) {
              parsed.messages.forEach((msg: any) => {
                if (isLogMessage(msg)) {
                  logs.push({ ...msg, teamName })
                }
              })
            }
          } catch (error) {
            console.error(`Failed to read log file ${file}:`, error)
          }
        }
      }
    }

    // 尝试从logs目录读取
    const logsPath = path.join(LOGS_DIR, `${teamName}.log`)
    const logExists = await fs.access(logsPath).then(() => true).catch(() => false)

    if (logExists) {
      const content = await fs.readFile(logsPath, 'utf-8')
      const lines = content.split('\n')

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          if (isLogMessage(parsed)) {
            logs.push({ ...parsed, teamName })
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }
  } catch (error) {
    console.error('Error reading team logs:', error)
  }

  // 按时间戳排序
  return logs.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * 验证是否是日志消息格式
 */
function isLogMessage(obj: any): obj is LogMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.from || obj.sender) &&
    (obj.to || obj.recipient || obj.type === 'broadcast') &&
    (obj.content || obj.message)
  )
}

/**
 * 解析消息类型
 */
export function parseMessageType(message: any): LogMessage['type'] {
  if (message.type === 'broadcast') return 'broadcast'
  if (message.taskId || message.assignment) return 'task_assignment'
  if (message.status || message.progress !== undefined) return 'status_update'
  if (message.request) return 'request'
  return 'response'
}

/**
 * 标准化日志消息
 */
export function normalizeLogMessage(raw: any, teamName: string): LogMessage {
  return {
    id: raw.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: raw.timestamp || raw.createdAt || Date.now(),
    from: raw.from || raw.sender || raw.agentId || 'unknown',
    to: raw.to || raw.recipient || (raw.type === 'broadcast' ? 'all' : 'unknown'),
    type: raw.type || parseMessageType(raw),
    content: raw.content || raw.message || JSON.stringify(raw),
    teamName,
  }
}

/**
 * 获取所有团队的通信日志
 */
export async function getAllTeamLogs(): Promise<TeamCommunicationLogs[]> {
  const teamsDir = path.join(homedir(), '.claude', 'teams')

  try {
    const teamDirs = await fs.readdir(teamsDir, { withFileTypes: true })
    const results: TeamCommunicationLogs[] = []

    for (const dir of teamDirs) {
      if (!dir.isDirectory()) continue

      const messages = await readTeamLogs(dir.name)
      if (messages.length > 0) {
        results.push({
          teamName: dir.name,
          messages,
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error getting all team logs:', error)
    return []
  }
}
