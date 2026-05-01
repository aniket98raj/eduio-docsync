import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import { UploadFlow } from '@/components/upload/UploadFlow'
import type { SchemaColumnDef } from '@/types/workflow'

export const dynamic = 'force-dynamic'

export default async function UploadPage({ params }: { params: { workflowId: string } }) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: params.workflowId },
    include: { fieldMappings: true, schemaColumns: { orderBy: { order: 'asc' } } },
  })
  if (!workflow) notFound()

  const mode = workflow.fieldMappings.length === 0 ? 'INITIAL_MAPPING' : 'AUTO_EXTRACTION'

  return (
    <div className="h-full flex flex-col">
      <Header title="Upload Document"
        subtitle={`Workflow: ${workflow.name} — Mode: ${mode === 'INITIAL_MAPPING' ? 'Initial Mapping (first document)' : 'Auto Extraction'}`}
      />
      <div className="flex-1 overflow-hidden">
        <UploadFlow
          workflowId={workflow.id}
          mode={mode}
          schemaColumns={workflow.schemaColumns as SchemaColumnDef[]}
        />
      </div>
    </div>
  )
}
