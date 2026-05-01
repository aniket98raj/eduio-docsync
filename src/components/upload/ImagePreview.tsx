'use client'
import { Button } from '@/components/ui/Button'

interface ImagePreviewProps { src: string; fileName: string; size: number; onClear: () => void }

export function ImagePreview({ src, fileName, size, onClear }: ImagePreviewProps) {
  const sizeMB = (size / 1024 / 1024).toFixed(2)
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{fileName}</p>
          <p className="text-xs text-gray-400">{sizeMB} MB</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>Remove</Button>
      </div>
      <img src={src} alt="Document preview" className="max-h-64 w-full rounded-lg object-contain bg-gray-50" />
    </div>
  )
}
