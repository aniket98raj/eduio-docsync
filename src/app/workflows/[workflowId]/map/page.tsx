import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import { MapPageClient } from '@/components/mapping/MapPageClient'
import type { SchemaColumnDef } from '@/types/workflow'

export const dynamic = 'force-dynamic'

export default async function MapPage({ params, searchParams }: { params: { workflowId: string }; searchParams: { extractionId?: string } }) {
  const { workflowId } = params
  const { extractionId } = searchParams
  if (!extractionId) notFound()

  const [workflow, extraction] = await Promise.all([
    prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { schemaColumns: { orderBy: { order: 'asc' } } },
    }),
    prisma.extraction.findUnique({ where: { id: extractionId } }),
  ])

  if (!workflow || !extraction) notFound()

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      <Header title="Map Fields" subtitle={`Workflow: ${workflow.name}`} />
      <div className="flex-1 overflow-hidden">
        <MapPageClient
          workflowId={workflowId}
          extractionId={extractionId}
          imageSrc={extraction.imagePath}
          schemaColumns={workflow.schemaColumns as SchemaColumnDef[]}
        />
      </div>
    </div>
  )
}
