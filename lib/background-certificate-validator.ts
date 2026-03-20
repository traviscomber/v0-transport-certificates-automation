/**
 * Chilean Background Certificate (Certificado de Antecedentes) Validator
 * Used for professional screening in transportation industry
 * 
 * Certificate fields:
 * - RUT del solicitante
 * - Nombre completo
 * - Fecha de emisión
 * - Número de certificado
 * - Estado: "SIN ANTECEDENTES" or "CON ANTECEDENTES"
 * - Validez: 6 meses o 1 año típicamente
 */

import { validateRUT, validateChileanDate, isDateExpired, daysUntilExpiration, formatChileanDate } from './chilean-validators'

export interface BackgroundCertificate {
  rut: string
  nombres: string
  apellidos: string
  fechaEmision: string
  fechaVencimiento: string
  numeroCertificado: string
  estado: 'sin_antecedentes' | 'con_antecedentes' | 'no_especificado'
  observaciones?: string
}

export interface CertificateValidationResult {
  valid: boolean
  status: 'clean' | 'has_records' | 'expired' | 'invalid' | 'requires_review'
  confidence: number // 0-100
  errors: string[]
  warnings: string[]
  certificateData?: BackgroundCertificate
  requiresHumanReview: boolean
  nextReviewDate?: Date
}

/**
 * NIVEL 1: Validación local básica del certificado
 */
