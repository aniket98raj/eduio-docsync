'use client'
import type { OcrField } from '@/types/ocr'
interface OCROverlayProps {
  fields: OcrField[]; selectedId: string | null
  onSelect: (id: string) => void; width: number; height: number
}
export function OCROverlay({ fields, selectedId, onSelect, width, height }: OCROverlayProps) {
  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      {fields.map(field => {
        const isSelected = field.id === selectedId
        const lb = field.labelBbox
        const vb = field.valueBbox
        return (
          <g key={field.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelect(field.id)}>
            <rect x={lb.x * width} y={lb.y * height} width={lb.w * width} height={lb.h * height}
              fill={isSelected ? 'rgba(14,165,233,0.25)' : 'rgba(99,102,241,0.15)'}
              stroke={isSelected ? '#0ea5e9' : '#6366f1'} strokeWidth="1.5" rx="2" />
            {field.valueWords.length > 0 && (
              <rect x={vb.x * width} y={vb.y * height} width={vb.w * width} height={vb.h * height}
                fill={isSelected ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.1)'}
                stroke={isSelected ? '#16a34a' : '#86efac'} strokeWidth="1.5" rx="2" />
            )}
          </g>
        )
      })}
    </svg>
  )
}
