import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { homedir } from 'os'
import type { Skill, SkillCategory } from '@/lib/types'

// 静态导出模式必须标记为静态
export const dynamic = 'force-static'

const CLAUDE_DIR = path.join(homedir(), '.claude')

// 从 system-reminder 消息中解析可用技能
// 这里我们定义一些常见的技能类别和命令
const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'commit',
    name: 'Git Commit',
    description: '智能生成 Git 提交信息，支持 Conventional Commits 格式',
    category: 'productivity',
    tags: ['git', 'commit', 'version-control'],
    commands: [
      {
        name: '/commit',
        description: '分析代码改动并生成提交信息',
        usage: '/commit [-m "message"]',
        examples: ['/commit', '/commit -m "fix: resolve login bug"'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'pr',
    name: 'Pull Request',
    description: '创建和管理 Pull Request，支持 GitHub',
    category: 'productivity',
    tags: ['git', 'github', 'pr', 'pull-request'],
    commands: [
      {
        name: '/pr',
        description: '创建新的 Pull Request',
        usage: '/pr [options]',
        examples: ['/pr create', '/pr list'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'test',
    name: 'Test Runner',
    description: '运行测试并分析测试覆盖率',
    category: 'code',
    tags: ['testing', 'coverage', 'unit-test'],
    commands: [
      {
        name: '/test',
        description: '运行项目测试',
        usage: '/test [pattern]',
        examples: ['/test', '/test user.auth'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'explain',
    name: 'Code Explainer',
    description: '解释代码功能、概念和系统行为',
    category: 'code',
    tags: ['explanation', 'education', 'documentation'],
    commands: [
      {
        name: '/explain',
        description: '解释选中的代码或概念',
        usage: '/explain [code]',
        examples: ['/explain', '/explain this function'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'implement',
    name: 'Feature Implementer',
    description: '根据需求实现功能代码',
    category: 'code',
    tags: ['implementation', 'coding', 'feature'],
    commands: [
      {
        name: '/implement',
        description: '实现指定的功能',
        usage: '/implement [feature-description]',
        examples: ['/implement user authentication', '/implement dark mode'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'review',
    name: 'Code Reviewer',
    description: '审查代码质量、安全性和性能问题',
    category: 'code',
    tags: ['review', 'quality', 'security', 'performance'],
    commands: [
      {
        name: '/review',
        description: '对代码进行审查',
        usage: '/review [scope]',
        examples: ['/review', '/review src/auth/'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'research',
    name: 'Web Research',
    description: '进行网络搜索和研究',
    category: 'research',
    tags: ['search', 'research', 'web'],
    commands: [
      {
        name: '/research',
        description: '搜索网络信息',
        usage: '/research [query]',
        examples: ['/research react 19 features', '/research best practices'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
  {
    id: 'plan',
    name: 'Planner',
    description: '创建实现计划和工作流',
    category: 'productivity',
    tags: ['planning', 'workflow', 'strategy'],
    commands: [
      {
        name: '/plan',
        description: '创建实现计划',
        usage: '/plan [task]',
        examples: ['/plan add user profile', '/plan refactor auth'],
      },
    ],
    source: 'builtin',
    usageCount: 0,
  },
]

// 尝试读取本地安装的技能
async function getLocalSkills(): Promise<Skill[]> {
  const skills: Skill[] = []
  const skillsDirs = [
    path.join(CLAUDE_DIR, 'skills'),
    path.join(CLAUDE_DIR, 'plugins'),
  ]

  for (const skillsDir of skillsDirs) {
    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = path.join(skillsDir, entry.name)
          const readmePath = path.join(skillPath, 'README.md')
          const packagePath = path.join(skillPath, 'package.json')

          let description = 'Custom skill'
          let commands: Skill['commands'] = []

          try {
            const readme = await fs.readFile(readmePath, 'utf-8')
            description = readme.split('\n')[0]?.replace(/^#\s*/, '') || description
          } catch {
            // README 不存在
          }

          try {
            const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'))
            description = packageJson.description || description
          } catch {
            // package.json 不存在
          }

          skills.push({
            id: entry.name,
            name: entry.name,
            description,
            category: 'other',
            tags: [],
            commands,
            source: 'local',
            installedAt: (await fs.stat(skillPath)).birthtime.getTime(),
            usageCount: 0,
          })
        }
      }
    } catch {
      // 目录不存在
    }
  }

  return skills
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as SkillCategory | null
    const source = searchParams.get('source')

    // 获取本地技能
    const localSkills = await getLocalSkills()

    // 合并所有技能
    const allSkills = [...BUILTIN_SKILLS, ...localSkills]

    // 过滤
    let filteredSkills = allSkills
    if (category) {
      filteredSkills = filteredSkills.filter(s => s.category === category)
    }
    if (source) {
      filteredSkills = filteredSkills.filter(s => s.source === source)
    }

    // 统计
    const stats = {
      total: allSkills.length,
      builtin: allSkills.filter(s => s.source === 'builtin').length,
      local: allSkills.filter(s => s.source === 'local').length,
      community: allSkills.filter(s => s.source === 'community').length,
      byCategory: {} as Record<SkillCategory, number>,
    }

    for (const skill of allSkills) {
      stats.byCategory[skill.category] = (stats.byCategory[skill.category] || 0) + 1
    }

    return NextResponse.json({
      skills: filteredSkills,
      stats,
    })
  } catch (error) {
    console.error('Error reading skills:', error)
    return NextResponse.json(
      { error: 'Failed to read skills', details: String(error) },
      { status: 500 }
    )
  }
}
