import type { ExtractionRecord } from '@/types/extraction'
import type { SchemaColumnDef } from '@/types/workflow'

export function exportToCSV(extractions: ExtractionRecord[], columns: SchemaColumnDef[]): string {
  const headers = ['id', 'created_at', 'status', ...columns.map(c => c.name)]
  const rows = extractions.map(e => {
    const data = e.extractedData || {}
    return [
      e.id, e.createdAt, e.status,
      ...columns.map(c => {
        const v = data[c.name]
        if (v === null || v === undefined) return ''
        return `"${String(v).replace(/"/g, '""')}"`
      })
    ].join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}
