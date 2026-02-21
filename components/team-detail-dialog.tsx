'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatDate, getAgentTypeLabel, getModelLabel } from '@/lib/utils'
import type { TeamConfig, Task } from '@/lib/types'
import { CheckCircle2, Circle, Loader2, Download } from 'lucide-react'
import { CommunicationFlow } from '@/components/communication-flow'
import { TaskStatusChart } from '@/components/task-status-chart'
import { TaskDependencyGraph } from '@/components/task-dependency-graph'
import { MetricsPanel } from '@/components/metrics-panel'
import { ExportPanel } from '@/components/export-panel'
import { Button } from '@/components/ui/button'

interface TeamDetailDialogProps {
  teamName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TeamDetailData {
  config: TeamConfig
  tasks: Task[]
}

export function TeamDetailDialog({ teamName, open, onOpenChange }: TeamDetailDialogProps) {
  const [data, setData] = useState<TeamDetailData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && teamName) {
      setLoading(true)
      fetch(`/api/teams/${teamName}`)
        .then(res => res.json())
        .then(result => {
          setData(result)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load team details:', err)
          setLoading(false)
        })
    }
  }, [open, teamName])

  if (!teamName) return null

  const getInitials = (name: string) => {
    return name.split('-').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAgentColor = (agentType: string) => {
    if (agentType === 'team-lead') return 'bg-blue-500'
    if (agentType.includes('architect')) return 'bg-purple-500'
    if (agentType.includes('coder')) return 'bg-green-500'
    if (agentType.includes('researcher')) return 'bg-yellow-500'
    if (agentType.includes('reviewer')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTaskStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">已完成</Badge>
      case 'in_progress':
        return <Badge variant="default">进行中</Badge>
      default:
        return <Badge variant="secondary">待处理</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{data.config.name}</DialogTitle>
                  <DialogDescription>{data.config.description}</DialogDescription>
                </div>
                <ExportPanel
                  config={data.config}
                  tasks={data.tasks}
                />
              </div>
            </DialogHeader>

            <Tabs defaultValue="members" className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="members">成员</TabsTrigger>
                <TabsTrigger value="tasks">任务</TabsTrigger>
                <TabsTrigger value="metrics">性能</TabsTrigger>
                <TabsTrigger value="graphs">图表</TabsTrigger>
                <TabsTrigger value="logs">日志</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4 mt-4">
                {data.config.members.map((member) => (
                  <div key={member.agentId}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={getAgentColor(member.agentType) + ' text-white'}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          <Badge variant="outline">{getAgentTypeLabel(member.agentType)}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>模型: {getModelLabel(member.model)}</div>
                          <div>工作目录: {member.cwd}</div>
                          <div>加入时间: {formatDate(member.joinedAt)}</div>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-3 mt-4">
                {data.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无任务
                  </div>
                ) : (
                  data.tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getTaskStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{task.title}</h4>
                            {getTaskStatusBadge(task.status)}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>创建于 {formatDate(task.createdAt)}</div>
                            {task.completedAt && (
                              <div>完成于 {formatDate(task.completedAt)}</div>
                            )}
                            {task.assignedTo && (
                              <div>分配给: {task.assignedTo}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4 mt-4">
                <MetricsPanel config={data.config} tasks={data.tasks} />
              </TabsContent>

              <TabsContent value="graphs" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TaskStatusChart tasks={data.tasks} />
                </div>
                <TaskDependencyGraph tasks={data.tasks} />
              </TabsContent>

              <TabsContent value="logs" className="space-y-4 mt-4">
                <CommunicationFlow members={data.config.members} teamName={teamName} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            无法加载团队详情
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
