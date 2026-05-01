import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import { ExtractionsTable } from '@/components/extractions/ExtractionsTable'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { SchemaColumnDef } from '@/types/workflow'

export const dynamic = 'force-dynamic'

export default async function ExtractionsPage({ params }: { params: { workflowId: string } }) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: params.workflowId },
    include: { schemaColumns: { orderBy: { order: 'asc' } } },
  })
  if (!workflow) notFound()
  return (
    <div>
      <Header title="Extractions" subtitle={workflow.name}
        actions={<Link href={`/workflows/${workflow.id}/upload`}><Button size="sm">Upload Document</Button></Link>}
      />
      <div className="p-8">
        <ExtractionsTable workflowId={workflow.id} columns={workflow.schemaColumns as SchemaColumnDef[]} />
      </div>
    </div>
  )
}
