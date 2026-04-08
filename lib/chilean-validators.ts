/**
 * Chilean Document Validators Library
 * Comprehensive validation for Chilean-specific documents and identifiers
 * Supports: RUT, ID Numbers, License Plates, License Classes, Dates
 */

// ============================================================================
// RUT VALIDATION
// ============================================================================

/**
 * Validates Chilean RUT (Rol Único Tributario)
 * Format: XX.XXX.XXX-X or XXXXXXXX-X (min 8, max 9 digits + verifier)
 * Example: 12.345.678-9 or 12345678-9
 */
export function validateRUT(rut: string): {
  valid: boolean
  formattedRUT?: string
  error?: string
} {
  if (!rut) return { valid: false, error: 'RUT is required' }

  // Remove dots and normalize
  let cleanRUT = rut.replace(/\./g, '').toUpperCase().trim()

  // Must have hyphen
  if (!cleanRUT.includes('-')) {
    return { valid: false, error: 'RUT must contain hyphen (e.g., 12345678-9)' }
  }

  const [numberPart, verifier] = cleanRUT.split('-')

  // Validate length
  if (numberPart.length < 7 || numberPart.length > 8) {
    return { valid: false, error: 'RUT must have 7-8 digits' }
  }

  // Only digits in number part
  if (!/^\d+$/.test(numberPart)) {
    return { valid: false, error: 'RUT numbers must be digits only' }
  }

  // Validate check digit
  const calculatedVerifier = calculateRUTVerifier(numberPart)
  if (verifier !== calculatedVerifier) {
    return { valid: false, error: 'Invalid RUT verifier digit' }
  }

  // Format properly
  const formattedRUT = formatRUT(numberPart + verifier)

  return { valid: true, formattedRUT }
}

/**
 * Calculate RUT verifier digit using modulo 11
 */
function calculateRUTVerifier(rut: string): string {
  let multiplier = 2
  let sum = 0

  for (let i = rut.length - 1; i >= 0; i--) {
    sum += parseInt(rut[i]) * multiplier
    multiplier += 1
    if (multiplier > 7) multiplier = 2
  }

  const remainder = sum % 11
  const verifier = 11 - remainder

  if (verifier === 11) return '0'
  if (verifier === 10) return 'K'
  return verifier.toString()
}

/**
 * Format RUT to XX.XXX.XXX-X format
 */
export function formatRUT(rut: string): string {
  const clean = rut.replace(/\D/g, '')
  if (clean.length < 8) return rut

  const sections = [clean.slice(0, -4), clean.slice(-4, -1), clean.slice(-1)]
  return sections.join('.').replace(/\.(\d)$/, '-$1')
}

// ============================================================================
// LICENSE PLATE VALIDATION
// ============================================================================

/**
 * Validates Chilean license plates
 * Old format: XX-XX-XX (2 letters, 4 numbers, 2 letters)
 * New format: XXXX-XX (4 letters, 2 numbers) - Since 2020
 */
export function validateLicensePlate(plate: string): {
  valid: boolean
  format?: 'old' | 'new'
  error?: string
} {
  if (!plate) return { valid: false, error: 'License plate is required' }

  const clean = plate.replace(/\s/g, '').toUpperCase()

  // New format (4 letters + 2 numbers): YYYY-XX or YYYYXX
  const newFormatRegex = /^[A-Z]{4}\-?\d{2}$/
  if (newFormatRegex.test(clean)) {
    return { valid: true, format: 'new' }
  }

  // Old format (2 letters + 4 numbers + 2 letters): YY-XXXX-YY
  const oldFormatRegex = /^[A-Z]{2}-\d{4}-[A-Z]{2}$|^[A-Z]{2}\d{4}[A-Z]{2}$/
  if (oldFormatRegex.test(clean.replace(/\-/g, ''))) {
    return { valid: true, format: 'old' }
  }

  return { valid: false, error: 'Invalid license plate format' }
}

/**
 * Format license plate to standard format
 */
export function formatLicensePlate(plate: string): string {
  const clean = plate.replace(/\s/g, '').toUpperCase()

  if (/^[A-Z]{4}\d{2}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`
  }

  if (/^[A-Z]{2}\d{4}[A-Z]{2}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`
  }

  return plate
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Validates Chilean date format (DD/MM/YYYY or DD-MM-YYYY)
 * Also validates date logic (not future dates, realistic dates)
 */
export function validateChileanDate(dateStr: string): {
  valid: boolean
  date?: Date
  error?: string
} {
  if (!dateStr) return { valid: false, error: 'Date is required' }

  // Accept DD/MM/YYYY or DD-MM-YYYY
  const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  const match = dateStr.match(dateRegex)

  if (!match) {
    return { valid: false, error: 'Date must be DD/MM/YYYY format' }
  }

  const [, day, month, year] = match
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)

  // Validate month range
  if (monthNum < 1 || monthNum > 12) {
    return { valid: false, error: 'Month must be between 01 and 12' }
  }

  // Validate day range
  if (dayNum < 1 || dayNum > 31) {
    return { valid: false, error: 'Day must be between 01 and 31' }
  }

  // Create date
  const date = new Date(yearNum, monthNum - 1, dayNum)

  // Validate date logic
  if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1) {
    return { valid: false, error: 'Invalid date (e.g., Feb 30)' }
  }

  // No future dates (except for 2 years ahead for licenses)
  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2)

  if (date > maxFutureDate) {
    return { valid: false, error: 'Date cannot be more than 2 years in future' }
  }

  return { valid: true, date }
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatChileanDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Check if date is expired
 */
