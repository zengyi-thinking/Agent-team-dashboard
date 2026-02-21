'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatRelativeTime, getAgentTypeLabel, getModelLabel } from '@/lib/utils'
import type { TeamSummary } from '@/lib/types'
import { Users, Clock, FileText, Activity, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TeamCardProps {
  team: TeamSummary
  onViewDetails: (teamName: string) => void
}

export function TeamCard({ team, onViewDetails }: TeamCardProps) {
  const { config, memberCount, activeMembers, taskCount, lastActivity } = team

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

  return (
    <Card className="hover:shadow-lg hover:shadow-[hsl(var(--primary))/5] transition-all duration-300 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/30] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-[hsl(var(--primary))] transition-colors">
              {config.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">
              {config.description}
            </CardDescription>
          </div>
          <Badge variant={activeMembers > 0 ? 'default' : 'secondary'} className={activeMembers > 0 ? 'bg-green-500' : ''}>
            {activeMembers > 0 ? '运行中' : '已结束'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 统计信息 - 更紧凑 */}
        <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--secondary))]">
            <Users className="h-3 w-3" />
            <span>{memberCount}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--secondary))]">
            <FileText className="h-3 w-3" />
            <span>{taskCount}</span>
          </div>
          {lastActivity && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--secondary))]">
              <Activity className="h-3 w-3" />
              <span>{formatRelativeTime(lastActivity)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-[hsl(var(--border))]" />

        {/* 成员列表 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[hsl(var(--muted-foreground))]">团队成员</div>
          <div className="space-y-1.5">
            {config.members.slice(0, 3).map((member) => (
              <div key={member.agentId} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={getAgentColor(member.agentType) + ' text-white text-[10px]'}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{member.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1">
                      {getAgentTypeLabel(member.agentType).slice(0, 2)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {config.members.length > 3 && (
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                +{config.members.length - 3} 更多成员
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(config.createdAt)}
          </div>
          <Button
            onClick={() => onViewDetails(config.name)}
            variant="ghost"
            size="sm"
            className="text-xs gap-1 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
          >
            查看详情
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
