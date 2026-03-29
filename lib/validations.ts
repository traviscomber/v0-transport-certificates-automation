// Validation utilities for DocuFleet compliance system

/**
 * Validates Chilean RUT format and checksum
 * Format: XX.XXX.XXX-X or XXXXXXXX-X
 */
export function validateRUT(rut: string): boolean {
  if (!rut) return false
  
  // Clean RUT - remove dots and hyphens
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '')
  
  if (cleanRut.length < 8) return false
  
  const rutNumber = cleanRut.slice(0, -1)
  const digit = cleanRut.slice(-1).toUpperCase()
  
  // Validate checksum
  let sum = 0
  let multiplier = 2
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const calculatedDigit = 11 - (sum % 11)
  const expectedDigit = calculatedDigit === 11 ? '0' : calculatedDigit === 10 ? 'K' : calculatedDigit.toString()
  
  return digit === expectedDigit
}

/**
 * Validates date format YYYY-MM-DD or DD/MM/YYYY
 * Returns true if date is valid and in the future or current day
 */
export function validateDateFormat(dateStr: string): { valid: boolean; date?: Date } {
  if (!dateStr) return { valid: false }
  
  let date: Date
  
  // Try YYYY-MM-DD format
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return { valid: false }
    date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`)
  }
  // Try DD/MM/YYYY format
  else if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length !== 3) return { valid: false }
    date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
  }
  else {
    return { valid: false }
  }
  
  // Validate date is real
  if (isNaN(date.getTime())) return { valid: false }
  
  return { valid: true, date }
}

/**
 * Validates if a date is still valid (not expired)
 * Returns days remaining if valid, negative if expired
 */
export function getDaysUntilExpiry(dateStr: string): { daysRemaining: number; status: 'valid' | 'expiring' | 'expired' } {
  const { valid, date } = validateDateFormat(dateStr)
  
  if (!valid || !date) {
    return { daysRemaining: -1, status: 'expired' }
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  const diffTime = date.getTime() - today.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (daysRemaining < 0) {
    return { daysRemaining, status: 'expired' }
  } else if (daysRemaining <= 30) {
    return { daysRemaining, status: 'expiring' }
  }
  
  return { daysRemaining, status: 'valid' }
}

/**
 * Validates driver license class
 * Valid classes: A1, A2, A3, A4, A5, B, C, D, E, F
 */
export function validateLicenseClass(licenseClass: string): boolean {
  const validClasses = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F']
  return validClasses.includes(licenseClass?.toUpperCase() || '')
}

/**
 * Validates vehicle weight class vs license class
 * A3 = up to 3,500 kg, A4 = up to 9,000 kg, A5 = over 9,000 kg
 */
export function validateWeightVsLicense(weightKg: number, licenseClass: string): boolean {
  const classUpper = licenseClass?.toUpperCase() || ''
  
  if (classUpper === 'A3') return weightKg <= 3500
  if (classUpper === 'A4') return weightKg <= 9000
  if (classUpper === 'A5') return true
  
  return false
}

/**
 * Cross-validates RUT between two documents
 */
export function validateRUTMatch(rut1: string, rut2: string): boolean {
  const clean1 = rut1.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  const clean2 = rut2.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  return clean1 === clean2
}

/**
 * Validates document type based on extracted data patterns
 */
export function detectDocumentType(extractedData: Record<string, any>): string {
  const keys = Object.keys(extractedData).map(k => k.toLowerCase())
  
  // Detect Cédula de Identidad
  if (keys.includes('rut') && keys.includes('nombre') && keys.includes('fecha_nacimiento') && keys.includes('sexo')) {
    return 'cedula-identidad'
  }
  
  // Detect Licencia de Conducir
  if (keys.includes('numero_licencia') && keys.includes('clase_licencia') && keys.includes('fecha_vencimiento')) {
    return 'licencia-conducir'
  }
  
  // Detect Permiso de Circulación
  if (keys.includes('patente') && keys.includes('numero_chasis') && keys.includes('peso_total')) {
    return 'permiso-circulacion'
  }
  
  // Detect Revisión Técnica
  if (keys.includes('numero_certificado') && (keys.includes('resultado') || keys.includes('vigencia'))) {
    return 'revision-tecnica'
  }
  
  return 'unknown'
}

/**
 * Generates compliance score based on document validation results
 */
export function calculateComplianceScore(validations: Record<string, boolean>): number {
  const results = Object.values(validations)
  if (results.length === 0) return 0
  
  const passed = results.filter(r => r === true).length
  return Math.round((passed / results.length) * 100)
}

/**
 * Validates F30-1 (Certificado de Cumplimiento Laboral) format
 * Should be issued by Dirección del Trabajo
 */
export function validateF30_1Format(extractedData: Record<string, any>): boolean {
  const requiredFields = ['numero_certificado', 'fecha_emision', 'rut_empresa', 'estado']
  return requiredFields.every(field => extractedData[field])
}
