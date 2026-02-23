'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Database,
  Globe,
  Plus,
  Puzzle,
  Search,
  Server,
  Terminal,
  XCircle,
} from 'lucide-react'
import type { MCPServer } from '@/lib/types'

// 状态颜色映射
const statusColors: Record<string, string> = {
  connected: 'bg-green-500/20 text-green-400 border-green-500/30',
  disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// 服务器类型图标
const serverTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  stdio: Terminal,
  sse: Globe,
  http: Server,
}

export default function MCPPage() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newServer, setNewServer] = useState({
    name: '',
    type: 'stdio' as 'stdio' | 'http',
    command: '',
    args: '',
    url: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/mcp')
      const data = await res.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Error fetching MCP servers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddServer() {
    try {
      const config: Record<string, unknown> = {}
      if (newServer.type === 'stdio') {
        config.command = newServer.command
        config.args = newServer.args ? newServer.args.split(' ') : []
      } else {
        config.url = newServer.url
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          serverName: newServer.name,
          config,
        }),
      })

      if (res.ok) {
        setShowAddDialog(false)
        setNewServer({ name: '', type: 'stdio', command: '', args: '', url: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error adding MCP server:', error)
    }
  }

  async function handleRemoveServer(serverName: string) {
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          serverName,
        }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error removing MCP server:', error)
    }
  }

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.command?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.url?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: servers.length,
    connected: servers.filter((s) => s.status === 'connected').length,
    disconnected: servers.filter((s) => s.status === 'disconnected').length,
    error: servers.filter((s) => s.status === 'error').length,
    stdio: servers.filter((s) => s.type === 'stdio').length,
    http: servers.filter((s) => s.type === 'http').length,
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
      {/* 头部统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总服务数</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Puzzle className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已连接</p>
                <p className="text-3xl font-bold">{stats.connected}</p>
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
                <p className="text-sm text-muted-foreground">未连接</p>
                <p className="text-3xl font-bold">{stats.disconnected}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">错误</p>
                <p className="text-3xl font-bold">{stats.error}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索 MCP 服务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加服务
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加 MCP 服务</DialogTitle>
              <DialogDescription>
                配置一个新的 MCP 服务器连接
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">服务名称</Label>
                <Input
                  id="name"
                  placeholder="my-mcp-server"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>连接类型</Label>
                <Tabs
                  value={newServer.type}
                  onValueChange={(v) => setNewServer({ ...newServer, type: v as 'stdio' | 'http' })}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="stdio" className="flex-1">
                      <Terminal className="h-4 w-4 mr-2" />
                      STDIO
                    </TabsTrigger>
                    <TabsTrigger value="http" className="flex-1">
                      <Globe className="h-4 w-4 mr-2" />
                      HTTP
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {newServer.type === 'stdio' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="command">命令</Label>
                    <Input
                      id="command"
                      placeholder="npx"
                      value={newServer.command}
                      onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="args">参数</Label>
                    <Input
                      id="args"
                      placeholder="-y @anthropic/mcp-server"
                      value={newServer.args}
                      onChange={(e) => setNewServer({ ...newServer, args: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="url">服务器 URL</Label>
                  <Input
                    id="url"
                    placeholder="http://localhost:3000/sse"
                    value={newServer.url}
                    onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  />
                </div>
              )}
              <Button onClick={handleAddServer} className="w-full">
                添加服务
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 服务列表 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
          <TabsTrigger value="connected">已连接 ({stats.connected})</TabsTrigger>
          <TabsTrigger value="disconnected">未连接 ({stats.disconnected})</TabsTrigger>
          <TabsTrigger value="error">错误 ({stats.error})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ServerList servers={filteredServers} onRemove={handleRemoveServer} />
        </TabsContent>
        <TabsContent value="connected" className="mt-4">
          <ServerList
            servers={filteredServers.filter((s) => s.status === 'connected')}
            onRemove={handleRemoveServer}
          />
        </TabsContent>
        <TabsContent value="disconnected" className="mt-4">
          <ServerList
            servers={filteredServers.filter((s) => s.status === 'disconnected')}
            onRemove={handleRemoveServer}
          />
        </TabsContent>
        <TabsContent value="error" className="mt-4">
          <ServerList
            servers={filteredServers.filter((s) => s.status === 'error')}
            onRemove={handleRemoveServer}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ServerList({
  servers,
  onRemove,
}: {
  servers: MCPServer[]
  onRemove: (name: string) => void
}) {
  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Puzzle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">暂无 MCP 服务</p>
        <p className="text-sm text-muted-foreground mt-1">
          添加一个 MCP 服务来扩展 Claude Code 的能力
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-480px)]">
      <div className="space-y-3">
        {servers.map((server) => {
          const Icon = serverTypeIcons[server.type] || Server
          return (
            <Card key={server.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{server.name}</h3>
                        <Badge variant="outline" className={statusColors[server.status]}>
                          {server.status === 'connected' ? '已连接' : server.status === 'disconnected' ? '未连接' : '错误'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {server.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {server.command
                          ? `${server.command} ${server.args?.join(' ') || ''}`
                          : server.url || '未配置'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onRemove(server.name)}>
                      移除
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                {server.error && (
                  <div className="mt-3 p-2 rounded bg-red-500/10 text-red-400 text-sm">
                    {server.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
