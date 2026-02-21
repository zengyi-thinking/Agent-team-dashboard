'use client'

import { useState, useEffect } from 'react'
import { TeamCard } from '@/components/team-card'
import { TeamDetailDialog } from '@/components/team-detail-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Users } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'
import type { TeamSummary } from '@/lib/types'

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  // WebSocket实时更新
  useWebSocket({
    onTeamsUpdate: fetchTeams,
    onTasksUpdate: fetchTeams,
    enabled: true,
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleViewDetails = (teamName: string) => {
    setSelectedTeam(teamName)
    setDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          Agent Teams
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          所有创建的 Claude Code 智能体小队概览
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="p-4 rounded-full bg-[hsl(var(--secondary))] mb-4">
              <Users className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">暂无 Agent Teams</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md">
              使用 Claude Code 创建团队后，它们将显示在这里。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.config.name}
              team={team}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <TeamDetailDialog
        teamName={selectedTeam}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
