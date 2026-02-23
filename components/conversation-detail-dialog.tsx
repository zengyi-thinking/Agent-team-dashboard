'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Clock, MessageSquare, User, Bot, Search, Download } from 'lucide-react'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface Conversation {
  id: string
  projectName?: string
  sessionId?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  firstMessage?: string
  messages?: ConversationMessage[]
}

interface ConversationDetailDialogProps {
  conversation: Conversation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 格式化时间
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 提取文本内容
function extractTextContent(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text || '')
      .join('')
  }
  if (content?.text) return content.text
  return ''
}

export function ConversationDetailDialog({
  conversation,
  open,
  onOpenChange,
}: ConversationDetailDialogProps) {
  const [fullMessages, setFullMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (open && conversation?.sessionId) {
      loadFullConversation()
    }
  }, [open, conversation?.sessionId])

  // 搜索过滤消息
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return fullMessages
    const query = searchQuery.toLowerCase()
    return fullMessages.filter(msg =>
      msg.content.toLowerCase().includes(query)
    )
  }, [fullMessages, searchQuery])

  const loadFullConversation = async () => {
    if (!conversation?.sessionId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/conversations?project=${conversation.projectName}&limit=100`)
      const data = await res.json()

      const conv = data.conversations?.find(
        (c: Conversation) => c.sessionId === conversation.sessionId
      )

      if (conv?.messages) {
        setFullMessages(conv.messages)
      } else {
        setFullMessages(conversation.messages || [])
      }
    } catch (error) {
      console.error('Failed to load full conversation:', error)
      setFullMessages(conversation.messages || [])
    } finally {
      setLoading(false)
    }
  }

  // 导出为 Markdown
  const exportToMarkdown = () => {
    if (!conversation) return

    let markdown = `# ${conversation.title || conversation.projectName || '对话'}\n\n`
    markdown += `> 项目: ${conversation.projectName || '全局'}\n`
    markdown += `> 创建时间: ${formatTime(conversation.createdAt)}\n`
    markdown += `> 消息数: ${conversation.messageCount}\n\n---\n\n`

    filteredMessages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
      markdown += `### ${role} (${formatTime(msg.timestamp || conversation.createdAt)})\n\n${msg.content}\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${conversation.id}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!conversation) return null

  const messages = filteredMessages.length > 0 ? filteredMessages : fullMessages

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                对话详情
              </DialogTitle>
              <DialogDescription className="mt-1">
                {conversation.projectName ? `项目: ${conversation.projectName}` : '全局对话'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <MessageSquare className="h-3 w-3 mr-1" />
                {conversation.messageCount} 条消息
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              开始: {formatTime(conversation.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              最新: {formatTime(conversation.updatedAt)}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportToMarkdown}>
            <Download className="h-4 w-4 mr-2" />
            导出 Markdown
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索对话内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">加载对话内容...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>无法加载对话内容</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* 头像 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div
                    className={`flex-1 max-w-[80%] ${
                      msg.role === 'user' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {/* 用户名和时间 */}
                    <div className={`flex items-center gap-2 mb-1 ${
                      msg.role === 'user' ? 'justify-start' : 'justify-end'
                    }`}>
                      <span className={`text-xs font-medium ${
                        msg.role === 'user' ? 'text-blue-500' : 'text-purple-500'
                      }`}>
                        {msg.role === 'user' ? '你' : 'Claude'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>

                    {/* 气泡 */}
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tl-sm shadow-lg shadow-blue-500/25'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-purple-500/25'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {extractTextContent(msg.content) || msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
