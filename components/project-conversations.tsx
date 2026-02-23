'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FolderOpen, MessageSquare, Clock, Loader2, ChevronRight, Search, RefreshCw, Download } from 'lucide-react'
import { ConversationDetailDialog } from './conversation-detail-dialog'
import Link from 'next/link'

interface ProjectConversations {
  projectName: string
  projectPath: string
  conversations: Conversation[]
  totalMessages: number
}

interface Conversation {
  id: string
  projectName?: string
  sessionId?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  firstMessage?: string
  messages?: any[]
}

// 格式化项目名称
function formatProjectName(name: string): string {
  return name
    .replace(/^d--/, '')
    .replace(/^D--/, '')
    .replace(/^C--/, '')
    .replace(/--/g, '/')
    .replace(/-/g, ' ')
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function ProjectConversations() {
  const [projects, setProjects] = useState<ProjectConversations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/conversations?grouped=true&limit=50')
      const data = await res.json()
      setProjects(data.projects || [])

      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0].projectName)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤项目
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(p =>
      p.projectName.toLowerCase().includes(query) ||
      p.conversations.some(c => c.firstMessage?.toLowerCase().includes(query))
    )
  }, [projects, searchQuery])

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setDialogOpen(true)
  }

  // 导出项目所有对话
  const exportProjectConversations = (project: ProjectConversations) => {
    project.conversations.forEach((conv, idx) => {
      let markdown = `# ${project.projectName} - 对话 ${idx + 1}\n\n`
      markdown += `> 时间: ${new Date(conv.updatedAt).toLocaleString('zh-CN')}\n`
      markdown += `> 消息数: ${conv.messageCount}\n\n---\n\n`

      conv.messages?.forEach((msg: any) => {
        const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
        markdown += `### ${role}\n\n${msg.content}\n\n`
      })

      setTimeout(() => {
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `project-${project.projectName}-conv-${idx + 1}.md`
        a.click()
        URL.revokeObjectURL(url)
      }, idx * 200)
    })
  }

  const currentProject = projects.find(p => p.projectName === selectedProject)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载项目对话...</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无项目对话</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            与 Claude Code 的对话历史按项目分类存储在这里。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {/* 搜索和操作栏 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目或对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchProjects}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-muted-foreground">
          找到 {filteredProjects.length} 个匹配的项目
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 左侧：项目列表 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              项目列表 ({filteredProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-2">
                {filteredProjects.map((project) => (
                  <Button
                    key={project.projectName}
                    variant={selectedProject === project.projectName ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => setSelectedProject(project.projectName)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {formatProjectName(project.projectName)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          {project.conversations.length} 会话
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右侧：对话列表 */}
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {selectedProject ? formatProjectName(selectedProject) : '选择项目'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {currentProject && currentProject.conversations.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => exportProjectConversations(currentProject)}>
                    <Download className="h-4 w-4 mr-2" />
                    导出全部
                  </Button>
                )}
                {currentProject && (
                  <Badge variant="outline">
                    {currentProject.conversations.length} 个对话
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!currentProject || currentProject.conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>该项目暂无对话记录</p>
              </div>
            ) : (
              <ScrollArea className="h-[450px]">
                <div className="space-y-2">
                  {currentProject.conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewConversation(conv)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(conv.updatedAt)}
                            <span className="text-muted-foreground/50">•</span>
                            <MessageSquare className="h-3 w-3" />
                            {conv.messageCount} 条消息
                          </div>
                          <p className="text-sm line-clamp-2">
                            {conv.firstMessage || '无消息内容'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          // 导出单个对话
                          let markdown = `# 对话\n\n`
                          markdown += `> 时间: ${new Date(conv.updatedAt).toLocaleString('zh-CN')}\n\n---\n\n`
                          conv.messages?.forEach((msg: any) => {
                            const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
                            markdown += `### ${role}\n\n${msg.content}\n\n`
                          })
                          const blob = new Blob([markdown], { type: 'text/markdown' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `conversation-${conv.id}.md`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* 对话详情弹窗 */}
        <ConversationDetailDialog
          conversation={selectedConversation}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  )
}
