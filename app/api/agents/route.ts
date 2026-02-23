import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'
import type { Agent, Session } from '@/lib/types'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')
const TEAMS_DIR = path.join(CLAUDE_DIR, 'teams')
const SESSIONS_DIR = path.join(CLAUDE_DIR, 'sessions')

// 从团队配置中提取 Agent 信息
async function getAgentsFromTeams(): Promise<Agent[]> {
  const agents: Agent[] = []

  try {
    await fs.access(TEAMS_DIR)
  } catch {
    return agents
  }

  const teamDirs = await fs.readdir(TEAMS_DIR, { withFileTypes: true })

  for (const dir of teamDirs) {
    if (!dir.isDirectory()) continue

    const configPath = path.join(TEAMS_DIR, dir.name, 'config.json')
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(content)

      for (const member of config.members || []) {
        const existingAgent = agents.find(a => a.id === member.agentId)
        if (!existingAgent) {
          agents.push({
            id: member.agentId,
            name: member.name,
            description: `Agent in team: ${dir.name}`,
            agentType: member.agentType as Agent['agentType'],
            model: mapModel(member.model),
            status: member.tmuxPaneId ? 'working' : 'idle',
            capabilities: [],
            joinedAt: member.joinedAt,
            lastActivity: Date.now(),
            metrics: {
              tasksCompleted: 0,
              tasksInProgress: 0,
              totalTokens: 0,
              avgResponseTime: 0,
              successRate: 100,
            },
            config: {
              maxTokens: 4096,
              temperature: 0.7,
            },
          })
        }
      }
    } catch {
      continue
    }
  }

  return agents
}

// 映射模型名称
function mapModel(model: string): Agent['model'] {
  const modelMap: Record<string, Agent['model']> = {
    'claude-opus-4-6': 'opus',
    'claude-sonnet-4-6': 'sonnet',
    'claude-haiku-4': 'haiku',
  }
  return modelMap[model] || 'sonnet'
}

// 获取活动的会话
async function getActiveSessions(): Promise<Session[]> {
  const sessions: Session[] = []

  try {
    await fs.access(SESSIONS_DIR)
  } catch {
    return sessions
  }

  const sessionFiles = await fs.readdir(SESSIONS_DIR)

  for (const file of sessionFiles) {
    if (!file.endsWith('.json')) continue

    const sessionPath = path.join(SESSIONS_DIR, file)
    try {
      const content = await fs.readFile(sessionPath, 'utf-8')
      const session = JSON.parse(content)

      sessions.push({
        id: session.id || file.replace('.json', ''),
        agentId: session.agentId || 'unknown',
        teamId: session.teamId,
        projectPath: session.projectPath,
        startedAt: session.startedAt || Date.now(),
        lastActivity: session.lastActivity || Date.now(),
        messages: session.messages || 0,
        tokens: session.tokens || 0,
        status: session.status || 'active',
      })
    } catch {
      continue
    }
  }

  return sessions
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'agents' | 'sessions' | 'all'

    const agents = await getAgentsFromTeams()
    const sessions = await getActiveSessions()

    // 将会话信息合并到 Agent
    for (const agent of agents) {
      const agentSessions = sessions.filter(s => s.agentId === agent.id)
      if (agentSessions.length > 0) {
        const activeSession = agentSessions.find(s => s.status === 'active')
        if (activeSession) {
          agent.status = 'working'
          agent.currentTask = activeSession.projectPath
        }
      }
    }

    switch (type) {
      case 'agents':
        return NextResponse.json({ agents })
      case 'sessions':
        return NextResponse.json({ sessions })
      case 'all':
      default:
        return NextResponse.json({ agents, sessions })
    }
  } catch (error) {
    console.error('Error reading agents:', error)
    return NextResponse.json(
      { error: 'Failed to read agents', details: String(error) },
      { status: 500 }
    )
  }
}

// 创建新的 Agent 团队
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, teamName, members, config } = body

    switch (action) {
      case 'create-team': {
        if (!teamName) {
          return NextResponse.json(
            { error: 'teamName is required' },
            { status: 400 }
          )
        }

        const teamDir = path.join(TEAMS_DIR, teamName)
        const configPath = path.join(teamDir, 'config.json')

        // 检查团队是否已存在
        try {
          await fs.access(configPath)
          return NextResponse.json(
            { error: 'Team already exists' },
            { status: 409 }
          )
        } catch {
          // 团队不存在，继续创建
        }

        // 创建团队目录和配置
        await fs.mkdir(teamDir, { recursive: true })
        await fs.mkdir(path.join(teamDir, 'tasks'), { recursive: true })
        await fs.mkdir(path.join(teamDir, 'sessions'), { recursive: true })

        const teamConfig = {
          name: teamName,
          description: config?.description || `Agent team: ${teamName}`,
          createdAt: Date.now(),
          leadAgentId: members?.[0]?.agentId || 'agent-1',
          leadSessionId: '',
          members: members || [
            {
              agentId: 'agent-1',
              name: 'Team Lead',
              agentType: 'planner',
              model: 'sonnet',
              joinedAt: Date.now(),
              tmuxPaneId: '',
              cwd: process.cwd(),
              subscriptions: [],
            },
          ],
        }

        await fs.writeFile(configPath, JSON.stringify(teamConfig, null, 2))

        return NextResponse.json({
          success: true,
          message: `Team ${teamName} created successfully`,
          config: teamConfig,
        })
      }

      case 'add-member': {
        if (!teamName || !config?.agentId) {
          return NextResponse.json(
            { error: 'teamName and agentId are required' },
            { status: 400 }
          )
        }

        const configPath = path.join(TEAMS_DIR, teamName, 'config.json')
        const content = await fs.readFile(configPath, 'utf-8')
        const teamConfig = JSON.parse(content)

        teamConfig.members.push({
          agentId: config.agentId,
          name: config.name || 'New Agent',
          agentType: config.agentType || 'general-purpose',
          model: config.model || 'sonnet',
          joinedAt: Date.now(),
          tmuxPaneId: '',
          cwd: config.cwd || process.cwd(),
          subscriptions: [],
        })

        await fs.writeFile(configPath, JSON.stringify(teamConfig, null, 2))

        return NextResponse.json({
          success: true,
          message: `Member added to team ${teamName}`,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Failed to create agent', details: String(error) },
      { status: 500 }
    )
  }
}
