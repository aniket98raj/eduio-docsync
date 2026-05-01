import type { OcrField } from '@/types/ocr'
import type { SchemaColumnDef } from '@/types/workflow'

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean)
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a), setB = new Set(b)
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

export function suggestMappings(
  fields: OcrField[],
  columns: SchemaColumnDef[]
): Map<string, string> {
  const result = new Map<string, string>()
  const assignedColumns = new Set<string>()

  // Build scored pairs
  const pairs: { fieldId: string; colId: string; score: number }[] = []

  for (const field of fields) {
    const labelTokens = tokenize(field.labelText)
    for (const col of columns) {
      const colTokens = tokenize(col.label + ' ' + col.name)
      let score = jaccard(labelTokens, colTokens)
      // Boost for keyword matches
      if (labelTokens.some(t => ['date','dob','birth'].includes(t)) && col.dataType === 'date') score += 0.3
      if (labelTokens.some(t => ['name','patient','person'].includes(t)) && col.name.includes('name')) score += 0.2
      if (labelTokens.some(t => ['no','num','number','#','id'].includes(t)) && col.dataType === 'number') score += 0.2
      if (score > 0.15) pairs.push({ fieldId: field.id, colId: col.id, score })
    }
  }

  pairs.sort((a, b) => b.score - a.score)
  for (const { fieldId, colId, score } of pairs) {
    if (!result.has(fieldId) && !assignedColumns.has(colId) && score > 0.15) {
      result.set(fieldId, colId)
      assignedColumns.add(colId)
    }
  }
  return result
}
