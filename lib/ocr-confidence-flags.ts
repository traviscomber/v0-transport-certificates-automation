/**
 * OCR Confidence Flags - Automatic quality checks
 * Generates flags based on OCR confidence thresholds
 * Helps Walmart identify documents that need manual review
 */

export interface ConfidenceFlag {
  type: 'warning' | 'critical' | 'info'
  code: string
  message: string
  suggestedAction: string
  field?: string
  confidence?: number
}

export interface OCRQualityAnalysis {
  overallConfidence: number
  fieldConfidences: Record<string, number>
  flags: ConfidenceFlag[]
  autoAction: 'auto-approve' | 'manual-review' | 'reject'
  actionReason: string
}

/**
 * Analyze OCR confidence and generate automatic flags
 */
export function generateConfidenceFlags(
  ocrResponse: any,
  documentType: string
): OCRQualityAnalysis {
  const flags: ConfidenceFlag[] = []
  const fieldConfidences: Record<string, number> = {}
  let totalConfidence = 0
  let totalFields = 0

  // Extract field-level confidence from OpenAI response
  if (ocrResponse.fieldConfidences) {
    Object.entries(ocrResponse.fieldConfidences).forEach(([field, confidence]) => {
      fieldConfidences[field] = (confidence as number) || 0.5
      totalConfidence += fieldConfidences[field]
      totalFields++
    })
  }

  // Calculate overall confidence
  const overallConfidence =
    totalFields > 0 ? totalConfidence / totalFields : ocrResponse.confidence || 0.85

  // ========================================================================
  // CONFIDENCE THRESHOLDS AND FLAGS
  // ========================================================================

  // Critical: < 70% confidence
  if (overallConfidence < 0.7) {
    flags.push({
      type: 'critical',
      code: 'OCR_CONFIDENCE_VERY_LOW',
      message: `OCR confidence is very low (${Math.round(overallConfidence * 100)}%). Document may be unclear or damaged.`,
      suggestedAction:
        'Request document resubmission. Image quality may be poor (blur, bad lighting, etc)',
      confidence: overallConfidence,
    })
  }

  // Warning: 70-80% confidence
  else if (overallConfidence < 0.8) {
    flags.push({
      type: 'warning',
      code: 'OCR_CONFIDENCE_LOW',
      message: `OCR confidence is below optimal (${Math.round(overallConfidence * 100)}%). Some fields may be inaccurate.`,
      suggestedAction: 'Manual review recommended before approval',
      confidence: overallConfidence,
    })
  }

  // ========================================================================
  // FIELD-LEVEL CONFIDENCE CHECKS
  // ========================================================================

  Object.entries(fieldConfidences).forEach(([field, confidence]) => {
    // Critical fields with low confidence
    const criticalFields = ['rut', 'nombre', 'apellido', 'patente', 'licenseClass']
    if (criticalFields.includes(field) && confidence < 0.75) {
      flags.push({
        type: 'warning',
        code: 'CRITICAL_FIELD_LOW_CONFIDENCE',
        message: `Critical field "${field}" has low confidence (${Math.round(confidence * 100)}%)`,
        suggestedAction: `Verify "${field}" field manually before approval`,
        field,
        confidence,
      })
    }

    // Very low confidence on any field
    if (confidence < 0.6) {
      flags.push({
        type: 'critical',
        code: 'FIELD_CONFIDENCE_VERY_LOW',
        message: `Field "${field}" confidence is very low (${Math.round(confidence * 100)}%)`,
        suggestedAction: `Manual re-entry or document resubmission required for "${field}"`,
        field,
        confidence,
      })
    }
  })

  // ========================================================================
  // DOCUMENT-TYPE SPECIFIC CHECKS
  // ========================================================================

  const documentSpecificFlags = getDocumentSpecificFlags(
    documentType,
    ocrResponse,
    fieldConfidences
  )
  flags.push(...documentSpecificFlags)

  // ========================================================================
  // MISSING FIELDS CHECK
  // ========================================================================

  if (ocrResponse.missingFields && ocrResponse.missingFields.length > 0) {
    const missingCount = ocrResponse.missingFields.length
    flags.push({
      type: missingCount > 2 ? 'critical' : 'warning',
      code: 'MISSING_REQUIRED_FIELDS',
      message: `${missingCount} required field(s) missing: ${ocrResponse.missingFields.join(', ')}`,
      suggestedAction:
        'Request document resubmission with all required information visible',
    })
  }

  // ========================================================================
  // DETERMINE AUTO-ACTION
  // ========================================================================

  const criticalFlagCount = flags.filter((f) => f.type === 'critical').length
  const warningFlagCount = flags.filter((f) => f.type === 'warning').length

  let autoAction: 'auto-approve' | 'manual-review' | 'reject'
  let actionReason = ''

  if (criticalFlagCount > 0) {
    autoAction = 'reject'
    actionReason = `${criticalFlagCount} critical issue(s) detected - reject and request resubmission`
  } else if (warningFlagCount > 0 || overallConfidence < 0.85) {
    autoAction = 'manual-review'
    actionReason = `${warningFlagCount} warning(s) detected or confidence below 85% - manual review required`
  } else {
    autoAction = 'auto-approve'
    actionReason = 'All checks passed - confidence >= 85% and no warnings'
  }

  return {
    overallConfidence: Math.round(overallConfidence * 100),
    fieldConfidences: Object.fromEntries(
      Object.entries(fieldConfidences).map(([k, v]) => [k, Math.round((v as number) * 100)])
    ),
    flags,
    autoAction,
    actionReason,
  }
}

// ============================================================================
// DOCUMENT-SPECIFIC FLAG GENERATION
// ============================================================================

