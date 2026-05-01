import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { MappingEntry } from '@/types/mapping'

export async function GET(_: Request, { params }: { params: { workflowId: string } }) {
  const mappings = await prisma.fieldMapping.findMany({ where: { workflowId: params.workflowId } })
  return NextResponse.json(mappings)
}

export async function PUT(req: Request, { params }: { params: { workflowId: string } }) {
  const entries: MappingEntry[] = await req.json()
  await prisma.fieldMapping.deleteMany({ where: { workflowId: params.workflowId } })
  const toCreate = entries.filter(e => e.schemaColumnId)
  const created = await prisma.$transaction(
    toCreate.map(e => prisma.fieldMapping.create({
      data: {
        workflowId: params.workflowId,
        schemaColumnId: e.schemaColumnId!,
        anchorText: e.ocrField.labelText,
        anchorBbox: e.ocrField.labelBbox ? JSON.stringify(e.ocrField.labelBbox) : null,
        valuePosition: 'right',
        valueSearchRadius: 0.15,
      },
    }))
  )
  return NextResponse.json(created)
}
