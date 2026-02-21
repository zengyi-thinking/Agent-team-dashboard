import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { TeamConfig, TeamSummary } from '@/lib/types'
import { homedir } from 'os'

const TEAMS_DIR = path.join(homedir(), '.claude', 'teams')
const TASKS_DIR = path.join(homedir(), '.claude', 'tasks')

export async function GET() {
  try {
    // 检查teams目录是否存在
    try {
      await fs.access(TEAMS_DIR)
    } catch {
      return NextResponse.json({ teams: [] })
    }

    // 读取所有team目录
    const teamDirs = await fs.readdir(TEAMS_DIR, { withFileTypes: true })
    const teams: TeamSummary[] = []

    for (const dir of teamDirs) {
      if (!dir.isDirectory()) continue

      const configPath = path.join(TEAMS_DIR, dir.name, 'config.json')
      try {
        const configContent = await fs.readFile(configPath, 'utf-8')
        const config: TeamConfig = JSON.parse(configContent)

        // 读取任务数量
        const taskDir = path.join(TASKS_DIR, dir.name)
        let taskCount = 0
        let lastActivity = config.createdAt

        try {
          const taskFiles = await fs.readdir(taskDir)
          taskCount = taskFiles.filter(f => f !== '.lock').length

          // 获取最新修改时间
          const stats = await Promise.all(
            taskFiles.map(f => fs.stat(path.join(taskDir, f)).catch(() => ({ mtime: new Date(0) })))
          )
          const latestMtime = stats.reduce((max, stat) =>
            stat.mtime > max ? stat.mtime : max, new Date(0)
          )
          lastActivity = Math.max(config.createdAt, latestMtime.getTime())
        } catch {
          // 任务目录不存在或读取失败
        }

        teams.push({
          config,
          memberCount: config.members.length,
          activeMembers: config.members.filter(m => m.tmuxPaneId).length,
          taskCount,
          lastActivity,
        })
      } catch (error) {
        console.error(`Error reading team ${dir.name}:`, error)
      }
    }

    // 按创建时间排序
    teams.sort((a, b) => b.config.createdAt - a.config.createdAt)

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Error reading teams:', error)
    return NextResponse.json(
      { error: 'Failed to read teams', details: String(error) },
      { status: 500 }
    )
  }
}
