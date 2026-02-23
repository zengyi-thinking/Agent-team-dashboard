import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'
import type { MCPServer, MCPServerConfig } from '@/lib/types'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')

// 尝试从多个位置读取 MCP 配置
async function findMCPConfig(): Promise<MCPServerConfig | null> {
  const configPaths = [
    path.join(CLAUDE_DIR, 'mcp.json'),
    path.join(CLAUDE_DIR, 'mcp-servers.json'),
    path.join(CLAUDE_DIR, 'settings', 'mcp.json'),
  ]

  for (const configPath of configPaths) {
    try {
      await fs.access(configPath)
      const content = await fs.readFile(configPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      continue
    }
  }

  return null
}

// 解析 MCP 服务器定义
function parseMCPServers(config: MCPServerConfig): MCPServer[] {
  const servers: MCPServer[] = []
  const now = Date.now()

  for (const [name, definition] of Object.entries(config.mcpServers || {})) {
    const isStdio = !!definition.command
    const isHTTP = !!definition.url

    servers.push({
      id: name,
      name,
      type: isStdio ? 'stdio' : isHTTP ? 'http' : 'sse',
      command: definition.command,
      args: definition.args,
      url: definition.url,
      env: definition.env,
      enabled: true,
      capabilities: [], // 需要动态检测
      status: 'disconnected',
      lastPing: now,
    })
  }

  return servers
}

export async function GET() {
  try {
    const config = await findMCPConfig()

    if (!config) {
      return NextResponse.json({
        servers: [],
        message: 'No MCP configuration found',
      })
    }

    const servers = parseMCPServers(config)

    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Error reading MCP servers:', error)
    return NextResponse.json(
      { error: 'Failed to read MCP servers', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, serverName, config } = body

    const configPath = path.join(CLAUDE_DIR, 'mcp.json')

    // 读取现有配置
    let existingConfig: MCPServerConfig = { mcpServers: {} }
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      existingConfig = JSON.parse(content)
    } catch {
      // 配置不存在，创建新的
    }

    switch (action) {
      case 'add': {
        if (!serverName || !config) {
          return NextResponse.json(
            { error: 'serverName and config are required' },
            { status: 400 }
          )
        }
        existingConfig.mcpServers[serverName] = config
        break
      }
      case 'remove': {
        if (!serverName) {
          return NextResponse.json(
            { error: 'serverName is required' },
            { status: 400 }
          )
        }
        delete existingConfig.mcpServers[serverName]
        break
      }
      case 'update': {
        if (!serverName || !config) {
          return NextResponse.json(
            { error: 'serverName and config are required' },
            { status: 400 }
          )
        }
        existingConfig.mcpServers[serverName] = config
        break
      }
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: add, remove, or update' },
          { status: 400 }
        )
    }

    // 写入配置
    await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2))

    return NextResponse.json({
      success: true,
      message: `MCP server ${action}ed successfully`,
    })
  } catch (error) {
    console.error('Error updating MCP config:', error)
    return NextResponse.json(
      { error: 'Failed to update MCP config', details: String(error) },
      { status: 500 }
    )
  }
}
