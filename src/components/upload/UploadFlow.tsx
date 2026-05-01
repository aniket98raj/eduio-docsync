'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { DropZone } from './DropZone'
import { ImagePreview } from './ImagePreview'
import { OCRProgressBar } from '@/components/ocr/OCRProgressBar'
import { Button } from '@/components/ui/Button'
import { useOcrStore } from '@/store/ocr-store'
import { groupWordsIntoFields } from '@/lib/ocr/field-grouper'
import { autoExtract } from '@/lib/mapping/auto-extractor'
import { normalizeValue } from '@/lib/ocr/normalizer'
import type { SchemaColumnDef } from '@/types/workflow'
import type { OcrWord, TesseractProgress } from '@/types/ocr'

const OCRProcessor = dynamic(() => import('@/components/ocr/OCRProcessor').then(m => ({ default: m.OCRProcessor })), { ssr: false })

interface UploadFlowProps {
  workflowId: string; mode: 'INITIAL_MAPPING' | 'AUTO_EXTRACTION'
  schemaColumns: SchemaColumnDef[]
}

type Stage = 'select' | 'ready' | 'uploading' | 'ocr' | 'processing' | 'done' | 'error'

export function UploadFlow({ workflowId, mode, schemaColumns }: UploadFlowProps) {
  const router = useRouter()
  const { setImage, setDimensions, setProgress, setWords, setError, imageFile, imageSrc, progress, error } = useOcrStore()
  const [stage, setStage] = useState<Stage>('select')
  const [ocrReady, setOcrReady] = useState(false)
  const [extractionId, setExtractionId] = useState<string | null>(null)
  const [autoResult, setAutoResult] = useState<Record<string, string | number | boolean | null> | null>(null)

  const handleFileAccepted = useCallback((file: File) => {
    const src = URL.createObjectURL(file)
    setImage(file, src); setStage('ready')
  }, [setImage])

  const handleClear = useCallback(() => {
    useOcrStore.getState().reset(); setStage('select'); setOcrReady(false); setExtractionId(null)
  }, [])

  const handleProcess = async () => {
    if (!imageFile || !imageSrc) return
    setStage('uploading')
    // 1. Upload file
    const fd = new FormData(); fd.append('file', imageFile)
    const uploadRes = await fetch('/api/uploads', { method: 'POST', body: fd })
    if (!uploadRes.ok) { setError('Upload failed'); setStage('error'); return }
    const { path } = await uploadRes.json()
    // 2. Create extraction record
    const extRes = await fetch(`/api/workflows/${workflowId}/extractions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath: path, mode, status: 'pending' }),
    })
    const ext = await extRes.json()
    setExtractionId(ext.id)
    // 3. Load image dimensions
    const img = new Image(); img.src = imageSrc
    await new Promise(r => { img.onload = r })
    setDimensions(img.naturalWidth, img.naturalHeight)
    // 4. Start OCR
    setStage('ocr'); setOcrReady(true)
  }

  const handleOCRComplete = useCallback(async (words: OcrWord[], w: number, h: number) => {
    setDimensions(w, h)
    const fields = groupWordsIntoFields(words)
    setWords(words, fields)
    setStage('processing')

    if (mode === 'INITIAL_MAPPING') {
      // Redirect to mapping page
      router.push(`/workflows/${workflowId}/map?extractionId=${extractionId}`)
    } else {
      // AUTO_EXTRACTION: fetch saved mappings and extract
      const mappingsRes = await fetch(`/api/workflows/${workflowId}/mappings`).then(r => r.json())
      const extracted = autoExtract(words, mappingsRes, schemaColumns)
      // Normalize and check required fields
      const normalized: Record<string, string | number | boolean | null> = {}
      for (const col of schemaColumns) {
        normalized[col.name] = extracted[col.name] !== undefined ? extracted[col.name] : null
      }
      setAutoResult(normalized)
      // Save to DB
      const hasAllRequired = schemaColumns.filter(c => c.required).every(c => normalized[c.name] !== null)
      await fetch(`/api/workflows/${workflowId}/extractions/${extractionId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: hasAllRequired ? 'complete' : 'needs_review',
          extractedData: normalized,
        }),
      })
      setStage('done')
    }
  }, [mode, workflowId, extractionId, schemaColumns, router, setDimensions, setWords])

  const handleOCRProgress = useCallback((p: TesseractProgress) => { setProgress(p) }, [setProgress])
  const handleOCRError = useCallback((e: string) => { setError(e); setStage('error') }, [setError])

  if (stage === 'done' && autoResult) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Extraction Complete</h3>
          <div className="space-y-2">
            {schemaColumns.map(col => (
              <div key={col.id} className="flex justify-between py-1 border-b border-green-100 last:border-0">
                <span className="text-sm font-medium text-green-700">{col.label}</span>
                <span className="text-sm text-green-900 font-mono">
                  {autoResult[col.name] !== null ? String(autoResult[col.name]) : <em className="text-green-400">not found</em>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/workflows/${workflowId}/extractions`)}>View All Extractions</Button>
          <Button variant="secondary" onClick={handleClear}>Process Another</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {(stage === 'select' || stage === 'ready') && !imageFile && <DropZone onFileAccepted={handleFileAccepted} />}
      {imageFile && imageSrc && (
        <ImagePreview src={imageSrc} fileName={imageFile.name} size={imageFile.size}
          onClear={stage === 'select' || stage === 'ready' ? handleClear : () => {}} />
      )}
      {stage === 'ready' && (
        <Button className="w-full" onClick={handleProcess}>
          Process Document ({mode === 'INITIAL_MAPPING' ? 'Setup Mapping' : 'Auto Extract'})
        </Button>
      )}
      {stage === 'uploading' && <p className="text-center text-sm text-gray-500">Uploading...</p>}
      {stage === 'ocr' && progress && <OCRProgressBar progress={progress} />}
      {stage === 'processing' && (
        <div className="text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent inline-block" />
          <p className="mt-2 text-sm text-gray-500">Processing extracted fields...</p>
        </div>
      )}
      {stage === 'error' && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
      {ocrReady && imageFile && (
        <OCRProcessor imageFile={imageFile} onComplete={handleOCRComplete} onProgress={handleOCRProgress} onError={handleOCRError} />
      )}
    </div>
  )
}
