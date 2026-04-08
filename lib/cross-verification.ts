/**
 * Cross-Verification System for Documents
 * Validates RUT consistency across documents and database records
 * Detects discrepancies and flags suspicious patterns
 */

import { validateRUT, formatRUT } from './chilean-validators'

export interface CrossVerificationResult {
  id: string
  type: 'conductor' | 'transportista' | 'vehiculo'
  name: string
  databaseRUT?: string
  documentRUT?: string
  rutMatch: boolean
  discrepancies: Discrepancy[]
  riskLevel: 'critical' | 'warning' | 'ok'
  recommendations: string[]
  lastChecked: Date
}

export interface Discrepancy {
  field: string
  databaseValue: string
  documentValue: string
  severity: 'critical' | 'warning'
  description: string
}

/**
 * Compares RUT from document OCR with database record
 */
export function verifyRUTConsistency(
  databaseRUT: string,
  documentRUT: string,
  context: string = 'document'
): {
  match: boolean
  formatted: { database: string; document: string }
  error?: string
} {
  try {
    // Validate both RUTs
    const dbValidation = validateRUT(databaseRUT)
    const docValidation = validateRUT(documentRUT)

    if (!dbValidation.valid || !docValidation.valid) {
      return {
        match: false,
        formatted: { database: databaseRUT, document: documentRUT },
        error: `Invalid RUT format in ${context}`,
      }
    }

    // Compare formatted versions (removes dots/dashes for comparison)
    const dbClean = dbValidation.formattedRUT?.replace(/\D/g, '') || ''
    const docClean = docValidation.formattedRUT?.replace(/\D/g, '') || ''

    return {
      match: dbClean === docClean,
      formatted: {
        database: dbValidation.formattedRUT || databaseRUT,
        document: docValidation.formattedRUT || documentRUT,
      },
    }
  } catch (error) {
    return {
      match: false,
      formatted: { database: databaseRUT, document: documentRUT },
      error: 'Error comparing RUTs',
    }
  }
}

/**
 * Detects multiple RUT patterns for the same person (fraud indicator)
 */
export function detectRUTAnomalies(
  ruts: Array<{ rut: string; source: string; date: Date }>
): {
  anomalies: Array<{ rut: string; sources: string[]; count: number }>
  isSuspicious: boolean
  confidence: number
} {
  const rutMap = new Map<string, { sources: string[]; dates: Date[] }>()

  for (const item of ruts) {
    try {
      const validation = validateRUT(item.rut)
      if (validation.valid && validation.formattedRUT) {
        const clean = validation.formattedRUT.replace(/\D/g, '')
        if (!rutMap.has(clean)) {
          rutMap.set(clean, { sources: [], dates: [] })
        }
        const entry = rutMap.get(clean)!
        if (!entry.sources.includes(item.source)) {
          entry.sources.push(item.source)
        }
        entry.dates.push(item.date)
      }
    } catch {
      // Skip invalid RUTs
    }
  }

  const anomalies = Array.from(rutMap.entries())
    .filter(([_, data]) => data.sources.length > 1)
    .map(([rut, data]) => ({
      rut,
      sources: data.sources,
      count: data.sources.length,
    }))

  const isSuspicious = anomalies.length > 1
  const confidence = Math.min((anomalies.length / ruts.length) * 100, 100)

  return { anomalies, isSuspicious, confidence }
}

/**
 * Validates conductor data against OCR extracted data
 */
export function verifyConductorData(
  databaseConductor: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  },
  ocrData: {
    nombres?: string
    apellido_paterno?: string
    rut?: string
    fecha_nacimiento?: string
  }
): CrossVerificationResult {
  const discrepancies: Discrepancy[] = []

  // Check RUT
  if (ocrData.rut) {
    const rutCheck = verifyRUTConsistency(databaseConductor.rut, ocrData.rut, 'conductor')
    if (!rutCheck.match) {
      discrepancies.push({
        field: 'RUT',
        databaseValue: databaseConductor.rut,
        documentValue: ocrData.rut,
        severity: 'critical',
        description: 'RUT mismatch between database and document - possible identity fraud',
      })
    }
  }

  // Check name consistency
  const dbName = `${databaseConductor.nombres} ${databaseConductor.apellido_paterno}`.toLowerCase()
  const ocrName = `${ocrData.nombres || ''} ${ocrData.apellido_paterno || ''}`.toLowerCase().trim()

  if (ocrName && ocrName !== dbName) {
    const similarity = calculateStringSimilarity(dbName, ocrName)
    if (similarity < 0.7) {
      discrepancies.push({
        field: 'Nombre Completo',
        databaseValue: `${databaseConductor.nombres} ${databaseConductor.apellido_paterno}`,
        documentValue: `${ocrData.nombres || ''} ${ocrData.apellido_paterno || ''}`,
        severity: 'warning',
        description: 'Name mismatch - may be typo or document issue',
      })
    }
  }

  // Determine risk level
  const hasNominal = discrepancies.some(d => d.severity === 'critical')
  const riskLevel = hasNominal ? 'critical' : discrepancies.length > 0 ? 'warning' : 'ok'

  // Generate recommendations
  const recommendations: string[] = []
  if (discrepancies.some(d => d.field === 'RUT' && d.severity === 'critical')) {
    recommendations.push('URGENT: Verify conductor identity - RUT mismatch detected')
    recommendations.push('Contact conductor to update records')
    recommendations.push('Request new document scan for verification')
  }
  if (discrepancies.some(d => d.field === 'Nombre Completo')) {
    recommendations.push('Request clarification on name variation')
  }
  if (discrepancies.length === 0) {
    recommendations.push('All data verified successfully')
  }

  return {
    id: databaseConductor.id,
    type: 'conductor',
    name: `${databaseConductor.nombres} ${databaseConductor.apellido_paterno}`,
    databaseRUT: databaseConductor.rut,
    documentRUT: ocrData.rut,
    rutMatch: discrepancies.every(d => d.field !== 'RUT'),
    discrepancies,
    riskLevel,
    recommendations,
    lastChecked: new Date(),
  }
}

/**
 * String similarity calculator using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate edit distance between two strings
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

/**
 * Batch verify multiple records
 */
export function batchVerifyRecords(
  records: Array<{
    conductor: { id: string; nombres: string; apellido_paterno: string; rut: string }
    ocrData: { nombres?: string; apellido_paterno?: string; rut?: string; fecha_nacimiento?: string }
  }>
): {
  results: CrossVerificationResult[]
  summary: {
    total: number
    passed: number
    warnings: number
    critical: number
  }
} {
  const results = records.map(r => verifyConductorData(r.conductor, r.ocrData))

  const summary = {
    total: results.length,
    passed: results.filter(r => r.riskLevel === 'ok').length,
    warnings: results.filter(r => r.riskLevel === 'warning').length,
    critical: results.filter(r => r.riskLevel === 'critical').length,
  }

  return { results, summary }
}
