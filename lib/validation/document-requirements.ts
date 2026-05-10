import { createClient } from '@supabase/supabase-js'

// ============================================
// Types & Interfaces
// ============================================

export interface DocumentRequirement {
  id: string
  code: string
  name: string
  description: string
  category: 'company' | 'vehicle' | 'conductor'
  periodicity: 'once' | 'monthly' | 'annual' | 'biennial' | 'triennial' | 'as_needed'
  renewal_days: number | null
  expiration_warning_days: number
  is_mandatory: boolean
  required_fields: Record<string, any>
  file_requirements: {
    allowed_types: string[]
    max_size_mb: number
  }
  acceptance_criteria: string
}

export interface ValidationRule {
  id: string
  document_requirement_id: string
  rule_type: string
  rule_order: number
  parameters: Record<string, any>
  error_message: string
  error_message_es: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  confidence: number
  extractedData: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
  message_es: string
  severity: 'error' | 'warning'
  ruleType: string
}

export interface ValidationWarning {
  field: string
  message: string
  message_es: string
}

export interface ComplianceStatus {
  documentCode: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
  submissionDate: Date | null
  expiryDate: Date | null
  daysUntilExpiry: number | null
  rejectionReason: string | null
}

// ============================================
// Validators
// ============================================

export const RUTValidator = {
  format: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
  normalize: (rut: string): string => {
    return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  },
  validate: (rut: string): boolean => {
    const normalized = RUTValidator.normalize(rut)
    if (!/^(\d{7,8}[0-9K])$/.test(normalized)) return false

    const [body, dv] = [normalized.slice(0, -1), normalized.slice(-1)]
    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const calculatedDV = 11 - (sum % 11)
    const expectedDV = calculatedDV === 11 ? '0' : calculatedDV === 10 ? 'K' : String(calculatedDV)

    return dv === expectedDV
  },
}

export const LicenseValidator = {
  format: /^[A-Z]$/,
  validate: (licenseClass: string): boolean => {
    return /^[A-E]$/.test(licenseClass)
  },
}

export const DateValidator = {
  validate: (date: string): boolean => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  },
  isFuture: (date: string): boolean => {
    const parsed = new Date(date)
    return parsed > new Date()
  },
  daysUntilExpiry: (expiryDate: string): number => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },
}

export const FileValidator = {
  validateType: (mimeType: string, allowedTypes: string[]): boolean => {
    const extension = mimeType.split('/')[1]
    return allowedTypes.includes(extension)
  },
  validateSize: (fileSizeBytes: number, maxSizeMB: number): boolean => {
    return fileSizeBytes <= maxSizeMB * 1024 * 1024
  },
}

// ============================================
// Compliance Checker
// ============================================

export class ComplianceChecker {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Get all document requirements for a conductor
   */
  async getConductorRequirements(conductorId: string): Promise<DocumentRequirement[]> {
    const { data, error } = await this.supabase
      .from('document_requirements')
      .select('*')
      .eq('applicable_to_conductor', true)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  /**
   * Get all document requirements for a company
   */
  async getCompanyRequirements(transportistaId: string): Promise<DocumentRequirement[]> {
    const { data, error } = await this.supabase
      .from('document_requirements')
      .select('*')
      .eq('applicable_to_transportista', true)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  /**
   * Calculate compliance score
   */
  async calculateComplianceScore(
    entityType: 'conductor' | 'company',
    entityId: string
  ): Promise<{
    score: number
    riskLevel: string
    completedDocuments: number
    totalRequiredDocuments: number
    expiredDocuments: number
    missingDocuments: number
  }> {
    const tableName = entityType === 'conductor' ? 'conductor_document_compliance' : 'company_document_compliance'
    const entityField = entityType === 'conductor' ? 'conductor_id' : 'transportista_id'

    const { data: compliance, error } = await this.supabase
      .from(tableName)
      .select('status, expiry_date')
      .eq(entityField, entityId)

    if (error) throw error

    const now = new Date()
    let completed = 0
    let expired = 0
    let missing = 0

    compliance?.forEach((item) => {
      if (item.status === 'approved') {
        completed++

        if (item.expiry_date) {
          const expiryDate = new Date(item.expiry_date)
          if (expiryDate < now) expired++
        }
      } else if (item.status === 'pending') {
        missing++
      }
    })

    const total = compliance?.length || 0
    const score = total > 0 ? (completed / total) * 100 : 0
    const riskLevel = score >= 90 ? 'low' : score >= 70 ? 'medium' : 'high'

    return {
      score: Math.round(score),
      riskLevel,
      completedDocuments: completed,
      totalRequiredDocuments: total,
      expiredDocuments: expired,
      missingDocuments: missing,
    }
  }

  /**
   * Check if specific document is compliant
   */
  async checkDocumentCompliance(
    entityType: 'conductor' | 'company',
    entityId: string,
    documentCode: string
  ): Promise<ComplianceStatus> {
    const { data: requirement } = await this.supabase
      .from('document_requirements')
      .select('*')
      .eq('code', documentCode)
      .single()

    const tableName = entityType === 'conductor' ? 'conductor_document_compliance' : 'company_document_compliance'
    const entityField = entityType === 'conductor' ? 'conductor_id' : 'transportista_id'

    const { data: compliance } = await this.supabase
      .from(tableName)
      .select('*')
      .eq(entityField, entityId)
      .eq('document_requirement_id', requirement?.id)
      .single()

    const daysUntilExpiry = compliance?.expiry_date
      ? DateValidator.daysUntilExpiry(compliance.expiry_date)
      : null

    return {
      documentCode,
      status: compliance?.status || 'pending',
      submissionDate: compliance?.submission_date ? new Date(compliance.submission_date) : null,
      expiryDate: compliance?.expiry_date ? new Date(compliance.expiry_date) : null,
      daysUntilExpiry,
      rejectionReason: compliance?.rejection_reason || null,
    }
  }

  /**
   * Get documents expiring soon
   */
  async getExpiringDocuments(
    entityType: 'conductor' | 'company',
    entityId: string,
    warningDays: number = 30
  ): Promise<any[]> {
    const tableName = entityType === 'conductor' ? 'conductor_document_compliance' : 'company_document_compliance'
    const entityField = entityType === 'conductor' ? 'conductor_id' : 'transportista_id'

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + warningDays)

    const { data, error } = await this.supabase
      .from(tableName)
      .select('*, document_requirement_id(*)')
      .eq(entityField, entityId)
      .lt('expiry_date', futureDate.toISOString())
      .gt('expiry_date', new Date().toISOString())

    if (error) throw error
    return data || []
  }

  /**
   * Get missing mandatory documents
   */
  async getMissingDocuments(
    entityType: 'conductor' | 'company',
    entityId: string
  ): Promise<DocumentRequirement[]> {
    const tableName = entityType === 'conductor' ? 'conductor_document_compliance' : 'company_document_compliance'
    const entityField = entityType === 'conductor' ? 'conductor_id' : 'transportista_id'

    const { data: pendingDocs } = await this.supabase
      .from(tableName)
      .select('document_requirement_id')
      .eq(entityField, entityId)
      .in('status', ['pending', 'rejected'])

    const pendingIds = pendingDocs?.map((d) => d.document_requirement_id) || []

    const { data: missingRequirements, error } = await this.supabase
      .from('document_requirements')
      .select('*')
      .in('id', pendingIds)
      .eq('is_mandatory', true)

    if (error) throw error
    return missingRequirements || []
  }
}

// ============================================
// Export singleton instance
// ============================================

export const complianceChecker = new ComplianceChecker()
