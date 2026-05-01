'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { WorkflowCard } from '@/components/workflows/WorkflowCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { WorkflowSummary } from '@/types/workflow'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/workflows').then(r => r.json()).then(setWorkflows).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow and all its data?')) return
    await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    setWorkflows(w => w.filter(x => x.id !== id))
  }

  return (
    <div>
      <Header title="Workflows" subtitle="Manage your document processing workflows"
        actions={<Link href="/workflows/new"><Button size="sm">+ New Workflow</Button></Link>} />
      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : workflows.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">
            <p className="text-gray-400 mb-4">No workflows yet.</p>
            <Link href="/workflows/new"><Button>Create Your First Workflow</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map(w => <WorkflowCard key={w.id} workflow={w} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  )
}
