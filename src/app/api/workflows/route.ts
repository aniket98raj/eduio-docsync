import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    include: { schemaColumns: { orderBy: { order: 'asc' } }, _count: { select: { extractions: true, fieldMappings: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(workflows)
}

export async function POST(req: Request) {
  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const workflow = await prisma.workflow.create({
    data: { name, description },
    include: { schemaColumns: true, _count: { select: { extractions: true, fieldMappings: true } } },
  })
  return NextResponse.json(workflow, { status: 201 })
}
