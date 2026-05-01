'use client'
import { useCallback, useState } from 'react'

interface DropZoneProps { onFileAccepted: (file: File) => void }

export function DropZone({ onFileAccepted }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (file: File): string | null => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
    if (!allowed.includes(file.type)) return 'Only JPG, PNG, WebP, TIFF files are accepted'
    const maxMB = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '20')
    if (file.size > maxMB * 1024 * 1024) return `File too large (max ${maxMB}MB)`
    return null
  }

  const handleFile = useCallback((file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null); onFileAccepted(file)
  }, [onFileAccepted])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
    >
      <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="mb-1 text-sm font-medium text-gray-700">Drop your document here</p>
      <p className="text-xs text-gray-400">JPG, PNG, WebP, TIFF up to 20MB</p>
      <label className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
        Browse Files
        <input type="file" className="sr-only" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
