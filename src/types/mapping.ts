import type { BoundingBox, OcrField } from './ocr'
import type { SchemaColumnDef } from './workflow'
export interface MappingEntry {
  ocrFieldId: string; ocrField: OcrField
  schemaColumnId: string | null; schemaColumn: SchemaColumnDef | null
  suggestedColumnId: string | null
  normalizedValue: string | null; userEdited: boolean
}
export interface SavedMapping {
  id: string; workflowId: string; schemaColumnId: string
  anchorText: string; anchorBbox: BoundingBox | null
  valuePosition: 'right' | 'below' | 'inline'; valueSearchRadius: number
}
