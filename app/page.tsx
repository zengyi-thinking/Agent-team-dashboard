'use client'

import { useState, useEffect } from 'react'
import { TeamCard } from '@/components/team-card'
import { TeamDetailDialog } from '@/components/team-detail-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useWebSocket } from '@/hooks/use-websocket'
import type { TeamSummary } from '@/lib/types'
import {
  Users,
  FileText,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  MessageSquare,
  Network,
  TrendingUp,
  Download,
  Moon,
  Zap,
  Clock,
  Bot,
  FolderOpen,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ProjectConversations } from '@/components/project-conversations'

export default function HomePage() {
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teams')
      const data = await res.json()
      setTeams(data.teams || [])
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations?limit=10')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  // WebSocket实时更新
  const { isConnected, connectionStatus } = useWebSocket({
    onTeamsUpdate: fetchTeams,
    onTasksUpdate: fetchTeams,
    onConversationsUpdate: fetchConversations,
    enabled: true,
  })

  useEffect(() => {
    fetchTeams()
    fetchConversations()
  }, [])

  const handleViewDetails = (teamName: string) => {
    setSelectedTeam(teamName)
    setDialogOpen(true)
  }

  // 计算统计数据
  const totalTeams = teams.length
  const totalMembers = teams.reduce((sum, t) => sum + t.memberCount, 0)
  const activeMembers = teams.reduce((sum, t) => sum + t.activeMembers, 0)
  const totalTasks = teams.reduce((sum, t) => sum + t.taskCount, 0)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] gradient-bg">
      {/* Header */}
      <header className="border-b bg-[hsl(var(--card))]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500 bg-clip-text text-transparent">
                Agent Team Dashboard
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                监控面板 - Agent Teams 历史对话和团队协作
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 状态指示器 */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--secondary))]">
                {isConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-500 font-medium">实时同步</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">离线</span>
                  </>
                )}
              </div>
              <Button
                onClick={fetchTeams}
                variant="outline"
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* 统计卡片 - 横向排列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 团队数 */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-500">Agent Teams</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTeams}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {totalMembers} 位成员
              </p>
            </CardContent>
          </Card>

          {/* 活跃成员 */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-500">活跃成员</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Bot className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeMembers}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                正在运行中
              </p>
            </CardContent>
          </Card>

          {/* 任务数 */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-500">总任务数</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTasks}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                等待处理
              </p>
            </CardContent>
          </Card>

          {/* 系统状态 */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-500">系统状态</CardTitle>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className="text-xl font-bold">{isConnected ? '在线' : '离线'}</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {loading ? '加载中...' : '正常运行'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区: Dashboard 概览 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 最近活动团队 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                最近活跃团队
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <a href="/teams" className="text-sm">查看全部 &rarr;</a>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : teams.length === 0 ? (
              <Card className="border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">暂无执行任务的团队</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.slice(0, 4).map((team) => (
                  <TeamCard
                    key={team.config.name}
                    team={team}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 最近全局对话历史 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                最近对话历史
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <a href="/conversations" className="text-sm">查看全部 &rarr;</a>
              </Button>
            </div>

            {conversations.length === 0 ? (
              <Card className="border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">暂无对话历史</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {conversations.slice(0, 3).map((conv) => (
                  <Card key={conv.id} className="card-hover">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base truncate max-w-[200px] md:max-w-xs">{conv.title || conv.projectName || conv.id}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(conv.updatedAt).toLocaleString('zh-CN')}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {conv.messageCount || (conv.messages?.length || 0)} 条消息
                        </Badge>
                      </div>
                    </CardHeader>
                    {conv.messages && conv.messages.length > 0 && (
                      <CardContent className="py-2 px-4 pb-4">
                        <div className="space-y-2 overflow-hidden">
                          {conv.messages.slice(-2).map((msg: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg ${msg.role === 'user'
                                  ? 'bg-[hsl(var(--primary))]/10 ml-6'
                                  : 'bg-[hsl(var(--secondary))] mr-6'
                                }`}
                            >
                              <div className="text-[10px] font-medium mb-1 opacity-70">
                                {msg.role === 'user' ? '你' : 'Claude'}
                              </div>
                              <div className="text-xs line-clamp-1">
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <TeamDetailDialog
        teamName={selectedTeam}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
