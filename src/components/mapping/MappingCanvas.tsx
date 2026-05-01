'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OCROverlay } from '@/components/ocr/OCROverlay'
import { MappingRow } from './MappingRow'
import { Button } from '@/components/ui/Button'
import { useMappingStore } from '@/store/mapping-store'
import { suggestMappings } from '@/lib/mapping/mapping-suggester'
import { normalizeValue } from '@/lib/ocr/normalizer'
import type { OcrField } from '@/types/ocr'
import type { SchemaColumnDef } from '@/types/workflow'
import type { MappingEntry } from '@/types/mapping'

interface MappingCanvasProps {
  workflowId: string; extractionId: string; imageSrc: string
  fields: OcrField[]; schemaColumns: SchemaColumnDef[]
  imageDimensions: { width: number; height: number }
}

export function MappingCanvas({ workflowId, extractionId, imageSrc, fields, schemaColumns, imageDimensions }: MappingCanvasProps) {
  const router = useRouter()
  const { entries, selectedOcrFieldId, initSession, setColumnForField, selectField, setSaving, isSaving } = useMappingStore()
  const imgRef = useRef<HTMLImageElement>(null)
  const [displaySize, setDisplaySize] = useState({ width: 600, height: 400 })

  useEffect(() => {
    const suggestions = suggestMappings(fields, schemaColumns)
    const colMap = new Map(schemaColumns.map(c => [c.id, c]))
    const initial: MappingEntry[] = fields.map(f => {
      const suggestedId = suggestions.get(f.id) || null
      const col = suggestedId ? (colMap.get(suggestedId) || null) : null
      return {
        ocrFieldId: f.id, ocrField: f,
        schemaColumnId: suggestedId, schemaColumn: col,
        suggestedColumnId: suggestedId,
        normalizedValue: col && f.rawValue ? String(normalizeValue(f.rawValue, col.dataType)) : null,
        userEdited: false,
      }
    })
    initSession(workflowId, extractionId, initial)
  }, [fields, schemaColumns, workflowId, extractionId, initSession])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const obs = new ResizeObserver(() => setDisplaySize({ width: img.offsetWidth, height: img.offsetHeight }))
    obs.observe(img)
    return () => obs.disconnect()
  }, [])

  const handleColumnChange = useCallback((ocrFieldId: string, colId: string | null) => {
    setColumnForField(ocrFieldId, colId)
    const col = colId ? schemaColumns.find(c => c.id === colId) : null
    const field = fields.find(f => f.id === ocrFieldId)
    if (col && field) {
      const norm = normalizeValue(field.rawValue, col.dataType)
      useMappingStore.getState().setNormalizedValue(ocrFieldId, norm !== null ? String(norm) : '')
    }
  }, [fields, schemaColumns, setColumnForField])

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await fetch(`/api/workflows/${workflowId}/mappings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      })
      const extractedData: Record<string, string> = {}
      for (const e of entries) {
        if (e.schemaColumnId && e.normalizedValue) {
          const col = schemaColumns.find(c => c.id === e.schemaColumnId)
          if (col) extractedData[col.name] = e.normalizedValue
        }
      }
      await fetch(`/api/workflows/${workflowId}/extractions/${extractionId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'complete', extractedData }),
      })
      router.push(`/workflows/${workflowId}/extractions`)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const mappedCount = entries.filter(e => e.schemaColumnId).length

  return (
    <div className="flex h-full gap-0">
      {/* Left: image with overlay */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="relative inline-block">
          <img ref={imgRef} src={imageSrc} alt="Document" className="max-w-full rounded shadow-md"
            onLoad={() => { if (imgRef.current) setDisplaySize({ width: imgRef.current.offsetWidth, height: imgRef.current.offsetHeight }) }} />
          <OCROverlay fields={fields} selectedId={selectedOcrFieldId} onSelect={selectField}
            width={displaySize.width} height={displaySize.height} />
        </div>
      </div>
      {/* Right: mapping panel */}
      <div className="w-96 shrink-0 border-l border-gray-200 bg-white flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Field Mapping</h2>
          <p className="text-xs text-gray-500 mt-1">{mappedCount}/{entries.length} fields mapped</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {entries.map(entry => (
            <MappingRow key={entry.ocrFieldId} entry={entry} columns={schemaColumns}
              isSelected={selectedOcrFieldId === entry.ocrFieldId}
              onSelect={() => selectField(entry.ocrFieldId)}
              onColumnChange={handleColumnChange} />
          ))}
        </div>
        <div className="border-t border-gray-200 p-4">
          <Button variant="primary" className="w-full" onClick={handleConfirm} loading={isSaving}>
            Confirm Mappings &amp; Save
          </Button>
        </div>
      </div>
    </div>
  )
}
