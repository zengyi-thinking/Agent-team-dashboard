/**
 * Export Handler
 * 导出团队报告和对话历史
 */

import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import type { TeamConfig, Task } from './types'
import type { TeamMetrics } from './metrics-calculator'

export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf' | 'csv'
  includeTasks?: boolean
  includeMetrics?: boolean
  includeConversations?: boolean
}

export interface TeamReportData {
  config: TeamConfig
  tasks: Task[]
  metrics?: TeamMetrics
  conversations?: any[]
  exportedAt: string
}

/**
 * 导出团队报告
 */
export async function exportTeamReport(
  data: TeamReportData,
  options: ExportOptions
): Promise<void> {
  const filename = `${data.config.name}-report-${Date.now()}`
  const content = generateReportContent(data, options)

  switch (options.format) {
    case 'json':
      exportAsJson(content, filename)
      break
    case 'markdown':
      exportAsMarkdown(content, filename)
      break
    case 'pdf':
      await exportAsPdf(content, filename)
      break
    case 'csv':
      exportAsCsv(content, filename)
      break
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * 生成报告内容
 */
function generateReportContent(data: TeamReportData, options: ExportOptions): string {
  const { config, tasks, metrics, conversations } = data

  if (options.format === 'json') {
    return JSON.stringify(data, null, 2)
  }

  // Markdown格式
  let markdown = `# ${config.name} 团队报告\n\n`
  markdown += `**导出时间**: ${new Date(data.exportedAt).toLocaleString('zh-CN')}\n\n`
  markdown += `**描述**: ${config.description}\n\n`
  markdown += `**创建时间**: ${new Date(config.createdAt).toLocaleString('zh-CN')}\n\n`

  // 团队成员
  markdown += `## 团队成员\n\n`
  markdown += `| 成员 | 角色 | 模型 | 工作目录 |\n`
  markdown += `|------|------|------|----------|\n`
  config.members.forEach((member) => {
    markdown += `| ${member.name} | ${member.agentType} | ${member.model} | ${member.cwd} |\n`
  })
  markdown += `\n`

  // 任务列表
  if (options.includeTasks && tasks.length > 0) {
    markdown += `## 任务列表\n\n`
    markdown += `| 任务 | 状态 | 分配给 | 创建时间 | 完成时间 |\n`
    markdown += `|------|------|--------|----------|----------|\n`
    tasks.forEach((task) => {
      const status = task.status === 'completed' ? '✅ 完成' :
                     task.status === 'in_progress' ? '🔄 进行中' : '⏳ 待处理'
      const createdAt = new Date(task.createdAt).toLocaleString('zh-CN')
      const completedAt = task.completedAt ? new Date(task.completedAt).toLocaleString('zh-CN') : '-'
      markdown += `| ${task.title} | ${status} | ${task.assignedTo || '-'} | ${createdAt} | ${completedAt} |\n`
    })
    markdown += `\n`

    // 任务统计
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const pending = tasks.filter(t => t.status === 'pending').length
    markdown += `**任务统计**: 总计 ${tasks.length} | 已完成 ${completed} | 进行中 ${inProgress} | 待处理 ${pending}\n\n`
  }

  // 性能指标
  if (options.includeMetrics && metrics) {
    markdown += `## 性能指标\n\n`
    markdown += `### Token 使用量\n\n`
    markdown += `- **总计估算**: ${metrics.tokenUsage.estimatedTotal.toLocaleString()} tokens\n`
    markdown += `- **平均每任务**: ${Math.round(metrics.tokenUsage.averagePerTask)} tokens\n\n`

    markdown += `### 任务效率\n\n`
    markdown += `- **完成率**: ${(metrics.taskEfficiency.completionRate * 100).toFixed(1)}%\n`
    markdown += `- **平均每Agent任务数**: ${metrics.taskEfficiency.averageTasksPerAgent.toFixed(1)}\n\n`

    if (metrics.responseTime.averageTaskCompletion > 0) {
      markdown += `### 响应时间\n\n`
      markdown += `- **平均完成时间**: ${formatDuration(metrics.responseTime.averageTaskCompletion)}\n`
      markdown += `- **最快**: ${formatDuration(metrics.responseTime.fastestTask)}\n`
      markdown += `- **最慢**: ${formatDuration(metrics.responseTime.slowestTask)}\n\n`
    }
  }

  // 对话历史
  if (options.includeConversations && conversations && conversations.length > 0) {
    markdown += `## 对话历史\n\n`
    conversations.slice(0, 10).forEach((conv, idx) => {
      markdown += `### ${idx + 1}. ${conv.title || conv.id}\n\n`
      markdown += `**时间**: ${new Date(conv.createdAt).toLocaleString('zh-CN')}\n\n`

      if (conv.messages && conv.messages.length > 0) {
        conv.messages.slice(-3).forEach((msg: any) => {
          const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
          markdown += `**${role}**\n\n`
          markdown += `${(msg.content || '').slice(0, 200)}...\n\n`
        })
      }
      markdown += `---\n\n`
    })
  }

  return markdown
}

/**
 * 导出为JSON
 */
function exportAsJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  saveAs(blob, `${filename}.json`)
}

/**
 * 导出为Markdown
 */
function exportAsMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${filename}.md`)
}

/**
 * 导出为PDF
 */
async function exportAsPdf(content: string, filename: string): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // 添加中文字体支持需要额外配置
  // 这里使用简单的文本导出
  const lines = content.split('\n')
  let yPosition = 20
  const lineHeight = 7
  const pageHeight = 280
  const margin = 20

  pdf.setFontSize(10)

  lines.forEach((line) => {
    if (yPosition > pageHeight) {
      pdf.addPage()
      yPosition = 20
    }

    // 简单处理Markdown标题
    if (line.startsWith('# ')) {
      pdf.setFontSize(16)
      pdf.text(line.substring(2), margin, yPosition)
      pdf.setFontSize(10)
      yPosition += lineHeight * 1.5
    } else if (line.startsWith('## ')) {
      pdf.setFontSize(14)
      pdf.text(line.substring(3), margin, yPosition)
      pdf.setFontSize(10)
      yPosition += lineHeight * 1.3
    } else {
      // 移除Markdown格式
      const cleanLine = line
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\|/g, ' | ')

      const lines = pdf.splitTextToSize(cleanLine, 170)
      lines.forEach((l: string) => {
        if (yPosition > pageHeight) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(l, margin, yPosition)
        yPosition += lineHeight
      })
    }
  })

  pdf.save(`${filename}.pdf`)
}

/**
 * 导出为CSV
 */
function exportAsCsv(content: string, filename: string): void {
  // 简单的Markdown到CSV转换
  const lines = content.split('\n')
  const csvLines: string[] = []

  lines.forEach((line) => {
    if (line.startsWith('|')) {
      // 移除首尾的 | 并分割
      const cells = line.split('|').filter((_, i, arr) => i !== 0 && i !== arr.length - 1)
      csvLines.push(cells.map(cell => cell.trim()).join(','))
    }
  })

  const csvContent = csvLines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}.csv`)
}

/**
 * 导出对话历史
 */
export function exportConversations(conversations: any[], format: 'json' | 'markdown'): void {
  const timestamp = Date.now()

  if (format === 'json') {
    const content = JSON.stringify(conversations, null, 2)
    exportAsJson(content, `conversations-${timestamp}`)
  } else {
    let markdown = `# 对话历史\n\n`
    markdown += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n`
    markdown += `**总计**: ${conversations.length} 条对话\n\n`

    conversations.forEach((conv, idx) => {
      markdown += `## ${idx + 1}. ${conv.title || conv.id}\n\n`
      markdown += `**创建时间**: ${new Date(conv.createdAt).toLocaleString('zh-CN')}\n`
      markdown += `**更新时间**: ${new Date(conv.updatedAt).toLocaleString('zh-CN')}\n\n`

      if (conv.messages && conv.messages.length > 0) {
        conv.messages.forEach((msg: any) => {
          const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude'
          markdown += `### ${role}\n\n${msg.content}\n\n`
        })
      }
      markdown += `---\n\n`
    })

    exportAsMarkdown(markdown, `conversations-${timestamp}`)
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  }
  return `${seconds}秒`
}
