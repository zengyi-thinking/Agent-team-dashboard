'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Clock, MessageSquare, User, Bot } from 'lucide-react'

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

  useEffect(() => {
    if (open && conversation?.sessionId) {
      loadFullConversation()
    }
  }, [open, conversation?.sessionId])

  const loadFullConversation = async () => {
    if (!conversation?.sessionId) return

    setLoading(true)
    try {
      // 从API获取完整对话
      const res = await fetch(`/api/conversations?project=${conversation.projectName}&limit=100`)
      const data = await res.json()

      const conv = data.conversations?.find(
        (c: Conversation) => c.sessionId === conversation.sessionId
      )

      if (conv?.messages) {
        setFullMessages(conv.messages)
      } else {
        // 使用缓存的消息
        setFullMessages(conversation.messages || [])
      }
    } catch (error) {
      console.error('Failed to load full conversation:', error)
      setFullMessages(conversation.messages || [])
    } finally {
      setLoading(false)
    }
  }

  if (!conversation) return null

  const messages = fullMessages.length > 0 ? fullMessages : (conversation.messages || [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">
                对话详情
              </DialogTitle>
              <DialogDescription className="mt-1">
                {conversation.projectName ? `项目: ${conversation.projectName}` : '会话对话'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <MessageSquare className="h-3 w-3 mr-1" />
                {conversation.messageCount} 条消息
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            开始: {formatTime(conversation.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            最新: {formatTime(conversation.updatedAt)}
          </div>
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${
                      msg.role === 'user' ? 'text-left' : 'text-right'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {extractTextContent(msg.content) || msg.content}
                      </p>
                    </div>
                    {msg.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
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
