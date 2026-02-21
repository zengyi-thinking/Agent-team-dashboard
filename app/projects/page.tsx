'use client'

import { ProjectConversations } from '@/components/project-conversations'
import { FolderOpen } from 'lucide-react'

export default function ProjectsPage() {
    return (
        <div className="container mx-auto px-6 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FolderOpen className="h-6 w-6 text-purple-500" />
                    按项目浏览
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    基于各个项目目录整理的历史对话与 Agent Team 交互记录
                </p>
            </div>

            <ProjectConversations />
        </div>
    )
}
