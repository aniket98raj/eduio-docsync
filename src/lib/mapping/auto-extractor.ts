import type { OcrWord } from '@/types/ocr'
import type { SavedMapping } from '@/types/mapping'
import type { SchemaColumnDef } from '@/types/workflow'
import { normalizeValue } from '@/lib/ocr/normalizer'

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[a.length][b.length]
}

function findAnchorWord(anchorText: string, words: OcrWord[]): OcrWord | null {
  const norm = anchorText.toLowerCase().trim()
  let best: OcrWord | null = null
  let bestDist = Infinity
  for (const w of words) {
    const d = levenshtein(norm, w.text.toLowerCase().trim())
    if (d < bestDist && d <= 2) { best = w; bestDist = d }
  }
  return best
}

export function autoExtract(
  words: OcrWord[],
  savedMappings: SavedMapping[],
  schemaColumns: SchemaColumnDef[],
): Record<string, string | number | boolean | null> {
  const result: Record<string, string | number | boolean | null> = {}
  const columnMap = new Map(schemaColumns.map(c => [c.id, c]))

  for (const mapping of savedMappings) {
    const col = columnMap.get(mapping.schemaColumnId)
    if (!col) continue

    const anchor = findAnchorWord(mapping.anchorText, words)
    if (!anchor) continue

    const r = mapping.valueSearchRadius
    let valueWords: OcrWord[] = []

    if (mapping.valuePosition === 'right') {
      valueWords = words.filter(w =>
        w.bboxNorm.x > anchor.bboxNorm.x + anchor.bboxNorm.w - 0.01 &&
        Math.abs(w.bboxNorm.y - anchor.bboxNorm.y) < r * 2 &&
        w !== anchor
      )
    } else if (mapping.valuePosition === 'below') {
      valueWords = words.filter(w =>
        w.bboxNorm.y > anchor.bboxNorm.y + anchor.bboxNorm.h - 0.01 &&
        w.bboxNorm.x >= anchor.bboxNorm.x - r &&
        w.bboxNorm.x <= anchor.bboxNorm.x + anchor.bboxNorm.w + r &&
        w !== anchor
      )
    } else {
      valueWords = words.filter(w =>
        Math.abs(w.bboxNorm.y - anchor.bboxNorm.y) < r &&
        w.bboxNorm.x > anchor.bboxNorm.x + anchor.bboxNorm.w - 0.01 &&
        w !== anchor
      )
    }

    valueWords.sort((a, b) => a.bboxNorm.x - b.bboxNorm.x)
    const rawValue = valueWords.map(w => w.text).join(' ')
    result[col.name] = normalizeValue(rawValue, col.dataType)
  }

  return result
}
