import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects')

export async function GET() {
  try {
    const projects: Array<{
      name: string
      path: string
      claudeMd?: string
      prompts?: string[]
      instructions?: string[]
      lastOpened?: number
    }> = []

    // 检查 projects 目录是否存在
    try {
      await fs.access(PROJECTS_DIR)
    } catch {
      return NextResponse.json({ projects: [] })
    }

    // 读取所有项目目录
    const projectDirs = await fs.readdir(PROJECTS_DIR, { withFileTypes: true })

    for (const dir of projectDirs) {
      if (!dir.isDirectory()) continue

      const projectPath = path.join(PROJECTS_DIR, dir.name)
      const claudeMdPath = path.join(projectPath, 'CLAUDE.md')
      const promptsPath = path.join(projectPath, '.claude-prompts')
      const instructionsPath = path.join(projectPath, '.claude-instructions')

      let claudeMd: string | undefined
      let prompts: string[] = []
      let instructions: string[] = []
      let lastOpened: number | undefined

      // 读取 CLAUDE.md
      try {
        claudeMd = (await fs.readFile(claudeMdPath, 'utf-8')).substring(0, 1000)
      } catch {
        // CLAUDE.md 不存在
      }

      // 读取 prompts
      try {
        const promptsFiles = await fs.readdir(promptsPath)
        for (const file of promptsFiles) {
          if (file.endsWith('.md') || file.endsWith('.txt')) {
            const content = await fs.readFile(path.join(promptsPath, file), 'utf-8')
            prompts.push(content.substring(0, 500))
          }
        }
      } catch {
        // prompts 目录不存在
      }

      // 读取 instructions
      try {
        const instFiles = await fs.readdir(instructionsPath)
        for (const file of instFiles) {
          if (file.endsWith('.md') || file.endsWith('.txt')) {
            const content = await fs.readFile(path.join(instructionsPath, file), 'utf-8')
            instructions.push(content.substring(0, 500))
          }
        }
      } catch {
        // instructions 目录不存在
      }

      // 获取项目目录的修改时间
      try {
        const stats = await fs.stat(projectPath)
        lastOpened = stats.mtime.getTime()
      } catch {
        // 无法获取修改时间
      }

      projects.push({
        name: dir.name,
        path: projectPath,
        claudeMd,
        prompts,
        instructions,
        lastOpened,
      })
    }

    // 按最后打开时间排序
    projects.sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error reading projects:', error)
    return NextResponse.json(
      { error: 'Failed to read projects', details: String(error) },
      { status: 500 }
    )
  }
}
