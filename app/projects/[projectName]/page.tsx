import { ProjectDetail } from '@/components/project-detail'

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ projectName: string }>
}) {
    const { projectName } = await params

    return (
        <div className="container mx-auto px-6 py-6">
            <ProjectDetail projectName={projectName} />
        </div>
    )
}
