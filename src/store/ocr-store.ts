import { create } from 'zustand'
import type { OcrWord, OcrField, TesseractProgress } from '@/types/ocr'

interface OcrState {
  imageFile: File | null; imageSrc: string | null
  imageDimensions: { width: number; height: number } | null
  words: OcrWord[]; ocrFields: OcrField[]
  isProcessing: boolean; progress: TesseractProgress | null; error: string | null
  setImage: (file: File, src: string) => void
  setDimensions: (w: number, h: number) => void
  setProgress: (p: TesseractProgress) => void
  setWords: (words: OcrWord[], fields: OcrField[]) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useOcrStore = create<OcrState>((set) => ({
  imageFile: null, imageSrc: null, imageDimensions: null,
  words: [], ocrFields: [], isProcessing: false, progress: null, error: null,
  setImage: (file, src) => set({ imageFile: file, imageSrc: src, words: [], ocrFields: [], error: null }),
  setDimensions: (w, h) => set({ imageDimensions: { width: w, height: h } }),
  setProgress: (p) => set({ isProcessing: true, progress: p }),
  setWords: (words, fields) => set({ words, ocrFields: fields, isProcessing: false, progress: null }),
  setError: (e) => set({ error: e, isProcessing: false }),
  reset: () => set({ imageFile: null, imageSrc: null, imageDimensions: null, words: [], ocrFields: [], isProcessing: false, progress: null, error: null }),
}))
