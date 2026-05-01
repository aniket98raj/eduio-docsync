export type ColumnDataType = 'text' | 'number' | 'date' | 'boolean'
export interface SchemaColumnDef {
  id: string; name: string; label: string
  dataType: ColumnDataType; required: boolean; order: number
}
export interface WorkflowSummary {
  id: string; name: string; description: string | null
  status: string; createdAt: string; updatedAt: string
  schemaColumns: SchemaColumnDef[]
  _count: { extractions: number; fieldMappings: number }
}
