'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import type { TeamConfig, Task } from '@/lib/types'
import { calculateTeamMetrics, formatDuration, formatTokenCount } from '@/lib/metrics-calculator'
import { Coins, Clock, TrendingUp, Users } from 'lucide-react'

interface MetricsPanelProps {
  config: TeamConfig
  tasks: Task[]
}

export function MetricsPanel({ config, tasks }: MetricsPanelProps) {
  const metrics = useMemo(() => calculateTeamMetrics(config, tasks), [config, tasks])

  // Token使用数据
  const tokenData = useMemo(() => {
    return Object.entries(metrics.tokenUsage.estimatedByAgent)
      .filter(([_, value]) => value > 0)
      .map(([agentId, value]) => ({
        name: config.members.find(m => m.agentId === agentId)?.name || agentId,
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [metrics.tokenUsage.estimatedByAgent, config.members])

  // 任务状态数据
  const taskStatusData = useMemo(() => {
    return Object.entries(metrics.taskEfficiency.tasksByStatus)
      .map(([status, count]) => ({
        name: status === 'completed' ? '已完成' :
              status === 'in_progress' ? '进行中' : '待处理',
        value: count,
      }))
      .filter(d => d.value > 0)
  }, [metrics.taskEfficiency.tasksByStatus])

  const COLORS = ['#22c55e', '#3b82f6', '#64748b', '#f59e0b', '#ef4444']

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>性能指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无任务数据，无法计算性能指标
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Token使用</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokenCount(metrics.tokenUsage.estimatedTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              平均每任务 {formatTokenCount(Math.round(metrics.tokenUsage.averagePerTask))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均完成时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.responseTime.averageTaskCompletion > 0
                ? formatDuration(metrics.responseTime.averageTaskCompletion)
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              最快 {formatDuration(metrics.responseTime.fastestTask)} /
              最慢 {formatDuration(metrics.responseTime.slowestTask)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">任务完成率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.taskEfficiency.completionRate * 100).toFixed(0)}%
            </div>
            <Progress value={metrics.taskEfficiency.completionRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.taskEfficiency.completedTasks} / {metrics.taskEfficiency.totalTasks} 已完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">活跃Agent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.agentActivity.activeAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              / {config.members.length} 总成员
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token使用分布 */}
        <Card>
          <CardHeader>
            <CardTitle>Token使用分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tokenData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => formatTokenCount(v)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => formatTokenCount(value)}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {tokenData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 30}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 任务状态分布 */}
        <Card>
          <CardHeader>
            <CardTitle>任务状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent贡献排行 */}
      <Card>
        <CardHeader>
          <CardTitle>Agent贡献排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.agentActivity.agentContributions)
              .sort(([, a], [, b]) => b - a)
              .map(([agentId, count], index) => {
                const member = config.members.find(m => m.agentId === agentId)
                const maxCount = Math.max(...Object.values(metrics.agentActivity.agentContributions))
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                return (
                  <div key={agentId} className="flex items-center gap-3">
                    <div className="w-6 text-center text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{member?.name || agentId}</span>
                        <span className="text-sm text-muted-foreground">{count} 任务</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
