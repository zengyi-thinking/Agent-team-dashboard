'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BookOpen,
  Code,
  Cpu,
  Database,
  FlaskConical,
  GitBranch,
  Hammer,
  HelpCircle,
  Link2,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Wand2,
  Zap,
} from 'lucide-react'
import type { Skill, SkillCategory } from '@/lib/types'

// 类别图标映射
const categoryIcons: Record<SkillCategory, React.ComponentType<{ className?: string }>> = {
  code: Code,
  design: Wand2,
  research: Search,
  communication: MessageSquare,
  productivity: Zap,
  devops: GitBranch,
  data: Database,
  security: Shield,
  other: HelpCircle,
}

// 类别颜色映射
const categoryColors: Record<SkillCategory, string> = {
  code: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  design: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  research: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  communication: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  productivity: 'bg-green-500/20 text-green-400 border-green-500/30',
  devops: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  data: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

// 来源颜色映射
const sourceColors: Record<string, string> = {
  builtin: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  local: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  community: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

// 类别名称映射
const categoryNames: Record<SkillCategory, string> = {
  code: '代码',
  design: '设计',
  research: '研究',
  communication: '沟通',
  productivity: '效率',
  devops: 'DevOps',
  data: '数据',
  security: '安全',
  other: '其他',
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [stats, setStats] = useState<{
    total: number
    builtin: number
    local: number
    community: number
    byCategory: Record<string, number>
  }>({
    total: 0,
    builtin: 0,
    local: 0,
    community: 0,
    byCategory: {},
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/skills')
      const data = await res.json()
      setSkills(data.skills || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || skill.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = Object.keys(stats.byCategory || {}) as SkillCategory[]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* 头部统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总技能数</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">内置技能</p>
                <p className="text-3xl font-bold">{stats.builtin}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本地技能</p>
                <p className="text-3xl font-bold">{stats.local}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Hammer className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">社区技能</p>
                <p className="text-3xl font-bold">{stats.community}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          安装技能
        </Button>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          全部
        </Button>
        {categories.map((category) => {
          const Icon = categoryIcons[category]
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {categoryNames[category]}
              <span className="ml-1 text-xs opacity-70">({stats.byCategory[category]})</span>
            </Button>
          )
        })}
      </div>

      {/* 技能列表 */}
      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const Icon = categoryIcons[skill.category]
            return (
              <Dialog key={skill.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{skill.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {skill.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={categoryColors[skill.category]}>
                          {categoryNames[skill.category]}
                        </Badge>
                        <Badge variant="outline" className={sourceColors[skill.source]}>
                          {skill.source === 'builtin' ? '内置' : skill.source === 'local' ? '本地' : '社区'}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {skill.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {skill.name}
                    </DialogTitle>
                    <DialogDescription>{skill.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={categoryColors[skill.category]}>
                        {categoryNames[skill.category]}
                      </Badge>
                      <Badge variant="outline" className={sourceColors[skill.source]}>
                        {skill.source === 'builtin' ? '内置技能' : skill.source === 'local' ? '本地安装' : '社区贡献'}
                      </Badge>
                      <Badge variant="outline">使用次数: {skill.usageCount}</Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {skill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-sm rounded bg-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {skill.commands.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">可用命令</h4>
                        <div className="space-y-3">
                          {skill.commands.map((command) => (
                            <div
                              key={command.name}
                              className="p-3 rounded-lg bg-muted/50 space-y-2"
                            >
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-0.5 rounded bg-primary/10 text-primary text-sm font-mono">
                                  {command.name}
                                </code>
                                <span className="text-sm text-muted-foreground">
                                  {command.description}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                用法: {command.usage}
                              </p>
                              {command.examples.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <p>示例:</p>
                                  <ul className="list-disc list-inside">
                                    {command.examples.map((example, i) => (
                                      <li key={i} className="font-mono">
                                        {example}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {skill.installedAt && (
                      <p className="text-sm text-muted-foreground">
                        安装时间: {new Date(skill.installedAt).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
