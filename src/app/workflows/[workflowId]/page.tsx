import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SchemaEditorClientWrapper } from '@/components/workflows/SchemaEditorClientWrapper'
import type { SchemaColumnDef } from '@/types/workflow'

export const dynamic = 'force-dynamic'

export default async function WorkflowDetailPage({ params }: { params: { workflowId: string } }) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: params.workflowId },
    include: { schemaColumns: { orderBy: { order: 'asc' } }, _count: { select: { extractions: true, fieldMappings: true } } },
  })
  if (!workflow) notFound()

  return (
    <div>
      <Header title={workflow.name} subtitle={workflow.description || undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/workflows/${workflow.id}/upload`}><Button size="sm">Upload Document</Button></Link>
            <Link href={`/workflows/${workflow.id}/extractions`}><Button variant="secondary" size="sm">View Extractions</Button></Link>
          </div>
        }
      />
      <div className="p-8 space-y-6 max-w-4xl">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Schema Columns', value: workflow.schemaColumns.length },
            { label: 'Field Mappings', value: workflow._count.fieldMappings },
            { label: 'Extractions', value: workflow._count.extractions },
          ].map(s => (
            <Card key={s.label} className="p-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Database Schema</h2>
          <p className="text-sm text-gray-500 mb-6">Define the columns that will be extracted from your documents.</p>
          <SchemaEditorClientWrapper workflowId={workflow.id} initialColumns={workflow.schemaColumns as SchemaColumnDef[]} />
        </Card>
      </div>
    </div>
  )
}
