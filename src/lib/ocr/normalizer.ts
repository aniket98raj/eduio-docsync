import type { ColumnDataType } from '@/types/workflow'

function cleanOcrNoise(s: string): string {
  return s.replace(/\s{2,}/g, ' ').trim()
}

export function normalizeValue(
  raw: string,
  dataType: ColumnDataType
): string | number | boolean | null {
  const cleaned = cleanOcrNoise(raw)
  if (!cleaned) return null

  if (dataType === 'boolean') {
    const lower = cleaned.toLowerCase()
    if (/^(yes|y|true|1|✓|x)$/.test(lower)) return true
    if (/^(no|n|false|0)$/.test(lower)) return false
    return null
  }

  if (dataType === 'number') {
    const num = parseFloat(cleaned.replace(/[$,\s]/g, ''))
    return isNaN(num) ? null : num
  }

  if (dataType === 'date') {
    const noisy = cleaned.replace(/O/g, '0').replace(/l/g, '1')
    const patterns = [
      { re: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, fn: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` },
      { re: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, fn: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` },
      { re: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, fn: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}` },
      { re: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i, fn: (m: RegExpMatchArray) => {
        const months: Record<string,string> = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'}
        return `${m[3]}-${months[m[2].toLowerCase().slice(0,3)]}-${m[1].padStart(2,'0')}`
      }},
    ]
    for (const { re, fn } of patterns) {
      const m = noisy.match(re)
      if (m) return fn(m)
    }
    return cleaned
  }

  // text: proper case if all caps
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 2) {
    return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }
  return cleaned
}
