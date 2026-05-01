import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { workflowId: string } }) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const [data, total] = await prisma.$transaction([
    prisma.extraction.findMany({
      where: { workflowId: params.workflowId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
    }),
    prisma.extraction.count({ where: { workflowId: params.workflowId } }),
  ])
  return NextResponse.json({ data, total })
}

export async function POST(req: Request, { params }: { params: { workflowId: string } }) {
  const body = await req.json()
  const extraction = await prisma.extraction.create({
    data: {
      workflowId: params.workflowId,
      imagePath: body.imagePath,
      mode: body.mode,
      extractedData: body.extractedData ? JSON.stringify(body.extractedData) : null,
      rawOcrData: body.rawOcrData ? JSON.stringify(body.rawOcrData) : null,
      status: body.status || 'pending',
    },
  })
  return NextResponse.json(extraction, { status: 201 })
}
