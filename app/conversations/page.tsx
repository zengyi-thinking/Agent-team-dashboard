'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, Users, Bot, RefreshCw } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchConversations = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/conversations?limit=50')
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
        } finally {
            setLoading(false)
        }
    }

    useWebSocket({
        onConversationsUpdate: fetchConversations,
        enabled: true,
    })

    useEffect(() => {
        fetchConversations()
    }, [])

    return (
        <div className="container mx-auto px-6 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    历史对话
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    与 Claude Code 的所有全局历史对话记录
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
                </div>
            ) : conversations.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="p-4 rounded-full bg-[hsl(var(--secondary))] mb-4">
                            <MessageSquare className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">暂无历史对话</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md">
                            与 Claude Code 的全局对话历史将显示在这里。
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {conversations.map((conv) => (
                        <Card key={conv.id} className="card-hover">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{conv.title || conv.projectName || conv.id}</CardTitle>
                                        <CardDescription>
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            {new Date(conv.updatedAt).toLocaleString('zh-CN')}
                                            {conv.projectName && ` · 项目: ${conv.projectName}`}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        {conv.messageCount || (conv.messages?.length || 0)} 条消息
                                    </Badge>
                                </div>
                            </CardHeader>
                            {conv.messages && conv.messages.length > 0 && (
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {conv.messages.slice(-3).map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${msg.role === 'user'
                                                        ? 'bg-[hsl(var(--primary))]/10 ml-8'
                                                        : 'bg-[hsl(var(--secondary))] mr-8'
                                                    }`}
                                            >
                                                <div className="text-xs font-medium mb-1 flex items-center gap-1">
                                                    {msg.role === 'user' ? (
                                                        <><Users className="h-3 w-3" /> 你</>
                                                    ) : (
                                                        <><Bot className="h-3 w-3" /> Claude</>
                                                    )}
                                                </div>
                                                <div className="text-sm line-clamp-2">
                                                    {msg.content?.slice(0, 200)}...
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
