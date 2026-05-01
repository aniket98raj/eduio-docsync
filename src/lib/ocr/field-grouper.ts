import type { OcrWord, OcrField, BoundingBox } from '@/types/ocr'

function mergeBboxes(words: OcrWord[]): BoundingBox {
  if (words.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const w of words) {
    minX = Math.min(minX, w.bboxNorm.x)
    minY = Math.min(minY, w.bboxNorm.y)
    maxX = Math.max(maxX, w.bboxNorm.x + w.bboxNorm.w)
    maxY = Math.max(maxY, w.bboxNorm.y + w.bboxNorm.h)
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

function avgHeight(words: OcrWord[]): number {
  if (words.length === 0) return 0.02
  return words.reduce((s, w) => s + w.bboxNorm.h, 0) / words.length
}

function groupIntoLines(words: OcrWord[]): OcrWord[][] {
  const sorted = [...words].sort((a, b) => a.bboxNorm.y - b.bboxNorm.y)
  const lines: OcrWord[][] = []
  const tolerance = avgHeight(words) * 0.7
  for (const w of sorted) {
    const line = lines.find(l => Math.abs(l[0].bboxNorm.y - w.bboxNorm.y) < tolerance)
    if (line) line.push(w)
    else lines.push([w])
  }
  return lines.map(l => l.sort((a, b) => a.bboxNorm.x - b.bboxNorm.x))
}

const LABEL_REGEX = /^[A-Za-z][A-Za-z\s\-/#()]{0,40}:$/

function isLabel(text: string): boolean {
  return LABEL_REGEX.test(text.trim()) || /^[A-Z][A-Z\s]{3,}$/.test(text.trim())
}

export function groupWordsIntoFields(words: OcrWord[]): OcrField[] {
  const lines = groupIntoLines(words)
  const fields: OcrField[] = []
  const usedWords = new Set<OcrWord>()
  let fieldIdx = 0

  for (const line of lines) {
    let i = 0
    while (i < line.length) {
      const word = line[i]
      if (usedWords.has(word)) { i++; continue }

      // Collect consecutive label words
      const labelWords: OcrWord[] = []
      let j = i
      while (j < line.length && !usedWords.has(line[j])) {
        const candidate = [...labelWords, line[j]].map(w => w.text).join(' ')
        if (isLabel(candidate) || labelWords.length === 0) {
          labelWords.push(line[j])
          j++
          if (isLabel(labelWords.map(w => w.text).join(' '))) break
        } else break
      }

      const fullLabel = labelWords.map(w => w.text).join(' ')
      if (!isLabel(fullLabel) && labelWords.length > 0) {
        // Not a label — skip as ungrouped
        i++
        continue
      }

      if (labelWords.length === 0) { i++; continue }

      // Collect value words to the right on the same line
      const valueWords: OcrWord[] = []
      for (let k = j; k < line.length; k++) {
        if (!usedWords.has(line[k])) valueWords.push(line[k])
      }

      // If no value to right, look at next line (words horizontally overlapping)
      if (valueWords.length === 0 && lines.indexOf(line) < lines.length - 1) {
        const labelBbox = mergeBboxes(labelWords)
        const nextLine = lines[lines.indexOf(line) + 1]
        for (const nw of nextLine) {
          if (!usedWords.has(nw) && nw.bboxNorm.x < labelBbox.x + labelBbox.w + 0.15) {
            valueWords.push(nw)
          }
        }
      }

      labelWords.forEach(w => usedWords.add(w))
      valueWords.forEach(w => usedWords.add(w))

      fields.push({
        id: `field_${fieldIdx++}`,
        labelWords, valueWords,
        labelText: fullLabel,
        rawValue: valueWords.map(w => w.text).join(' '),
        labelBbox: mergeBboxes(labelWords),
        valueBbox: valueWords.length > 0 ? mergeBboxes(valueWords) : mergeBboxes(labelWords),
        confidence: Math.min(...[...labelWords, ...valueWords].map(w => w.confidence)),
      })

      i = j + valueWords.length
    }
  }

  // Fallback: any unused words with high confidence
  for (const word of words) {
    if (!usedWords.has(word) && word.confidence > 60) {
      fields.push({
        id: `field_${fieldIdx++}`,
        labelWords: [word], valueWords: [],
        labelText: word.text, rawValue: '',
        labelBbox: word.bboxNorm, valueBbox: word.bboxNorm,
        confidence: word.confidence,
      })
    }
  }

  return fields
}