export function validateCertificateFormat(certificate: Partial<BackgroundCertificate>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // RUT validation
  if (!certificate.rut) {
    errors.push('RUT es requerido')
  } else {
    const rutValidation = validateRUT(certificate.rut)
    if (!rutValidation.valid) {
      errors.push(`RUT inválido: ${rutValidation.error}`)
    }
  }

  // Nombres
  if (!certificate.nombres || certificate.nombres.trim().length < 2) {
    errors.push('Nombre es requerido (mínimo 2 caracteres)')
  }

  // Apellidos
  if (!certificate.apellidos || certificate.apellidos.trim().length < 2) {
    errors.push('Apellidos son requeridos (mínimo 2 caracteres)')
  }

  // Fecha de emisión
  if (!certificate.fechaEmision) {
    errors.push('Fecha de emisión es requerida')
  } else {
    const dateValidation = validateChileanDate(certificate.fechaEmision)
    if (!dateValidation.valid) {
      errors.push(`Fecha de emisión inválida: ${dateValidation.error}`)
    }
  }

  // Fecha de vencimiento
  if (!certificate.fechaVencimiento) {
    errors.push('Fecha de vencimiento es requerida')
  } else {
    const dateValidation = validateChileanDate(certificate.fechaVencimiento)
    if (!dateValidation.valid) {
      errors.push(`Fecha de vencimiento inválida: ${dateValidation.error}`)
    }
  }

  // Número de certificado
  if (!certificate.numeroCertificado || certificate.numeroCertificado.trim().length < 5) {
    errors.push('Número de certificado inválido')
  }

  // Estado
  if (!certificate.estado || !['sin_antecedentes', 'con_antecedentes', 'no_especificado'].includes(certificate.estado)) {
    errors.push('Estado del certificado debe ser especificado')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * NIVEL 2: Validación lógica y cruzada del certificado
 */
export function validateCertificateLogic(certificate: BackgroundCertificate): {
  valid: boolean
  warnings: string[]
  requiresReview: boolean
  status: 'clean' | 'has_records' | 'expired' | 'suspicious'
} {
  const warnings: string[] = []
  let requiresReview = false
  let status: 'clean' | 'has_records' | 'expired' | 'suspicious' = 'clean'

  // Verificar si está expirado
  if (isDateExpired(certificate.fechaVencimiento)) {
    warnings.push('⚠️ Certificado expirado')
    status = 'expired'
    requiresReview = true
  }

  // Advertencia si expira pronto (menos de 30 días)
  const daysRemaining = daysUntilExpiration(certificate.fechaVencimiento)
  if (daysRemaining && daysRemaining < 30 && daysRemaining > 0) {
    warnings.push(`⚠️ Certificado expira en ${daysRemaining} días`)
    requiresReview = true
  }

  // Verificar vigencia lógica (emisión vs vencimiento)
  const emitDate = new Date(certificate.fechaEmision.split('/').reverse().join('-'))
  const expireDate = new Date(certificate.fechaVencimiento.split('/').reverse().join('-'))
  
  const daysDiff = Math.floor((expireDate.getTime() - emitDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Certificados típicamente tienen 6 o 12 meses de vigencia
  if (daysDiff < 150 || daysDiff > 430) {
    warnings.push(`⚠️ Vigencia inusual (${daysDiff} días)`)
    requiresReview = true
    status = 'suspicious'
  }

  // Si tiene antecedentes
  if (certificate.estado === 'con_antecedentes') {
    warnings.push('⚠️ Certificado muestra ANTECEDENTES - Requiere revisión manual')
    status = 'has_records'
    requiresReview = true
  }

  // Si tiene observaciones
  if (certificate.observaciones && certificate.observaciones.toLowerCase().includes('cautela')) {
    warnings.push('⚠️ Existe cautela legal - Requiere revisión')
    requiresReview = true
  }

  return {
    valid: status !== 'expired' && status !== 'has_records',
    warnings,
    requiresReview,
    status,
  }
}

/**
 * NIVEL 3: Validación completa con score
 */
export function validateBackgroundCertificate(certificate: Partial<BackgroundCertificate>): CertificateValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let confidence = 100
  let requiresHumanReview = false
  let status: 'clean' | 'has_records' | 'expired' | 'invalid' | 'requires_review' = 'clean'

  // PASO 1: Validar formato
  const formatValidation = validateCertificateFormat(certificate)
  if (!formatValidation.valid) {
    errors.push(...formatValidation.errors)
    confidence = 0
    status = 'invalid'
    return {
      valid: false,
      status,
      confidence,
      errors,
      warnings,
      requiresHumanReview: true,
    }
  }

  // PASO 2: Validar lógica
  const logicValidation = validateCertificateLogic(certificate as BackgroundCertificate)
  warnings.push(...logicValidation.warnings)
  requiresHumanReview = logicValidation.requiresReview
  status = logicValidation.status

  // PASO 3: Calcular confidence score
  if (status === 'clean') {
    confidence = 95 // Perfecto, pero aún se puede validar con API
  } else if (status === 'has_records') {
    confidence = 100 // Se detectó que tiene antecedentes - claro
    requiresHumanReview = true
  } else if (status === 'expired') {
    confidence = 90 // Expirado - claro pero necesita renovación
    requiresHumanReview = true
  } else if (status === 'suspicious') {
    confidence = 70 // Sospechoso - requiere revisión
    requiresHumanReview = true
  }

  // Calcula próxima fecha de revisión
  let nextReviewDate: Date | undefined
  if (!isDateExpired(certificate.fechaVencimiento as string)) {
    const expireDate = new Date((certificate.fechaVencimiento as string).split('/').reverse().join('-'))
    nextReviewDate = new Date(expireDate.getTime() + 1000 * 60 * 60 * 24) // Día después de vencer
  }

  return {
    valid: status === 'clean',
    status,
    confidence,
    errors,
    warnings,
    certificateData: certificate as BackgroundCertificate,
    requiresHumanReview,
    nextReviewDate,
  }
}

/**
 * Integración con OCR: Procesa datos extraídos del certificado
 * Usado después que OCR extrae el documento
 */
export function processOCRBackgroundCertificate(ocrData: Record<string, any>): CertificateValidationResult {
  // Mapeo de campos según formato típico de Carabineros
  const certificate: Partial<BackgroundCertificate> = {
    rut: ocrData.rut || ocrData.rutSolicitante || '',
    nombres: ocrData.nombres || ocrData.nombre || '',
    apellidos: ocrData.apellidos || `${ocrData.apellidoPaterno || ''} ${ocrData.apellidoMaterno || ''}`.trim(),
    fechaEmision: ocrData.fechaEmision || ocrData.fechaExpedicion || '',
    fechaVencimiento: ocrData.fechaVencimiento || ocrData.validoHasta || '',
    numeroCertificado: ocrData.numeroCertificado || ocrData.numero || '',
    estado: mapearEstadoAntecedentes(ocrData.estado || ocrData.resultado || ''),
    observaciones: ocrData.observaciones || ocrData.notas || '',
  }

  return validateBackgroundCertificate(certificate)
}

/**
 * Mapea variaciones de texto de estado a formato estandarizado
 */
function mapearEstadoAntecedentes(estado: string): 'sin_antecedentes' | 'con_antecedentes' | 'no_especificado' {
  const normalizado = estado.toUpperCase().trim()

  if (normalizado.includes('SIN ANTECEDENTES') || normalizado.includes('CLEAN')) {
    return 'sin_antecedentes'
  }

  if (normalizado.includes('CON ANTECEDENTES') || normalizado.includes('RECORDS')) {
    return 'con_antecedentes'
  }

  return 'no_especificado'
}

/**
 * Genera reporte legible del certificado para UI
 */
export function generateCertificateReport(validation: CertificateValidationResult): string {
  let report = ''

  if (validation.status === 'clean') {
    report = `✅ Certificado de Antecedentes LIMPIO\n`
    report += `RUT: ${validation.certificateData?.rut}\n`
    report += `Nombre: ${validation.certificateData?.nombres} ${validation.certificateData?.apellidos}\n`
    report += `Vigencia: ${validation.certificateData?.fechaVencimiento}\n`
    report += `Confianza: ${validation.confidence}%`
  } else if (validation.status === 'has_records') {
    report = `⚠️ CERTIFICADO CON ANTECEDENTES\n`
    report += `Este conductor tiene registros de antecedentes.\n`
    report += `Requiere revisión y aprobación manual para continuar.`
  } else if (validation.status === 'expired') {
    report = `🚫 CERTIFICADO EXPIRADO\n`
    report += `Fecha de vencimiento: ${validation.certificateData?.fechaVencimiento}\n`
    report += `Debe renovar el certificado de inmediato.`
  } else if (validation.requiresHumanReview) {
    report = `🔍 REQUIERE REVISIÓN MANUAL\n`
    report += validation.warnings.join('\n')
  }

  return report
}

export default {
  validateCertificateFormat,
  validateCertificateLogic,
  validateBackgroundCertificate,
  processOCRBackgroundCertificate,
  generateCertificateReport,
}
