import { DocumentRequirement, ValidationRule, ValidationResult, RUTValidator, DateValidator, FileValidator } from './document-requirements'
import { createClient } from '@supabase/supabase-js'

/**
 * Document Validation Service
 * Applies validation rules to uploaded documents
 */
export class DocumentValidationService {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Validate a document against all its rules
   */
  async validateDocument(
    documentRequirement: DocumentRequirement,
    fileData: {
      mimeType: string
      fileSize: number
      buffer: Buffer
    },
    extractedData: Record<string, any>
  ): Promise<ValidationResult> {
    const errors: any[] = []
    const warnings: any[] = []
    let confidence = 0

    // Step 1: Validate file format and size
    const fileValidation = this.validateFileRequirements(fileData, documentRequirement.file_requirements)
    if (!fileValidation.isValid) {
      errors.push(...fileValidation.errors)
    }

    // Step 2: Get validation rules from database
    const { data: rules, error: rulesError } = await this.supabase
      .from('document_validation_rules')
      .select('*')
      .eq('document_requirement_id', documentRequirement.id)
      .eq('is_active', true)
      .order('rule_order', { ascending: true })

    if (rulesError) throw rulesError

    // Step 3: Apply each validation rule
    for (const rule of rules || []) {
      const ruleValidation = this.applyValidationRule(rule, extractedData)

      if (ruleValidation.isError) {
        errors.push({
          field: rule.parameters.field || 'document',
          message: rule.error_message,
          message_es: rule.error_message_es,
          severity: 'error',
          ruleType: rule.rule_type,
        })
      } else if (ruleValidation.isWarning) {
        warnings.push({
          field: rule.parameters.field || 'document',
          message: ruleValidation.message,
          message_es: ruleValidation.message_es || ruleValidation.message,
        })
      }

      confidence += ruleValidation.confidence
    }

    const totalRules = (rules?.length || 0) + (fileValidation.isValid ? 1 : 0)
    confidence = totalRules > 0 ? confidence / totalRules : 0

    return {
      isValid: errors.length === 0 && fileValidation.isValid,
      errors,
      warnings,
      confidence: Math.min(confidence, 1.0),
      extractedData,
    }
  }

  /**
   * Validate file requirements (type, size)
   */
  private validateFileRequirements(fileData: any, requirements: any) {
    const errors: any[] = []

    // Check file type
    if (!FileValidator.validateType(fileData.mimeType, requirements.allowed_types)) {
      errors.push({
        field: 'file_type',
        message: `File type not allowed. Allowed types: ${requirements.allowed_types.join(', ')}`,
        message_es: `Tipo de archivo no permitido. Tipos permitidos: ${requirements.allowed_types.join(', ')}`,
        severity: 'error',
        ruleType: 'file_type',
      })
    }

    // Check file size
    if (!FileValidator.validateSize(fileData.fileSize, requirements.max_size_mb)) {
      errors.push({
        field: 'file_size',
        message: `File size exceeds maximum of ${requirements.max_size_mb}MB`,
        message_es: `El tamaño del archivo excede el máximo de ${requirements.max_size_mb}MB`,
        severity: 'error',
        ruleType: 'file_size',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(rule: ValidationRule, data: Record<string, any>) {
    const { rule_type, parameters } = rule
    let isError = false
    let isWarning = false
    let confidence = 0.8
    let message = ''
    let message_es = ''

    switch (rule_type) {
      case 'rut_format':
        if (data.rut) {
          if (RUTValidator.validate(data.rut)) {
            confidence = 1.0
          } else {
            isError = true
            confidence = 0
          }
        }
        break

      case 'date_format':
        if (data[parameters.field]) {
          if (DateValidator.validate(data[parameters.field])) {
            confidence = 1.0
          } else {
            isError = true
            confidence = 0
          }
        }
        break

      case 'date_future':
        if (data[parameters.field]) {
          if (DateValidator.isFuture(data[parameters.field])) {
            confidence = 1.0
          } else {
            isWarning = true
            message = 'Document expiration date is in the past'
            message_es = 'La fecha de expiración del documento es en el pasado'
            confidence = 0.3
          }
        }
        break

      case 'required_field':
        if (!data[parameters.field] || data[parameters.field] === '') {
          isError = true
          confidence = 0
        } else {
          confidence = 1.0
        }
        break

      case 'pattern_match':
        if (data[parameters.field]) {
          const pattern = new RegExp(parameters.pattern)
          if (pattern.test(data[parameters.field])) {
            confidence = 1.0
          } else {
            isError = true
            confidence = 0
          }
        }
        break

      default:
        confidence = 0.5
    }

    return { isError, isWarning, confidence, message, message_es }
  }

  /**
   * Get document requirement by code
   */
  async getRequirementByCode(code: string): Promise<DocumentRequirement | null> {
    const { data, error } = await this.supabase
      .from('document_requirements')
      .select('*')
      .eq('code', code)
      .single()

    if (error) return null
    return data
  }

  /**
   * Get all validation rules for a document
   */
  async getValidationRules(documentRequirementId: string): Promise<ValidationRule[]> {
    const { data, error } = await this.supabase
      .from('document_validation_rules')
      .select('*')
      .eq('document_requirement_id', documentRequirementId)
      .eq('is_active', true)
      .order('rule_order', { ascending: true })

    if (error) throw error
    return data || []
  }
}

export const documentValidationService = new DocumentValidationService()
