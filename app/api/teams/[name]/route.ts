import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { TeamConfig, Task } from '@/lib/types'
import { homedir } from 'os'

const TEAMS_DIR = path.join(homedir(), '.claude', 'teams')
const TASKS_DIR = path.join(homedir(), '.claude', 'tasks')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const configPath = path.join(TEAMS_DIR, name, 'config.json')

    // 读取team配置
    const configContent = await fs.readFile(configPath, 'utf-8')
    const config: TeamConfig = JSON.parse(configContent)

    // 读取任务
    const taskDir = path.join(TASKS_DIR, name)
    const tasks: Task[] = []

    try {
      const taskFiles = await fs.readdir(taskDir)
      for (const file of taskFiles) {
        if (file === '.lock') continue

        try {
          const taskPath = path.join(taskDir, file)
          const taskContent = await fs.readFile(taskPath, 'utf-8')
          const task: Task = JSON.parse(taskContent)
          tasks.push(task)
        } catch {
          // 跳过无法读取的任务
        }
      }
    } catch {
      // 任务目录不存在
    }

    return NextResponse.json({
      config,
      tasks,
    })
  } catch (error) {
    console.error(`Error reading team:`, error)
    return NextResponse.json(
      { error: 'Failed to read team', details: String(error) },
      { status: 500 }
    )
  }
}
