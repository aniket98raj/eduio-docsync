import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const maxMB = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '20')
  if (file.size > maxMB * 1024 * 1024) return NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 413 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
  if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 415 })

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, '_')
  const filename = `${Date.now()}-${safeName}`
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes))

  return NextResponse.json({ path: `/uploads/${filename}`, filename })
}
