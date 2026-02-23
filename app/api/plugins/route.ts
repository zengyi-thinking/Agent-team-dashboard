import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')
const PLUGINS_DIR = path.join(CLAUDE_DIR, 'plugins')

interface PluginInfo {
  name: string
  scope: string
  version: string
  installedAt: string
  lastUpdated: string
  installPath: string
  gitCommitSha?: string
}

export async function GET() {
  try {
    // 读取已安装的插件列表
    let installedPlugins: Record<string, PluginInfo[]> = {}
    try {
      const pluginsFile = path.join(PLUGINS_DIR, 'installed_plugins.json')
      const content = await fs.readFile(pluginsFile, 'utf-8')
      const data = JSON.parse(content)
      installedPlugins = data.plugins || {}
    } catch {
      // 插件配置不存在
    }

    // 从 settings.json 读取启用的插件
    let enabledPlugins: string[] = []
    try {
      const settingsFile = path.join(CLAUDE_DIR, 'settings.json')
      const content = await fs.readFile(settingsFile, 'utf-8')
      const settings = JSON.parse(content)
      enabledPlugins = settings.enabledPlugins ? Object.keys(settings.enabledPlugins).filter(k => settings.enabledPlugins[k]) : []
    } catch {
      // settings.json 不存在
    }

    // 读取插件缓存目录
    let cachePlugins: string[] = []
    try {
      const cacheDir = path.join(PLUGINS_DIR, 'cache')
      const entries = await fs.readdir(cacheDir, { withFileTypes: true })
      cachePlugins = entries.filter(e => e.isDirectory()).map(e => e.name)
    } catch {
      // 缓存目录不存在
    }

    // 读取 known_marketplaces
    let marketplaces: Record<string, unknown> = {}
    try {
      const marketplacesFile = path.join(PLUGINS_DIR, 'known_marketplaces.json')
      const content = await fs.readFile(marketplacesFile, 'utf-8')
      marketplaces = JSON.parse(content)
    } catch {
      // marketplaces 文件不存在
    }

    // 构建插件列表
    const plugins = Object.entries(installedPlugins).map(([name, infos]) => ({
      name,
      enabled: enabledPlugins.includes(name),
      installations: infos.map(info => ({
        scope: info.scope,
        version: info.version,
        installedAt: info.installedAt,
        lastUpdated: info.lastUpdated,
        installPath: info.installPath,
        gitCommitSha: info.gitCommitSha,
      })),
    }))

    return NextResponse.json({
      plugins,
      enabledPlugins,
      marketplaces,
      stats: {
        totalInstalled: plugins.length,
        totalEnabled: enabledPlugins.length,
      },
    })
  } catch (error) {
    console.error('Error reading plugins:', error)
    return NextResponse.json(
      { error: 'Failed to read plugins', details: String(error) },
      { status: 500 }
    )
  }
}
