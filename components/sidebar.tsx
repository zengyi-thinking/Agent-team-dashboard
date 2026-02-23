'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderOpen,
  Settings,
  HelpCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Puzzle,
  Wrench,
  Plug,
  Command,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: '仪表盘',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Agent Teams',
    href: '/teams',
    icon: Users,
  },
  {
    title: '智能体',
    href: '/agents',
    icon: Cpu,
  },
  {
    title: 'MCP 服务',
    href: '/mcp',
    icon: Puzzle,
  },
  {
    title: '技能中心',
    href: '/skills',
    icon: Wrench,
  },
  {
    title: '插件',
    href: '/plugins',
    icon: Plug,
  },
  {
    title: '命令',
    href: '/commands',
    icon: Command,
  },
  {
    title: '历史对话',
    href: '/conversations',
    icon: MessageSquare,
  },
  {
    title: '按项目',
    href: '/projects',
    icon: FolderOpen,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: '系统状态',
    href: '/status',
    icon: Activity,
  },
  {
    title: '设置',
    href: '/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo区域 */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[hsl(var(--sidebar-border))]">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
                <Users className="h-4 w-4 text-[hsl(var(--sidebar-primary-foreground))]" />
              </div>
              <span className="font-semibold text-[hsl(var(--sidebar-foreground))]">
                Agent Hub
              </span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
              <Users className="h-4 w-4 text-[hsl(var(--sidebar-primary-foreground))]" />
            </div>
          )}
        </div>

        {/* 导航区域 */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                    : 'text-[hsl(var(--sidebar-foreground))]/70'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary-foreground))] text-xs text-[hsl(var(--sidebar-primary))]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* 底部区域 */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-2 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                    : 'text-[hsl(var(--sidebar-foreground))]/70'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}

          {/* 折叠按钮和主题切换 */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'flex items-center justify-center rounded-lg p-2 transition-all',
                'hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]/70'
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span className="text-xs">收起</span>
                </>
              )}
            </button>

            {!collapsed && (
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