export function isDateExpired(dateStr: string): boolean {
  const validation = validateChileanDate(dateStr)
  if (!validation.valid || !validation.date) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return validation.date < today
}

/**
 * Days until expiration
 */
export function daysUntilExpiration(dateStr: string): number | null {
  const validation = validateChileanDate(dateStr)
  if (!validation.valid || !validation.date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = validation.date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// ============================================================================
// DRIVER LICENSE VALIDATION
// ============================================================================

/**
 * Valid Chilean driver license classes for professional drivers
 */
export const VALID_LICENSE_CLASSES = {
  'A1': 'Motocicleta hasta 125cc',
  'A2': 'Motocicleta hasta 35kW',
  'A': 'Motocicleta sin limitaciones',
  'B': 'Vehículos privados',
  'B1': 'Triciclos motorizados',
  'C': 'Camiones hasta 4,600kg',
  'C1': 'Camiones hasta 7,500kg',
  'D': 'Autobuses',
  'D1': 'Autobuses menores',
  'E': 'Combinaciones de vehículos',
  'F': 'Tractores agrícolas',
  'G': 'Maquinaria especial',
  'H': 'Vehículos articulados',
  'A4': 'Licencia Profesional Transporte Pasajeros',
  'A5': 'Licencia Profesional Transporte Carga',
}

/**
 * Validates driver license class (professional licenses)
 */
export function validateLicenseClass(licenseClass: string): {
  valid: boolean
  description?: string
  error?: string
} {
  if (!licenseClass) return { valid: false, error: 'License class is required' }

  const clean = licenseClass.toUpperCase().trim()

  if (clean in VALID_LICENSE_CLASSES) {
    return {
      valid: true,
      description: VALID_LICENSE_CLASSES[clean as keyof typeof VALID_LICENSE_CLASSES],
    }
  }

  return { valid: false, error: `Invalid license class: ${licenseClass}` }
}

/**
 * Check if license is professional (A4, A5, D, E classes)
 */
export function isProfessionalLicense(licenseClass: string): boolean {
  const professional = ['A4', 'A5', 'D', 'D1', 'E', 'C1']
  return professional.includes(licenseClass.toUpperCase())
}

// ============================================================================
// ID CARD VALIDATION
// ============================================================================

/**
 * Validates Chilean ID card number format
 */
export function validateIDNumber(idNumber: string): {
  valid: boolean
  formattedID?: string
  error?: string
} {
  if (!idNumber) return { valid: false, error: 'ID number is required' }

  // ID numbers are similar to RUT but sometimes without verifier
  const clean = idNumber.replace(/\D/g, '')

  if (clean.length < 6 || clean.length > 9) {
    return { valid: false, error: 'ID number must be 6-9 digits' }
  }

  return { valid: true, formattedID: clean }
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

/**
 * Multi-layer validation for document data
 */
export async function validateDocumentData(data: {
  rut?: string
  licenseClass?: string
  licensePlate?: string
  expirationDate?: string
  idNumber?: string
}): Promise<{
  valid: boolean
  validations: Record<string, any>
  score: number // 0-100 confidence
}> {
  const validations: Record<string, any> = {}
  let validCount = 0
  let totalChecks = 0

  // Validate RUT
  if (data.rut) {
    totalChecks++
    const rutResult = validateRUT(data.rut)
    validations.rut = rutResult
    if (rutResult.valid) validCount++
  }

  // Validate License Class
  if (data.licenseClass) {
    totalChecks++
    const licenseResult = validateLicenseClass(data.licenseClass)
    validations.licenseClass = licenseResult
    if (licenseResult.valid) validCount++
  }

  // Validate License Plate
  if (data.licensePlate) {
    totalChecks++
    const plateResult = validateLicensePlate(data.licensePlate)
    validations.licensePlate = plateResult
    if (plateResult.valid) validCount++
  }

  // Validate Expiration Date
  if (data.expirationDate) {
    totalChecks++
    const dateResult = validateChileanDate(data.expirationDate)
    const isExpired = isDateExpired(data.expirationDate)
    validations.expirationDate = { ...dateResult, isExpired }
    if (dateResult.valid && !isExpired) validCount++
  }

  // Validate ID Number
  if (data.idNumber) {
    totalChecks++
    const idResult = validateIDNumber(data.idNumber)
    validations.idNumber = idResult
    if (idResult.valid) validCount++
  }

  const score = totalChecks > 0 ? Math.round((validCount / totalChecks) * 100) : 0

  return {
    valid: validCount === totalChecks,
    validations,
    score,
  }
}

// ============================================================================
// PUBLIC API INTEGRATION HELPERS
// ============================================================================

/**
 * Prepare data for cross-reference validation
 */
export function prepareCrossReferenceData(data: Record<string, any>) {
  return {
    rut: data.rut ? formatRUT(data.rut.replace(/\D/g, '')) : null,
    licensePlate: data.licensePlate ? formatLicensePlate(data.licensePlate) : null,
    expirationDate: data.expirationDate,
    licenseClass: data.licenseClass?.toUpperCase(),
  }
}

export default {
  validateRUT,
  formatRUT,
  validateLicensePlate,
  formatLicensePlate,
  validateChileanDate,
  formatChileanDate,
  isDateExpired,
  daysUntilExpiration,
  validateLicenseClass,
  isProfessionalLicense,
  validateIDNumber,
  validateDocumentData,
  prepareCrossReferenceData,
}
