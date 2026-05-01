export type ExtractionStatus = 'pending' | 'complete' | 'failed' | 'needs_review'
export type ExtractionMode = 'INITIAL_MAPPING' | 'AUTO_EXTRACTION'
export interface ExtractionRecord {
  id: string; workflowId: string; imagePath: string
  mode: ExtractionMode
  extractedData: Record<string, string | number | boolean | null> | null
  status: ExtractionStatus; createdAt: string; updatedAt: string
}
