'use client'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { WorkflowSummary } from '@/types/workflow'

interface WorkflowCardProps { workflow: WorkflowSummary; onDelete: (id: string) => void }

export function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  const hasMappings = workflow._count.fieldMappings > 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">{workflow.name}</h3>
            <Badge variant={hasMappings ? 'green' : 'yellow'}>{hasMappings ? 'Configured' : 'New'}</Badge>
          </div>
          {workflow.description && <p className="mt-1 text-sm text-gray-500 truncate">{workflow.description}</p>}
          <p className="mt-2 text-xs text-gray-400">
            {workflow.schemaColumns.length} columns · {workflow._count.extractions} extractions
          </p>
        </div>
        <button onClick={() => onDelete(workflow.id)} className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/workflows/${workflow.id}/upload`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">Upload Document</Button>
        </Link>
        <Link href={`/workflows/${workflow.id}`}>
          <Button variant="secondary" size="sm">Manage</Button>
        </Link>
        <Link href={`/workflows/${workflow.id}/extractions`}>
          <Button variant="ghost" size="sm">Extractions</Button>
        </Link>
      </div>
    </Card>
  )
}
