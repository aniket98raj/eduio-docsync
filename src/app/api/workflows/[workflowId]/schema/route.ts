import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { workflowId: string } }) {
  const cols = await prisma.schemaColumn.findMany({
    where: { workflowId: params.workflowId }, orderBy: { order: 'asc' },
  })
  return NextResponse.json(cols)
}

export async function PUT(req: Request, { params }: { params: { workflowId: string } }) {
  const columns: { id?: string; name: string; label: string; dataType: string; required: boolean; order: number }[] = await req.json()
  await prisma.schemaColumn.deleteMany({ where: { workflowId: params.workflowId } })
  const created = await prisma.$transaction(
    columns.map(c => prisma.schemaColumn.create({
      data: { workflowId: params.workflowId, name: c.name, label: c.label, dataType: c.dataType, required: c.required, order: c.order },
    }))
  )
  return NextResponse.json(created)
}
