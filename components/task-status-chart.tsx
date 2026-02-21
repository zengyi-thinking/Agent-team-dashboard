'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Task } from '@/lib/types'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface TaskStatusChartProps {
  tasks: Task[]
}

export function TaskStatusChart({ tasks }: TaskStatusChartProps) {
  // 计算任务状态统计
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = [
    { name: '待处理', value: statusCounts.pending || 0, color: '#64748b' },
    { name: '进行中', value: statusCounts.in_progress || 0, color: '#3b82f6' },
    { name: '已完成', value: statusCounts.completed || 0, color: '#22c55e' },
  ].filter(d => d.value > 0)

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>任务状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无任务数据</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务状态</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* 详细统计 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Circle className="h-3 w-3" />
              <span className="text-xs">待处理</span>
            </div>
            <div className="text-2xl font-bold">{statusCounts.pending || 0}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Loader2 className="h-3 w-3" />
              <span className="text-xs">进行中</span>
            </div>
            <div className="text-2xl font-bold">{statusCounts.in_progress || 0}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs">已完成</span>
            </div>
            <div className="text-2xl font-bold">{statusCounts.completed || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
