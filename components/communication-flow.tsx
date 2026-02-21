'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MessageSquare, Loader2 } from 'lucide-react'
import type { TeamMember } from '@/lib/types'
import type { LogMessage } from '@/lib/log-reader'
import { getAgentTypeLabel } from '@/lib/utils'

interface CommunicationFlowProps {
  members: TeamMember[]
  teamName?: string
}

// 模拟的通信数据（在实际应用中，这应该从日志或API获取）
interface Message {
  from: string
  to: string
  timestamp: number
  type: 'task_assignment' | 'status_update' | 'request' | 'response'
  content?: string
}

export function CommunicationFlow({ members, teamName }: CommunicationFlowProps) {
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (teamName && members.length >= 2) {
      setLoading(true)
      fetch(`/api/teams/${teamName}/logs`)
        .then(res => res.json())
        .then(data => {
          setLogs(data.logs || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load logs:', err)
          setLoading(false)
        })
    }
  }, [teamName, members.length])
  // 获取成员名称首字母
  const getInitials = (name: string) => {
    return name.split('-').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // 根据agent类型获取颜色
  const getAgentColor = (agentType: string) => {
    if (agentType === 'team-lead') return 'bg-blue-500'
    if (agentType.includes('architect')) return 'bg-purple-500'
    if (agentType.includes('coder')) return 'bg-green-500'
    if (agentType.includes('researcher')) return 'bg-yellow-500'
    if (agentType.includes('reviewer')) return 'bg-red-500'
    return 'bg-gray-500'
  }

  // 获取消息类型标签
  const getMessageTypeLabel = (type: LogMessage['type']) => {
    const labels = {
      task_assignment: '任务分配',
      status_update: '状态更新',
      request: '请求',
      response: '响应',
      broadcast: '广播',
    }
    return labels[type] || type
  }

  // 获取消息类型颜色
  const getMessageTypeColor = (type: LogMessage['type']) => {
    const colors = {
      task_assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      status_update: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      request: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      response: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      broadcast: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  // 模拟通信流（实际应用中应从后端获取）
  const mockMessages: Message[] = members.length > 1 ? [
    {
      from: members[0].agentId,
      to: members[1]?.agentId || members[0].agentId,
      timestamp: Date.now() - 3600000,
      type: 'task_assignment',
    },
    {
      from: members[1]?.agentId || members[0].agentId,
      to: members[0].agentId,
      timestamp: Date.now() - 1800000,
      type: 'status_update',
    },
  ] : []

  // 查找成员
  const findMember = (agentId: string) => {
    return members.find(m => m.agentId === agentId)
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // 使用实际日志或模拟数据
  const displayLogs = logs.length > 0 ? logs : (members.length > 1 && !loading && !teamName ? mockMessages : [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {teamName ? '通信日志' : '通信流'}
          </div>
          {logs.length > 0 && (
            <Badge variant="secondary">{logs.length} 条记录</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">加载通信日志...</p>
          </div>
        ) : members.length < 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>需要至少两个成员才能显示通信流</p>
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无通信记录</p>
            <p className="text-xs mt-2">Agent间的消息会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {displayLogs.map((msg, idx) => {
              const fromMember = findMember(msg.from)
              const toMember = msg.to === 'all' ? null : findMember(msg.to)

              if (!fromMember) return null

              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getAgentColor(fromMember.agentType) + ' text-white text-xs'}>
                        {getInitials(fromMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fromMember.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {getAgentTypeLabel(fromMember.agentType)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 px-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getMessageTypeColor(msg.type)} variant="secondary">
                      {getMessageTypeLabel(msg.type)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="flex-1 min-w-0 text-right">
                      {msg.to === 'all' ? (
                        <>
                          <div className="text-sm font-medium truncate">全体成员</div>
                          <div className="text-xs text-muted-foreground">广播</div>
                        </>
                      ) : toMember ? (
                        <>
                          <div className="text-sm font-medium truncate">{toMember.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {getAgentTypeLabel(toMember.agentType)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground truncate">未知</div>
                      )}
                    </div>
                    {toMember && msg.to !== 'all' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={getAgentColor(toMember.agentType) + ' text-white text-xs'}>
                          {getInitials(toMember.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  {msg.content && (
                    <div className="col-span-full text-xs text-muted-foreground mt-1 pt-2 border-t">
                      {msg.content.slice(0, 100)}{msg.content.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
