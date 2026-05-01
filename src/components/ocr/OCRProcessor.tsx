'use client'
import { useEffect, useRef } from 'react'
import type { OcrWord, TesseractProgress } from '@/types/ocr'

interface OCRProcessorProps {
  imageFile: File
  onComplete: (words: OcrWord[], w: number, h: number) => void
  onProgress: (p: TesseractProgress) => void
  onError: (e: string) => void
}

export function OCRProcessor({ imageFile, onComplete, onProgress, onError }: OCRProcessorProps) {
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    ;(async () => {
      try {
        const { runOcr } = await import('@/lib/ocr/tesseract-runner')
        const { words, imageWidth, imageHeight } = await runOcr(imageFile, onProgress)
        onComplete(words, imageWidth, imageHeight)
      } catch (e) {
        onError(e instanceof Error ? e.message : 'OCR failed')
      }
    })()
  }, [imageFile, onComplete, onProgress, onError])
  return null
}
