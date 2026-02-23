'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Command,
  Hash,
  Search,
  Terminal,
} from 'lucide-react'

interface CommandItem {
  name: string
  description: string
  source: string
  content?: string
}

export default function CommandsPage() {
  const [commands, setCommands] = useState<CommandItem[]>([])
  const [stats, setStats] = useState<{ total: number; builtin: number; custom: number }>({
    total: 0,
    builtin: 0,
    custom: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/commands')
      const data = await res.json()
      setCommands(data.commands || [])
      setStats(data.stats || { total: 0, builtin: 0, custom: 0 })
    } catch (error) {
      console.error('Error fetching commands:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总命令数</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Command className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">内置命令</p>
                <p className="text-3xl font-bold">{stats.builtin}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Terminal className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">自定义命令</p>
                <p className="text-3xl font-bold">{stats.custom}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Hash className="h-6 w-6 text-violet-500" />
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
          placeholder="搜索命令..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 命令列表 */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommands.map((cmd) => (
            <Card key={cmd.name} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Command className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">/{cmd.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {cmd.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={cmd.source === 'builtin' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'}>
                    {cmd.source === 'builtin' ? '内置' : '自定义'}
                  </Badge>
                </div>
              </CardHeader>
              {cmd.content && (
                <CardContent className="pt-0">
                  <div className="p-2 rounded bg-muted text-xs font-mono truncate">
                    {cmd.content.substring(0, 100)}...
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
