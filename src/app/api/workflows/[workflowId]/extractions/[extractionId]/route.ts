import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { workflowId: string; extractionId: string } }) {
  const e = await prisma.extraction.findUnique({
    where: { id: params.extractionId },
    include: { workflow: { include: { schemaColumns: { orderBy: { order: 'asc' } } } } },
  })
  if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(e)
}

export async function PATCH(req: Request, { params }: { params: { workflowId: string; extractionId: string } }) {
  const body = await req.json()
  const e = await prisma.extraction.update({
    where: { id: params.extractionId },
    data: {
      status: body.status,
      extractedData: body.extractedData ? JSON.stringify(body.extractedData) : undefined,
    },
  })
  return NextResponse.json(e)
}

export async function DELETE(_: Request, { params }: { params: { workflowId: string; extractionId: string } }) {
  await prisma.extraction.delete({ where: { id: params.extractionId } })
  return NextResponse.json({ success: true })
}
