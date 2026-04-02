export interface ChileanDocumentReference {
  id: string
  name: string
  category: 'conductor' | 'vehiculo' | 'empresa' | 'especial'
  issuer: string
  validity_years: number
  priority: 'CRÍTICA' | 'ALTA' | 'MEDIA'
  ocr_fields: string[]
  mandatory_validations: string[]
  penalties: string
  renewal_process: string
  notes: string
}