function getDocumentSpecificFlags(
  documentType: string,
  ocrResponse: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  switch (documentType.toUpperCase()) {
    case 'CEDULA-IDENTIDAD':
      flags.push(
        ...validateCedulaFlags(ocrResponse, fieldConfidences)
      )
      break

    case 'LICENCIA-CONDUCIR':
      flags.push(
        ...validateLicenseFlags(ocrResponse, fieldConfidences)
      )
      break

    case 'PERMISO-CIRCULACION':
      flags.push(
        ...validateVehicleFlags(ocrResponse, fieldConfidences)
      )
      break

    case 'RUT-EMPRESA':
      flags.push(
        ...validateRUTEmpresaFlags(ocrResponse, fieldConfidences)
      )
      break

    case 'F30':
    case 'F30-1':
      flags.push(
        ...validateF30Flags(ocrResponse, fieldConfidences)
      )
      break
  }

  return flags
}

function validateCedulaFlags(
  response: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  // Photo quality
  if (response.photoQuality === 'poor' || fieldConfidences['photo']?.['quality'] < 0.7) {
    flags.push({
      type: 'warning',
      code: 'CEDULA_PHOTO_QUALITY_LOW',
      message: 'ID card photo quality is poor',
      suggestedAction: 'Request new photo with better lighting and clarity',
    })
  }

  // Expiration check
  if (response.isExpired) {
    flags.push({
      type: 'critical',
      code: 'CEDULA_EXPIRED',
      message: 'ID card is expired',
      suggestedAction: 'Reject - expired documents not accepted',
    })
  }

  return flags
}

function validateLicenseFlags(
  response: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  // License class confidence
  if (fieldConfidences['licenseClass'] < 0.8) {
    flags.push({
      type: 'warning',
      code: 'LICENSE_CLASS_UNCERTAIN',
      message: 'License class is uncertain from OCR',
      suggestedAction: 'Verify professional license class (A4/A5) with CONASET system',
    })
  }

  // Professional license check
  if (response.licenseClass && !['A4', 'A5', 'D', 'E'].includes(response.licenseClass)) {
    flags.push({
      type: 'warning',
      code: 'LICENSE_NOT_PROFESSIONAL',
      message: `License class ${response.licenseClass} may not be professional (expected A4, A5, D, or E)`,
      suggestedAction: 'Verify that this is a professional transport license',
    })
  }

  // Expiration check
  if (response.daysUntilExpiration !== undefined) {
    if (response.daysUntilExpiration < 0) {
      flags.push({
        type: 'critical',
        code: 'LICENSE_EXPIRED',
        message: 'License is expired',
        suggestedAction: 'Reject - request renewal documentation',
      })
    } else if (response.daysUntilExpiration < 30) {
      flags.push({
        type: 'warning',
        code: 'LICENSE_EXPIRING_SOON',
        message: `License expires in ${response.daysUntilExpiration} days`,
        suggestedAction: 'Alert transporter - renewal recommended',
      })
    }
  }

  return flags
}

function validateVehicleFlags(
  response: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  // License plate confidence
  if (fieldConfidences['licensePlate'] < 0.85) {
    flags.push({
      type: 'warning',
      code: 'PLATE_RECOGNITION_UNCERTAIN',
      message: 'License plate recognition confidence is below optimal',
      suggestedAction: 'Verify plate number manually with photo',
    })
  }

  // Vehicle status
  if (response.vehicleStatus && response.vehicleStatus !== 'vigente') {
    flags.push({
      type: 'warning',
      code: 'VEHICLE_STATUS_UNCLEAR',
      message: `Vehicle status: ${response.vehicleStatus}`,
      suggestedAction: 'Verify vehicle is properly registered with PVVS',
    })
  }

  return flags
}

function validateRUTEmpresaFlags(
  response: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  if (fieldConfidences['rut'] < 0.8) {
    flags.push({
      type: 'warning',
      code: 'RUT_CONFIDENCE_LOW',
      message: 'Business RUT confidence is low',
      suggestedAction: 'Verify RUT with SII database',
    })
  }

  return flags
}

function validateF30Flags(
  response: any,
  fieldConfidences: Record<string, number>
): ConfidenceFlag[] {
  const flags: ConfidenceFlag[] = []

  // These are complex certificates - higher scrutiny
  if (Object.values(fieldConfidences).some((conf: any) => conf < 0.8)) {
    flags.push({
      type: 'warning',
      code: 'F30_COMPLEX_DOCUMENT',
      message: 'F-30 certificate is complex - some fields have low confidence',
      suggestedAction: 'Manual review of certificate content recommended',
    })
  }

  return flags
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get severity color for dashboard display
 */
export function getFlagSeverityColor(type: string): string {
  switch (type) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

/**
 * Get action button label
 */
export function getActionLabel(action: string): string {
  switch (action) {
    case 'auto-approve':
      return 'Auto-Approved ✓'
    case 'manual-review':
      return 'Requires Review ⚠'
    case 'reject':
      return 'Rejected ✗'
    default:
      return 'Pending'
  }
}

/**
 * Format flags for email/report
 */
export function formatFlagsForReport(flags: ConfidenceFlag[]): string {
  if (flags.length === 0) return 'No issues detected'

  return flags
    .map(
      (flag) =>
        `[${flag.type.toUpperCase()}] ${flag.code}\n` +
        `  Message: ${flag.message}\n` +
        `  Action: ${flag.suggestedAction}`
    )
    .join('\n\n')
}

export default {
  generateConfidenceFlags,
  getFlagSeverityColor,
  getActionLabel,
  formatFlagsForReport,
}
