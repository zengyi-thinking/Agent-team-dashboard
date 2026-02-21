'use client'

import React, { useMemo, useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Circle, CheckCircle2, Loader2 } from 'lucide-react'

interface TaskDependencyGraphProps {
  tasks: Task[]
}

interface TaskNodeData {
  task: Task
  label: string
  status: Task['status']
}

export function TaskDependencyGraph({ tasks }: TaskDependencyGraphProps) {
  // 转换任务为节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node<TaskNodeData>[] = []
    const edges: Edge[] = []

    // 创建节点
    tasks.forEach((task, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3

      nodes.push({
        id: task.id,
        type: 'custom',
        position: { x: col * 300, y: row * 150 },
        data: {
          task,
          label: task.title,
          status: task.status,
        },
        style: getNodeStyle(task.status),
      })
    })

    // 创建依赖关系的边
    tasks.forEach((task) => {
      if (task.dependsOn && task.dependsOn.length > 0) {
        task.dependsOn.forEach((depId) => {
          edges.push({
            id: `${depId}-${task.id}`,
            source: depId,
            target: task.id,
            type: 'smoothstep',
            animated: task.status === 'in_progress',
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            style: {
              stroke: task.status === 'completed' ? '#22c55e' : '#94a3b8',
              strokeWidth: 2,
            },
          })
        })
      }
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [tasks])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // 自定义节点组件
  const nodeTypes = useMemo(
    () => ({
      custom: TaskNode,
    }),
    []
  )

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>任务依赖图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无任务数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>任务依赖图</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}

// 任务节点组件
function TaskNode({ data }: { data: TaskNodeData }) {
  const { task, label, status } = data

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
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
    <div className="bg-card border rounded-lg p-3 shadow-sm min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className="text-sm font-medium flex-1 truncate">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        {getStatusBadge()}
        {task.assignedTo && (
          <span className="text-xs text-muted-foreground truncate ml-2">
            {task.assignedTo}
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  )
}

// 获取节点样式
function getNodeStyle(status: Task['status']) {
  switch (status) {
    case 'completed':
      return {
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '8px',
      }
    case 'in_progress':
      return {
        background: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
      }
    default:
      return {
        background: '#f8fafc',
        border: '2px solid #94a3b8',
        borderRadius: '8px',
      }
  }
}
