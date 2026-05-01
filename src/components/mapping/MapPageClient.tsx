'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useOcrStore } from '@/store/ocr-store'
import { MappingCanvas } from './MappingCanvas'
import { OCRProgressBar } from '@/components/ocr/OCRProgressBar'
import { groupWordsIntoFields } from '@/lib/ocr/field-grouper'
import { Button } from '@/components/ui/Button'
import type { SchemaColumnDef } from '@/types/workflow'
import type { OcrWord, TesseractProgress } from '@/types/ocr'

const OCRProcessor = dynamic(() => import('@/components/ocr/OCRProcessor').then(m => ({ default: m.OCRProcessor })), { ssr: false })

interface Props {
  workflowId: string; extractionId: string
  imageSrc: string; schemaColumns: SchemaColumnDef[]
}

export function MapPageClient({ workflowId, extractionId, imageSrc, schemaColumns }: Props) {
  const { words, ocrFields, imageDimensions, progress, isProcessing, setProgress, setWords, setDimensions, setError, error } = useOcrStore()
  const [reprocessing, setReprocessing] = useState(false)
  const [reprocessFile, setReprocessFile] = useState<File | null>(null)
  const [needsReprocess, setNeedsReprocess] = useState(words.length === 0)

  useEffect(() => { setNeedsReprocess(words.length === 0) }, [words.length])

  const handleReprocess = async () => {
    setReprocessing(true)
    const res = await fetch(imageSrc)
    const blob = await res.blob()
    const file = new File([blob], 'reprocess.jpg', { type: blob.type })
    setReprocessFile(file)
  }

  const handleComplete = (newWords: OcrWord[], w: number, h: number) => {
    setDimensions(w, h)
    const fields = groupWordsIntoFields(newWords)
    setWords(newWords, fields)
    setReprocessing(false); setReprocessFile(null); setNeedsReprocess(false)
  }

  if (needsReprocess || reprocessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {isProcessing && progress && <OCRProgressBar progress={progress} />}
        {!isProcessing && !reprocessFile && (
          <>
            <p className="text-gray-500">OCR data not available. Re-run OCR on the uploaded document.</p>
            <Button onClick={handleReprocess}>Re-run OCR</Button>
          </>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {reprocessFile && (
          <OCRProcessor imageFile={reprocessFile}
            onComplete={handleComplete}
            onProgress={(p: TesseractProgress) => setProgress(p)}
            onError={(e: string) => { setError(e); setReprocessing(false) }} />
        )}
      </div>
    )
  }

  return (
    <MappingCanvas
      workflowId={workflowId} extractionId={extractionId}
      imageSrc={imageSrc} fields={ocrFields} schemaColumns={schemaColumns}
      imageDimensions={imageDimensions || { width: 800, height: 600 }}
    />
  )
}
