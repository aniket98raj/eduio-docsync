export interface BoundingBox { x: number; y: number; w: number; h: number }
export interface OcrWord {
  text: string
  confidence: number
  bbox: BoundingBox
  bboxNorm: BoundingBox
}
export interface OcrField {
  id: string
  labelWords: OcrWord[]
  valueWords: OcrWord[]
  labelText: string
  rawValue: string
  labelBbox: BoundingBox
  valueBbox: BoundingBox
  confidence: number
}
export interface TesseractProgress { status: string; progress: number }
