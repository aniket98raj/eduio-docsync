import type { TesseractProgress } from '@/types/ocr'
export function OCRProgressBar({ progress }: { progress: TesseractProgress }) {
  const pct = Math.round((progress.progress || 0) * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span className="capitalize">{progress.status}...</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
