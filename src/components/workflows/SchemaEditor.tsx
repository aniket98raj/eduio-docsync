'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { SchemaColumnDef, ColumnDataType } from '@/types/workflow'

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' }, { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' }, { value: 'boolean', label: 'Boolean' },
]

interface SchemaEditorProps {
  workflowId: string; initialColumns: SchemaColumnDef[]
  onSave: (cols: SchemaColumnDef[]) => Promise<void>
}

function newCol(order: number): SchemaColumnDef {
  return { id: `new_${Date.now()}_${Math.random()}`, name: '', label: '', dataType: 'text', required: false, order }
}

export function SchemaEditor({ initialColumns, onSave }: SchemaEditorProps) {
  const [cols, setCols] = useState<SchemaColumnDef[]>(initialColumns)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (id: string, patch: Partial<SchemaColumnDef>) =>
    setCols(c => c.map(col => col.id === id ? { ...col, ...patch } : col))

  const remove = (id: string) => setCols(c => c.filter(col => col.id !== id))
  const add = () => setCols(c => [...c, newCol(c.length)])

  const handleSave = async () => {
    const names = cols.map(c => c.name.trim())
    if (names.some(n => !n)) { setError('All columns must have a name'); return }
    if (new Set(names).size !== names.length) { setError('Column names must be unique'); return }
    setSaving(true); setError(null)
    try {
      await onSave(cols.map((c, i) => ({ ...c, name: c.name.trim().toLowerCase().replace(/\s+/g, '_'), order: i })))
    } catch { setError('Failed to save schema') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {cols.map((col, idx) => (
          <div key={col.id} className="flex items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <span className="mb-2 text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
            <Input label="Name" placeholder="column_name" value={col.name}
              onChange={e => update(col.id, { name: e.target.value })} className="flex-1" />
            <Input label="Label" placeholder="Human label" value={col.label}
              onChange={e => update(col.id, { label: e.target.value })} className="flex-1" />
            <Select label="Type" options={TYPE_OPTIONS} value={col.dataType}
              onChange={e => update(col.id, { dataType: e.target.value as ColumnDataType })} />
            <div className="flex flex-col items-center gap-1 mb-1">
              <label className="text-xs text-gray-500">Required</label>
              <input type="checkbox" checked={col.required}
                onChange={e => update(col.id, { required: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-600" />
            </div>
            <button onClick={() => remove(col.id)} className="mb-1 rounded p-1 text-gray-300 hover:text-red-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
      {cols.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No columns yet. Add one below.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={add} type="button">+ Add Column</Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Save Schema</Button>
      </div>
    </div>
  )
}
