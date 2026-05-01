import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [totalWorkflows, totalExtractions, weekExtractions, recentExtractions] = await Promise.all([
    prisma.workflow.count(),
    prisma.extraction.count(),
    prisma.extraction.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.extraction.findMany({
      take: 10, orderBy: { createdAt: 'desc' },
      include: { workflow: { select: { name: true } } },
    }),
  ])
  return { totalWorkflows, totalExtractions, weekExtractions, recentExtractions }
}

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  complete: 'green', pending: 'yellow', failed: 'red', needs_review: 'yellow'
}

export default async function DashboardPage() {
  const { totalWorkflows, totalExtractions, weekExtractions, recentExtractions } = await getStats()
  const stats = [
    { label: 'Workflows', value: totalWorkflows },
    { label: 'Total Extractions', value: totalExtractions },
    { label: 'This Week', value: weekExtractions },
  ]
  return (
    <div>
      <Header title="Dashboard" actions={<Link href="/workflows/new"><Button size="sm">+ New Workflow</Button></Link>} />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="p-5">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Extractions</h2>
          {recentExtractions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-400 mb-4">No extractions yet.</p>
              <Link href="/workflows"><Button variant="secondary" size="sm">Create a Workflow</Button></Link>
            </Card>
          ) : (
            <Card>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Workflow</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentExtractions.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.workflow.name}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[e.status] || 'gray'}>{e.status}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={e.mode === 'INITIAL_MAPPING' ? 'blue' : 'gray'}>{e.mode}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
