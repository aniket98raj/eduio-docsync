'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { exportToCSV } from '@/lib/export/csv-exporter'
import type { ExtractionRecord } from '@/types/extraction'
import type { SchemaColumnDef } from '@/types/workflow'

type StatusVariant = 'green' | 'yellow' | 'red' | 'gray'

const statusVariant: Record<string, StatusVariant> = {
  complete: 'green', pending: 'yellow', failed: 'red', needs_review: 'yellow'
}

interface ExtractionsTableProps { workflowId: string; columns: SchemaColumnDef[] }

export function ExtractionsTable({ workflowId, columns }: ExtractionsTableProps) {
  const [extractions, setExtractions] = useState<ExtractionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/workflows/${workflowId}/extractions?page=${page}&limit=20`)
      .then(r => r.json())
      .then(d => {
        // Parse extractedData JSON strings
        const parsed = (d.data || []).map((e: ExtractionRecord & { extractedData: string | null }) => ({
          ...e, extractedData: e.extractedData ? JSON.parse(e.extractedData as unknown as string) : null
        }))
        setExtractions(parsed); setTotal(d.total)
      })
      .finally(() => setLoading(false))
  }, [workflowId, page])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this extraction?')) return
    await fetch(`/api/workflows/${workflowId}/extractions/${id}`, { method: 'DELETE' })
    setExtractions(ex => ex.filter(e => e.id !== id))
    setTotal(t => t - 1)
  }

  const handleExportCSV = () => {
    const csv = exportToCSV(extractions, columns)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `extractions-${workflowId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const data = JSON.stringify(extractions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `extractions-${workflowId}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} total extractions</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="secondary" size="sm" onClick={handleExportJSON}>Export JSON</Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>
      ) : extractions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-gray-400">No extractions yet. Upload a document to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Mode</th>
                {columns.map(c => (
                  <th key={c.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{c.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {extractions.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[e.status] || 'gray'}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.mode === 'INITIAL_MAPPING' ? 'blue' : 'gray'}>{e.mode}</Badge>
                  </td>
                  {columns.map(c => (
                    <td key={c.id} className="px-4 py-3 text-sm text-gray-700">
                      {e.extractedData?.[c.name] !== undefined && e.extractedData[c.name] !== null
                        ? String(e.extractedData[c.name]) : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 px-3 py-2">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="secondary" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
