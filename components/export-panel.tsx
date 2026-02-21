'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, FileJson, FileText, File, FileSpreadsheet } from 'lucide-react'
import type { TeamConfig, Task } from '@/lib/types'
import { exportTeamReport, exportConversations } from '@/lib/export-handler'
import { calculateTeamMetrics } from '@/lib/metrics-calculator'

interface ExportPanelProps {
  config: TeamConfig
  tasks: Task[]
  conversations?: any[]
}

export function ExportPanel({ config, tasks, conversations = [] }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'pdf' | 'csv'>('markdown')
  const [includeTasks, setIncludeTasks] = useState(true)
  const [includeMetrics, setIncludeMetrics] = useState(true)
  const [includeConversations, setIncludeConversations] = useState(false)

  const handleExportTeam = async () => {
    setIsExporting(true)
    try {
      const metrics = calculateTeamMetrics(config, tasks)

      await exportTeamReport(
        {
          config,
          tasks,
          metrics,
          conversations: includeConversations ? conversations : undefined,
          exportedAt: new Date().toISOString(),
        },
        {
          format: exportFormat,
          includeTasks,
          includeMetrics,
          includeConversations,
        }
      )
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportConversations = async (format: 'json' | 'markdown') => {
    setIsExporting(true)
    try {
      exportConversations(conversations, format)
    } catch (error) {
      console.error('Export conversations failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatIcons = {
    json: <FileJson className="h-4 w-4" />,
    markdown: <FileText className="h-4 w-4" />,
    pdf: <File className="h-4 w-4" />,
    csv: <FileSpreadsheet className="h-4 w-4" />,
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>导出数据</DialogTitle>
          <DialogDescription>
            选择导出格式和包含的内容
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="team">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">团队报告</TabsTrigger>
            <TabsTrigger value="conversations">对话历史</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">团队报告导出</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 格式选择 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">导出格式</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['json', 'markdown', 'pdf', 'csv'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                          exportFormat === format
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                      >
                        {formatIcons[format]}
                        <span className="text-xs">{format.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 内容选择 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">包含内容</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTasks}
                        onChange={(e) => setIncludeTasks(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">任务列表</span>
                      <Badge variant="secondary">{tasks.length}</Badge>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMetrics}
                        onChange={(e) => setIncludeMetrics(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">性能指标</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConversations}
                        onChange={(e) => setIncludeConversations(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">对话历史</span>
                      <Badge variant="secondary">{conversations.length}</Badge>
                    </label>
                  </div>
                </div>

                {/* 预览信息 */}
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="font-medium mb-1">导出预览</div>
                  <div className="text-muted-foreground">
                    团队名称: {config.name}<br />
                    成员数量: {config.members.length}<br />
                    任务数量: {includeTasks ? tasks.length : 0}<br />
                    对话数量: {includeConversations ? conversations.length : 0}
                  </div>
                </div>

                <Button
                  onClick={handleExportTeam}
                  disabled={isExporting || (!includeTasks && !includeMetrics && !includeConversations)}
                  className="w-full"
                >
                  {isExporting ? (
                    <>导出中...</>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      导出团队报告
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">对话历史导出</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="font-medium mb-1">对话统计</div>
                  <div className="text-muted-foreground">
                    总对话数: {conversations.length}<br />
                    总消息数: {conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleExportConversations('json')}
                    disabled={isExporting || conversations.length === 0}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <FileJson className="h-6 w-6 mb-2" />
                    <span>导出为 JSON</span>
                  </Button>
                  <Button
                    onClick={() => handleExportConversations('markdown')}
                    disabled={isExporting || conversations.length === 0}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span>导出为 Markdown</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
