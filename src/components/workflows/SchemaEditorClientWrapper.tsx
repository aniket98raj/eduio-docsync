'use client'
import { useState } from 'react'
import { SchemaEditor } from './SchemaEditor'
import type { SchemaColumnDef } from '@/types/workflow'

interface Props { workflowId: string; initialColumns: SchemaColumnDef[] }

export function SchemaEditorClientWrapper({ workflowId, initialColumns }: Props) {
  const [columns, setColumns] = useState<SchemaColumnDef[]>(initialColumns)
  const [saved, setSaved] = useState(false)

  const handleSave = async (cols: SchemaColumnDef[]) => {
    const res = await fetch(`/api/workflows/${workflowId}/schema`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cols),
    })
    const updated = await res.json()
    setColumns(updated); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {saved && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">Schema saved successfully.</div>}
      <SchemaEditor workflowId={workflowId} initialColumns={columns} onSave={handleSave} />
    </div>
  )
}
