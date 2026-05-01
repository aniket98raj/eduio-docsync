import { create } from 'zustand'
import type { MappingEntry } from '@/types/mapping'

interface MappingState {
  workflowId: string | null; extractionId: string | null
  entries: MappingEntry[]; selectedOcrFieldId: string | null; isSaving: boolean
  initSession: (workflowId: string, extractionId: string, entries: MappingEntry[]) => void
  setColumnForField: (ocrFieldId: string, columnId: string | null) => void
  setNormalizedValue: (ocrFieldId: string, value: string) => void
  selectField: (id: string | null) => void
  setSaving: (v: boolean) => void
  reset: () => void
}

export const useMappingStore = create<MappingState>((set) => ({
  workflowId: null, extractionId: null, entries: [], selectedOcrFieldId: null, isSaving: false,
  initSession: (workflowId, extractionId, entries) => set({ workflowId, extractionId, entries }),
  setColumnForField: (ocrFieldId, columnId) => set(s => ({
    entries: s.entries.map(e => e.ocrFieldId === ocrFieldId
      ? { ...e, schemaColumnId: columnId, userEdited: true } : e)
  })),
  setNormalizedValue: (ocrFieldId, value) => set(s => ({
    entries: s.entries.map(e => e.ocrFieldId === ocrFieldId ? { ...e, normalizedValue: value } : e)
  })),
  selectField: (id) => set({ selectedOcrFieldId: id }),
  setSaving: (v) => set({ isSaving: v }),
  reset: () => set({ workflowId: null, extractionId: null, entries: [], selectedOcrFieldId: null, isSaving: false }),
}))
