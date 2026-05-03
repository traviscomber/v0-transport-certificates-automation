import { z } from 'zod'

export const DocumentTypeRules = {
  'Licencia de Conducir': {
    keywords: ['licencia', 'conducir', 'rut', 'vencimiento', 'driver'],
    warningDaysThreshold: 60,
    critical: true,
  },
  'Certificado de Antecedentes': {
    keywords: ['antecedentes', 'certificate', 'certificado'],
    warningDaysThreshold: 180,
    critical: true,
  },
  'Póliza de Seguro': {
    keywords: ['seguro', 'insurance', 'póliza', 'vigencia'],
    warningDaysThreshold: 90,
    critical: true,
  },
  'Verificación Técnica': {
    keywords: ['verificación', 'técnica', 'vtf', 'control'],
    warningDaysThreshold: 45,
    critical: true,
  },
  'Permiso de Circulación': {
    keywords: ['permiso', 'circulación', 'vencimiento'],
    warningDaysThreshold: 30,
    critical: true,
  },
  'Contrato de Trabajo': {
    keywords: ['contrato', 'trabajo', 'empleado', 'vigencia'],
    warningDaysThreshold: 180,
    critical: false,
  },
  'Certificado de Afiliación': {
    keywords: ['afiliación', 'previsión', 'isapre', 'fonasa'],
    warningDaysThreshold: 365,
    critical: false,
  },
}

/**
 * Normalize document type to standard Chilean transport document types
 */
export function normalizeDocumentType(detected: string): string {
  const lower = detected.toLowerCase()
  
  if (lower.includes('licencia') || lower.includes('driver') || lower.includes('conducir')) {
    return 'Licencia de Conducir'
  }
  if (lower.includes('antecedentes') || lower.includes('certificate')) {
    return 'Certificado de Antecedentes'
  }
  if (lower.includes('seguro') || lower.includes('insurance') || lower.includes('póliza')) {
    return 'Póliza de Seguro'
  }
  if (lower.includes('verificación') || lower.includes('técnica') || lower.includes('vtf')) {
    return 'Verificación Técnica'
  }
  if (lower.includes('permiso') || lower.includes('circulación')) {
    return 'Permiso de Circulación'
  }
  if (lower.includes('contrato') || lower.includes('trabajo')) {
    return 'Contrato de Trabajo'
  }
  if (lower.includes('afiliación') || lower.includes('previsión')) {
    return 'Certificado de Afiliación'
  }

  // Default: return the detected type as-is
  return detected
}

/**
 * Get warning threshold in days for a document type
 */
export function getWarningThreshold(documentType: string): number {
  const normalized = normalizeDocumentType(documentType)
  const rules = DocumentTypeRules[normalized as keyof typeof DocumentTypeRules]
  return rules?.warningDaysThreshold || 90
}

/**
 * Check if a document type is critical (requires high compliance)
 */
export function isCriticalDocument(documentType: string): boolean {
  const normalized = normalizeDocumentType(documentType)
  const rules = DocumentTypeRules[normalized as keyof typeof DocumentTypeRules]
  return rules?.critical ?? false
}

/**
 * Calculate days until expiration
 */
export function daysUntilExpiration(expirationDate: string | null): number | null {
  if (!expirationDate) return null
  
  const expDate = new Date(expirationDate)
  const today = new Date()
  return Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Determine validation status based on extraction and classification
 */
export function determineValidationStatus(
  confidence: number,
  daysUntilExp: number | null,
  hasAllRequiredFields: boolean
): 'approved' | 'pending' | 'rejected' {
  // Low confidence or missing fields → pending
  if (confidence < 0.7 || !hasAllRequiredFields) {
    return 'pending'
  }

  // Expired or expiring soon → auto-reject for review
  if (daysUntilExp !== null && daysUntilExp < 0) {
    return 'rejected'
  }

  // Valid document
  return 'approved'
}
