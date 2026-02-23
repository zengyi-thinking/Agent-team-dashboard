import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')

export async function GET() {
  try {
    // 读取 settings.json
    let settings: Record<string, unknown> = {}
    try {
      const settingsContent = await fs.readFile(path.join(CLAUDE_DIR, 'settings.json'), 'utf-8')
      settings = JSON.parse(settingsContent)
    } catch {
      // settings.json 不存在
    }

    // 读取 settings.local.json
    let localSettings: Record<string, unknown> = {}
    try {
      const localContent = await fs.readFile(path.join(CLAUDE_DIR, 'settings.local.json'), 'utf-8')
      localSettings = JSON.parse(localContent)
    } catch {
      // settings.local.json 不存在
    }

    // 读取 config.json
    let config: Record<string, unknown> = {}
    try {
      const configContent = await fs.readFile(path.join(CLAUDE_DIR, 'config.json'), 'utf-8')
      config = JSON.parse(configContent)
    } catch {
      // config.json 不存在
    }

    return NextResponse.json({
      settings,
      localSettings,
      config,
    })
  } catch (error) {
    console.error('Error reading settings:', error)
    return NextResponse.json(
      { error: 'Failed to read settings', details: String(error) },
      { status: 500 }
    )
  }
}
