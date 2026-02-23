'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Activity,
  Brain,
  Clock,
  Code,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import type { Agent, Session } from '@/lib/types'

// Agent 类型徽章颜色
const agentTypeColors: Record<string, string> = {
  'general-purpose': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'code-explorer': 'bg-green-500/20 text-green-400 border-green-500/30',
  'code-architect': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'code-reviewer': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'test-runner': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  researcher: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  planner: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  implementer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  communicator: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

// 状态徽章
const statusColors: Record<string, string> = {
  idle: 'bg-gray-500/20 text-gray-400',
  working: 'bg-green-500/20 text-green-400',
  thinking: 'bg-blue-500/20 text-blue-400',
  waiting: 'bg-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/20 text-red-400',
  offline: 'bg-gray-600/20 text-gray-500',
}

// 模型徽章
const modelColors: Record<string, string> = {
  opus: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  sonnet: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  haiku: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [agentsRes, sessionsRes] = await Promise.all([
        fetch('/api/agents?type=all'),
        fetch('/api/agents?type=sessions'),
      ])

      const agentsData = await agentsRes.json()
      const sessionsData = await sessionsRes.json()

      setAgents(agentsData.agents || [])
      setSessions(sessionsData.sessions || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status === 'working').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    totalTasks: agents.reduce((acc, a) => acc + a.metrics.tasksCompleted, 0),
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
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总智能体</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">工作中</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">空闲中</p>
                <p className="text-3xl font-bold">{stats.idle}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">完成任务</p>
                <p className="text-3xl font-bold">{stats.totalTasks}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-500" />
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
            placeholder="搜索智能体..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建智能体
        </Button>
      </div>

      {/* 智能体列表 */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Dialog key={agent.id}>
              <DialogTrigger asChild>
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {agent.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {agent.currentTask || agent.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={statusColors[agent.status]}>
                        {agent.status === 'working' ? '工作中' : agent.status === 'idle' ? '空闲' : agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={agentTypeColors[agent.agentType]}>
                        {agent.agentType}
                      </Badge>
                      <Badge variant="outline" className={modelColors[agent.model]}>
                        {agent.model}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{agent.metrics.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">已完成</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{agent.metrics.tasksInProgress}</p>
                        <p className="text-xs text-muted-foreground">进行中</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{agent.metrics.successRate}%</p>
                        <p className="text-xs text-muted-foreground">成功率</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {agent.name}
                  </DialogTitle>
                  <DialogDescription>{agent.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">类型</p>
                      <Badge variant="outline" className={agentTypeColors[agent.agentType]}>
                        {agent.agentType}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">模型</p>
                      <Badge variant="outline" className={modelColors[agent.model]}>
                        {agent.model}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">状态</p>
                      <Badge className={statusColors[agent.status]}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">加入时间</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(agent.joinedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.metrics.tasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">已完成任务</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.metrics.tasksInProgress}</p>
                      <p className="text-xs text-muted-foreground">进行中任务</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.metrics.totalTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">总 Token</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.metrics.avgResponseTime}ms</p>
                      <p className="text-xs text-muted-foreground">平均响应</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
