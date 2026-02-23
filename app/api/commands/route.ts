import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')
const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands')

interface Command {
  name: string
  description: string
  source: string
  content?: string
}

export async function GET() {
  try {
    const commands: Command[] = []

    // 读取 commands 目录下的所有命令
    try {
      const entries = await fs.readdir(COMMANDS_DIR, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const commandDir = path.join(COMMANDS_DIR, entry.name)

        // 读取命令描述
        let description = '自定义命令'
        let content = ''

        try {
          const readmePath = path.join(commandDir, 'CLAUDE.md')
          const readmeContent = await fs.readFile(readmePath, 'utf-8')
          // 从 CLAUDE.md 第一行获取描述
          const lines = readmeContent.split('\n')
          description = lines[0]?.replace(/^#\s*/, '') || description
        } catch {
          // CLAUDE.md 不存在
        }

        try {
          const promptPath = path.join(commandDir, 'PROMPT.md')
          content = await fs.readFile(promptPath, 'utf-8')
        } catch {
          // PROMPT.md 不存在
        }

        commands.push({
          name: entry.name,
          description,
          source: 'custom',
          content: content.substring(0, 500), // 限制内容长度
        })
      }
    } catch {
      // commands 目录不存在
    }

    // 添加一些内置命令
    const builtinCommands: Command[] = [
      {
        name: 'test',
        description: '运行测试',
        source: 'builtin',
      },
      {
        name: 'debug',
        description: '调试代码',
        source: 'builtin',
      },
      {
        name: 'refactor',
        description: '重构代码',
        source: 'builtin',
      },
      {
        name: 'docs',
        description: '生成文档',
        source: 'builtin',
      },
    ]

    // 合并命令（排除重复）
    const allCommands = [...builtinCommands]
    for (const cmd of commands) {
      if (!allCommands.some(c => c.name === cmd.name)) {
        allCommands.push(cmd)
      }
    }

    return NextResponse.json({
      commands: allCommands,
      stats: {
        total: allCommands.length,
        builtin: builtinCommands.length,
        custom: commands.length,
      },
    })
  } catch (error) {
    console.error('Error reading commands:', error)
    return NextResponse.json(
      { error: 'Failed to read commands', details: String(error) },
      { status: 500 }
    )
  }
}
