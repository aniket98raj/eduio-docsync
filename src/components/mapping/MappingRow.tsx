'use client'
import React from 'react'
import type { MappingEntry } from '@/types/mapping'
import type { SchemaColumnDef } from '@/types/workflow'

interface MappingRowProps {
  entry: MappingEntry; columns: SchemaColumnDef[]
  isSelected: boolean; onSelect: () => void
  onColumnChange: (ocrFieldId: string, colId: string | null) => void
}

export function MappingRow({ entry, columns, isSelected, onSelect, onColumnChange }: MappingRowProps) {
  const confidence = Math.round(entry.ocrField.confidence)
  const confColor = confidence > 80 ? 'text-green-600' : confidence > 60 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div onClick={onSelect}
      className={`cursor-pointer rounded-lg border p-3 transition-colors ${isSelected ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-600 truncate">{entry.ocrField.labelText}</span>
            <span className={`text-xs ${confColor}`}>{confidence}%</span>
          </div>
          <p className="text-sm text-gray-800 truncate mt-0.5">{entry.ocrField.rawValue || <em className="text-gray-400">no value</em>}</p>
        </div>
        <svg className="h-4 w-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <select
          value={entry.schemaColumnId || ''}
          onChange={e => { e.stopPropagation(); onColumnChange(entry.ocrFieldId, e.target.value || null) }}
          onClick={e => e.stopPropagation()}
          className="w-40 shrink-0 rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
        >
          <option value="">-- Skip --</option>
          {columns.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}{entry.suggestedColumnId === c.id && entry.schemaColumnId === c.id && !entry.userEdited ? ' ✶' : ''}
            </option>
          ))}
        </select>
      </div>
      {entry.normalizedValue && entry.schemaColumnId && (
        <p className="mt-2 text-xs text-gray-500">Normalized: <span className="font-mono text-green-700">{String(entry.normalizedValue)}</span></p>
      )}
    </div>
  )
}
