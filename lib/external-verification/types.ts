export type VerificationSourceCode =
  | 'sii_tax_status'
  | 'res_company_registry'
  | 'dt_document_verifier'
  | 'registro_civil_verifier'
  | 'superir_concursal'
  | 'mercado_publico_supplier'
  | 'cmf_registry'
  | 'mtt_sitcomex'
  | 'mtt_prt_vehicle_status'

export type VerificationEntityType =
  | 'transportista'
  | 'conductor'
  | 'vehiculo'
  | 'documento'
  | 'aseguradora'

export type VerificationStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'warning'
  | 'not_found'
  | 'blocked'
  | 'failed'
  | 'skipped'

export type CircuitState = 'closed' | 'open' | 'half_open'

export interface VerificationEvidence {
  label: string
  value?: string
  sourceUrl?: string
  retrievedAt: string
}

export interface VerificationResult {
  status: Extract<VerificationStatus, 'success' | 'warning' | 'not_found' | 'blocked' | 'failed' | 'skipped'>
  normalizedResult?: Record<string, unknown>
  evidence?: VerificationEvidence[]
  confidence?: number
  errorCode?: string
  errorMessage?: string
  httpStatus?: number
}

export interface VerificationRequest {
  sourceCode: VerificationSourceCode
  entityType: VerificationEntityType
  entityId?: string
  documentSource?: 'uploaded_documents' | 'subcontractor_documents'
  documentId?: string
  payload: Record<string, unknown>
}

export interface VerificationSourceAdapter {
  code: VerificationSourceCode
  verify(input: VerificationRequest): Promise<VerificationResult>
}
