import type { OcrWord, TesseractProgress } from '@/types/ocr'

export async function runOcr(
  imageSource: File | string,
  onProgress: (p: TesseractProgress) => void
): Promise<{ words: OcrWord[]; imageWidth: number; imageHeight: number }> {
  const Tesseract = await import('tesseract.js')
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => onProgress({ status: m.status, progress: m.progress ?? 0 }),
  })
  const { data } = await worker.recognize(imageSource)
  await worker.terminate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyData = data as any
  const W: number = anyData.width || 1
  const H: number = anyData.height || 1
  const words: OcrWord[] = (data.words || [])
    .filter((w: { text: string; confidence: number }) => w.text.trim() !== '' && w.confidence > 30)
    .map((w: { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: { x: w.bbox.x0, y: w.bbox.y0, w: w.bbox.x1 - w.bbox.x0, h: w.bbox.y1 - w.bbox.y0 },
      bboxNorm: { x: w.bbox.x0 / W, y: w.bbox.y0 / H, w: (w.bbox.x1 - w.bbox.x0) / W, h: (w.bbox.y1 - w.bbox.y0) / H },
    }))
  return { words, imageWidth: W, imageHeight: H }
}
