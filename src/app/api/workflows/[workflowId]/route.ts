import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { workflowId: string } }) {
  const w = await prisma.workflow.findUnique({
    where: { id: params.workflowId },
    include: { schemaColumns: { orderBy: { order: 'asc' } }, _count: { select: { extractions: true, fieldMappings: true } } },
  })
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(w)
}

export async function PATCH(req: Request, { params }: { params: { workflowId: string } }) {
  const body = await req.json()
  const w = await prisma.workflow.update({
    where: { id: params.workflowId },
    data: { name: body.name, description: body.description, status: body.status },
    include: { schemaColumns: { orderBy: { order: 'asc' } }, _count: { select: { extractions: true, fieldMappings: true } } },
  })
  return NextResponse.json(w)
}

export async function DELETE(_: Request, { params }: { params: { workflowId: string } }) {
  await prisma.workflow.delete({ where: { id: params.workflowId } })
  return NextResponse.json({ success: true })
}
