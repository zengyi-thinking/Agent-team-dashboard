import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

const PROJECTS_DIR = path.join(homedir(), '.claude', 'projects')

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface Conversation {
  id: string
  title?: string
  projectName?: string
  sessionId?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  firstMessage?: string
  messages?: ConversationMessage[]
}

interface ProjectConversations {
  projectName: string
  projectPath: string
  conversations: Conversation[]
  totalMessages: number
}

// 解析JSONL文件获取对话
async function parseJsonlFile(filePath: string): Promise<ConversationMessage[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n')
    const messages: ConversationMessage[] = []

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        if (entry.type === 'user' && entry.message?.content) {
          const text = extractTextContent(entry.message.content)
          if (text) {
            messages.push({
              role: 'user',
              content: text.slice(0, 500),
              timestamp: new Date(entry.timestamp).getTime(),
            })
          }
        } else if (entry.type === 'result' && entry.message?.content) {
          const text = extractTextContent(entry.message.content)
          if (text) {
            messages.push({
              role: 'assistant',
              content: text.slice(0, 500),
              timestamp: new Date(entry.timestamp).getTime(),
            })
          }
        }
      } catch {
        // 跳过解析失败的行
      }
    }

    return messages
  } catch {
    return []
  }
}

// 提取文本内容
function extractTextContent(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text || '')
      .join('')
  }
  if (content?.text) return content.text
  return ''
}

// 获取项目列表
async function getProjectList(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort()
  } catch {
    return []
  }
}

// 从项目目录获取对话
async function getProjectConversations(projectName: string): Promise<Conversation[]> {
  const projectPath = path.join(PROJECTS_DIR, projectName)
  const conversations: Conversation[] = []

  try {
    const files = await fs.readdir(projectPath)

    // 查找所有jsonl文件
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

    for (const file of jsonlFiles) {
      const filePath = path.join(projectPath, file)
      const messages = await parseJsonlFile(filePath)

      if (messages.length > 0) {
        const timestamps = messages.map(m => m.timestamp || 0).filter(t => t > 0)
        const sessionId = file.replace('.jsonl', '')

        conversations.push({
          id: sessionId,
          projectName,
          sessionId,
          createdAt: Math.min(...timestamps),
          updatedAt: Math.max(...timestamps),
          messageCount: messages.length,
          firstMessage: messages[0]?.content?.slice(0, 100),
          messages: messages.slice(0, 10), // 只返回前10条消息
        })
      }
    }

    // 按更新时间排序
    conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error(`Error reading project ${projectName}:`, error)
  }

  return conversations
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const grouped = searchParams.get('grouped') === 'true'
    const project = searchParams.get('project')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 如果请求特定项目
    if (project) {
      const conversations = await getProjectConversations(project)
      return NextResponse.json({
        project,
        conversations: conversations.slice(0, limit),
      })
    }

    // 如果请求按项目分组
    if (grouped) {
      const projectNames = await getProjectList()
      const projects: ProjectConversations[] = []

      for (const projectName of projectNames) {
        const conversations = await getProjectConversations(projectName)
        if (conversations.length > 0) {
          projects.push({
            projectName,
            projectPath: path.join(PROJECTS_DIR, projectName),
            conversations: conversations.slice(0, limit),
            totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
          })
        }
      }

      // 按最新消息排序项目
      projects.sort((a, b) => {
        const aLatest = a.conversations[0]?.updatedAt || 0
        const bLatest = b.conversations[0]?.updatedAt || 0
        return bLatest - aLatest
      })

      return NextResponse.json({ projects })
    }

    // 默认返回所有对话（扁平化）
    const projectNames = await getProjectList()
    const allConversations: Conversation[] = []

    for (const projectName of projectNames) {
      const conversations = await getProjectConversations(projectName)
      allConversations.push(...conversations)
    }

    // 按更新时间排序并限制数量
    allConversations.sort((a, b) => b.updatedAt - a.updatedAt)
    const limitedConversations = allConversations.slice(0, limit)

    return NextResponse.json({ conversations: limitedConversations })
  } catch (error) {
    console.error('Error reading conversations:', error)
    return NextResponse.json(
      { error: 'Failed to read conversations', details: String(error) },
      { status: 500 }
    )
  }
}
