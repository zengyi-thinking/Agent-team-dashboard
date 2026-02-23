'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  ExternalLink,
  Plug,
  Search,
  Shield,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react'

interface Plugin {
  name: string
  enabled: boolean
  installations: Array<{
    scope: string
    version: string
    installedAt: string
    lastUpdated: string
    installPath: string
    gitCommitSha?: string
  }>
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [stats, setStats] = useState<{ totalInstalled: number; totalEnabled: number }>({
    totalInstalled: 0,
    totalEnabled: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/plugins')
      const data = await res.json()
      setPlugins(data.plugins || [])
      setStats(data.stats || { totalInstalled: 0, totalEnabled: 0 })
    } catch (error) {
      console.error('Error fetching plugins:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlugins = plugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.name.includes('@')
  )

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
      {/* 头部统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已安装</p>
                <p className="text-3xl font-bold">{stats.totalInstalled}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Plug className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已启用</p>
                <p className="text-3xl font-bold">{stats.totalEnabled}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">未启用</p>
                <p className="text-3xl font-bold">{stats.totalInstalled - stats.totalEnabled}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索插件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 插件列表 */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlugins.map((plugin) => (
            <Card key={plugin.name} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {plugin.name}
                      {plugin.enabled ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          已启用
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          未启用
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {plugin.installations[0]?.installPath}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    v{plugin.installations[0]?.version || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {plugin.installations[0]?.scope}
                  </Badge>
                  {plugin.installations[0]?.gitCommitSha && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {plugin.installations[0]?.gitCommitSha?.substring(0, 7)}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>安装时间: {plugin.installations[0]?.installedAt ? new Date(plugin.installations[0].installedAt).toLocaleDateString('zh-CN') : 'N/A'}</p>
                  <p>最后更新: {plugin.installations[0]?.lastUpdated ? new Date(plugin.installations[0].lastUpdated).toLocaleDateString('zh-CN') : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
