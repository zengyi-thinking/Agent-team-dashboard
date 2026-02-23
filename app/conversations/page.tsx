'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Clock, Users, Bot, RefreshCw, Search, Download, FileText } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'
import { ConversationDetailDialog } from '@/components/conversation-detail-dialog'

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const fetchConversations = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/conversations?limit=100')
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
        } finally {
            setLoading(false)
        }
    }

    // 搜索过滤
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations
        const query = searchQuery.toLowerCase()
        return conversations.filter(conv =>
            conv.title?.toLowerCase().includes(query) ||
            conv.projectName?.toLowerCase().includes(query) ||
            conv.messages?.some((m: any) => m.content?.toLowerCase().includes(query))
        )
    }, [conversations, searchQuery])

    // 导出对话为 Markdown
    const exportToMarkdown = (conv: any) => {
        let markdown = `# ${conv.title || conv.projectName || '对话'}\n\n`
        markdown += `> 项目: ${conv.projectName || '全局'}\n`
        markdown += `> 创建时间: ${new Date(conv.createdAt).toLocaleString('zh-CN')}\n`
        markdown += `> 消息数: ${conv.messageCount || conv.messages?.length || 0}\n\n---\n\n`

        conv.messages?.forEach((msg: any, idx: number) => {
            const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
            markdown += `### ${role}\n\n${msg.content}\n\n`
        })

        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversation-${conv.id}-${Date.now()}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    // 导出所有对话
    const exportAllConversations = () => {
        filteredConversations.forEach((conv, idx) => {
            setTimeout(() => exportToMarkdown(conv), idx * 100)
        })
    }

    const openDetail = (conv: any) => {
        setSelectedConversation(conv)
        setDetailOpen(true)
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

            {/* 搜索和操作栏 */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索对话内容..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchConversations}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        刷新
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportAllConversations} disabled={filteredConversations.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        导出全部
                    </Button>
                </div>
            </div>

            {/* 搜索结果统计 */}
            {searchQuery && (
                <div className="mb-4 text-sm text-muted-foreground">
                    找到 {filteredConversations.length} 个匹配结果
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
                </div>
            ) : filteredConversations.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="p-4 rounded-full bg-[hsl(var(--secondary))] mb-4">
                            <MessageSquare className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? '未找到匹配的对话' : '暂无历史对话'}
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md">
                            {searchQuery ? '试试其他搜索关键词' : '与 Claude Code 的全局对话历史将显示在这里。'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredConversations.map((conv) => (
                        <Card key={conv.id} className="card-hover cursor-pointer" onClick={() => openDetail(conv)}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {conv.title || conv.projectName || conv.id}
                                        </CardTitle>
                                        <CardDescription>
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            {new Date(conv.updatedAt).toLocaleString('zh-CN')}
                                            {conv.projectName && ` · 项目: ${conv.projectName}`}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {conv.messageCount || (conv.messages?.length || 0)} 条消息
                                        </Badge>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportToMarkdown(conv) }}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {conv.messages && conv.messages.length > 0 && (
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {conv.messages.slice(-3).map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    msg.role === 'user'
                                                        ? 'bg-gradient-to-r from-blue-500/10 to-transparent ml-8 border-l-2 border-blue-500'
                                                        : 'bg-gradient-to-l from-purple-500/10 to-transparent mr-8 border-l-2 border-purple-500'
                                                }`}
                                            >
                                                <div className="text-xs font-medium mb-1 flex items-center gap-1">
                                                    {msg.role === 'user' ? (
                                                        <><Users className="h-3 w-3 text-blue-500" /> 你</>
                                                    ) : (
                                                        <><Bot className="h-3 w-3 text-purple-500" /> Claude</>
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

            {/* 对话详情弹窗 */}
            <ConversationDetailDialog
                conversation={selectedConversation}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    )
}
