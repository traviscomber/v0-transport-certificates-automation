export type DocumentStatus = 'pending' | 'validating' | 'approved' | 'rejected'
export type DocumentType = 'licencia' | 'revision_tecnica' | 'seguro' | 'certificado' | 'otro'
export type EntityType = 'conductor' | 'subcontratista' | 'vehiculo'

export interface UploadedDocument {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
  entityType: EntityType
  entityId: string
  entityName: string
  documentType: DocumentType
  expiryDate: string
  status: DocumentStatus
  validatedBy?: string
  validatedAt?: string
  validationNotes?: string
  rejectionReason?: string
  fileUrl: string
}

export interface DocumentValidationTask {
  id: string
  documentId: string
  document: UploadedDocument
  createdAt: string
  assignedTo?: string
  priority: 'urgent' | 'high' | 'normal'
  checklist: {
    readability: boolean | null
    dataMatches: boolean | null
    validDateRange: boolean | null
    properFormat: boolean | null
  }
  notes: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}
