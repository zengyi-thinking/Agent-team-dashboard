'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, Users, Bot, RefreshCw, ChevronLeft, FolderOpen } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'
import Link from 'next/link'

export function ProjectDetail({ projectName }: { projectName: string }) {
    const [conversations, setConversations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const decodedName = decodeURIComponent(projectName)
    const displayTitle = decodedName
        .replace(/^d--/, '')
        .replace(/^D--/, '')
        .replace(/^C--/, '')
        .replace(/--/g, '/')
        .replace(/-/g, ' ')

    const fetchConversations = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/conversations?project=${encodeURIComponent(decodedName)}&limit=50`)
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (error) {
            console.error('Failed to fetch project conversations:', error)
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
    }, [decodedName])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link
                    href="/projects"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FolderOpen className="h-6 w-6 text-purple-500" />
                        {displayTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        项目 {decodedName} 的所有历史对话和交互记录
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : conversations.length === 0 ? (
                <Card className="border-dashed bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="p-4 rounded-full bg-secondary mb-4">
                            <MessageSquare className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">该项目暂无历史对话</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            与 Claude Code 在此项目中产生的对话将显示在这里。
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
                                        <CardTitle className="text-lg">{conv.title || conv.id}</CardTitle>
                                        <CardDescription>
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            {new Date(conv.createdAt).toLocaleString('zh-CN')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        {conv.messageCount || (conv.messages?.length || 0)} 条消息
                                    </Badge>
                                </div>
                            </CardHeader>
                            {conv.messages && conv.messages.length > 0 && (
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {conv.messages.slice(-5).map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${msg.role === 'user'
                                                        ? 'bg-primary/10 ml-8'
                                                        : 'bg-secondary mr-8'
                                                    }`}
                                            >
                                                <div className="text-xs font-medium mb-1 flex items-center gap-1 opacity-80">
                                                    {msg.role === 'user' ? (
                                                        <><Users className="h-3 w-3" /> 你</>
                                                    ) : (
                                                        <><Bot className="h-3 w-3" /> Claude</>
                                                    )}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {msg.content?.slice(0, 300)}
                                                    {msg.content?.length > 300 && '...'}
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
