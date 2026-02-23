'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Globe,
  Hash,
  Key,
  Plug,
  Puzzle,
  Save,
  Settings as SettingsIcon,
  Shield,
  Terminal,
  Wrench,
} from 'lucide-react'

interface SettingsData {
  settings: Record<string, unknown>
  localSettings: Record<string, unknown>
  config: Record<string, unknown>
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claude Code 设置</h1>
          <p className="text-muted-foreground">查看和管理 Claude Code 配置</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="env">环境变量</TabsTrigger>
          <TabsTrigger value="permissions">权限</TabsTrigger>
          <TabsTrigger value="plugins">插件</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  模型配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">默认模型:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.ANTHROPIC_MODEL as string || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Haiku:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.ANTHROPIC_DEFAULT_HAIKU_MODEL as string || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sonnet:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.ANTHROPIC_DEFAULT_SONNET_MODEL as string || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opus:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.ANTHROPIC_DEFAULT_OPUS_MODEL as string || 'N/A'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  输出风格
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">风格:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.outputStyle as string || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">包含 Co-Author:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.includeCoAuthoredBy ? '是' : '否'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API 配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API URL:</span>
                    <Badge variant="outline" className="text-xs">自定义</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">超时:</span>
                    <Badge variant="outline">{(settings?.settings as Record<string, unknown>)?.API_TIMEOUT_MS as string || 'N/A'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">配置源文件</CardTitle>
              <CardDescription>Claude Code 配置文件位置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">settings.json</p>
                  <p className="text-xs text-muted-foreground">~/.claude/settings.json</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">settings.local.json</p>
                  <p className="text-xs text-muted-foreground">~/.claude/settings.local.json</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">config.json</p>
                  <p className="text-xs text-muted-foreground">~/.claude/config.json</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>环境变量</CardTitle>
              <CardDescription>Claude Code 使用的环境变量</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2">
                  {Object.entries((settings?.settings as Record<string, unknown>)?.env || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <code className="text-sm font-mono">{key}</code>
                      <span className="text-sm text-muted-foreground truncate max-w-md">
                        {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>权限配置</CardTitle>
              <CardDescription>Claude Code 权限设置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">允许的权限</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(((settings?.settings as Record<string, unknown>)?.permissions as Record<string, unknown>)?.allow) &&
                      (((settings?.settings as Record<string, unknown>)?.permissions as Record<string, unknown>)?.allow as string[]).map((perm: string) => (
                        <Badge key={perm} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                          {perm}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">拒绝的权限</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(((settings?.settings as Record<string, unknown>)?.permissions as Record<string, unknown>)?.deny) &&
                      (((settings?.settings as Record<string, unknown>)?.permissions as Record<string, unknown>)?.deny as string[]).map((perm: string) => (
                        <Badge key={perm} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                          {perm}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>插件配置</CardTitle>
              <CardDescription>已安装和启用的插件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                请访问 /plugins 页面查看详情
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>MCP 配置</CardTitle>
              <CardDescription>MCP 服务器配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                请访问 /mcp 页面查看详情
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
