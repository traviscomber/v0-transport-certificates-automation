/**
 * Generates a normalized file name following a consistent pattern
 * Format: {DOCTYPE_CODE}_{RUT}_{YYYYMMDD}_{HASH}.{extension}
 * 
 * Example: CEDULA_IDENTIDAD_12345678_20260511_a1b2c3d4.jpg
 */

import { createHash } from 'crypto'

export interface FileNamingOptions {
  documentTypeCode: string // e.g., 'CEDULA_IDENTIDAD', 'LIC_CONDUCIR'
  rut: string // RUT without formatting: '12345678' or '123456789'
  originalFileName: string // Original file name for extension
  timestamp?: Date // Optional timestamp, defaults to now
}

/**
 * Generate a normalized file name
 */
export function generateNormalizedFileName(options: FileNamingOptions): string {
  const {
    documentTypeCode,
    rut,
    originalFileName,
    timestamp = new Date(),
  } = options

  // Extract extension from original file name
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'bin'

  // Generate date part: YYYYMMDD
  const year = timestamp.getFullYear()
  const month = String(timestamp.getMonth() + 1).padStart(2, '0')
  const day = String(timestamp.getDate()).padStart(2, '0')
  const datePart = `${year}${month}${day}`

  // Generate hash from timestamp and random data for uniqueness
  const hashInput = `${timestamp.getTime()}-${Math.random()}`
  const hash = createHash('md5').update(hashInput).digest('hex').substring(0, 8)

  // Extract clean RUT (only digits)
  const cleanRut = rut.replace(/\D/g, '').slice(0, 8) // Take first 8 digits

  // Construct normalized file name
  const normalizedName = `${documentTypeCode}_${cleanRut}_${datePart}_${hash}.${extension}`

  return normalizedName
}

/**
 * Generate full storage path for a conductor document
 * Path format: conductor-documents/{conductorId}/{normalized_filename}
 */
export function generateConductorFilePath(
  conductorId: string,
  documentTypeCode: string,
  rut: string,
  originalFileName: string
): string {
  const normalizedName = generateNormalizedFileName({
    documentTypeCode,
    rut,
    originalFileName,
  })

  return `conductor-documents/${conductorId}/${normalizedName}`
}

/**
 * Generate full storage path for a company document
 * Path format: company-documents/{companyId}/{normalized_filename}
 */
export function generateCompanyFilePath(
  companyId: string,
  documentTypeCode: string,
  reference: string, // e.g., RUT, contractor ID
  originalFileName: string
): string {
  const normalizedName = generateNormalizedFileName({
    documentTypeCode,
    rut: reference,
    originalFileName,
  })

  return `company-documents/${companyId}/${normalizedName}`
}

/**
 * Extract metadata from normalized file name
 */
export interface FileMetadata {
  documentTypeCode: string
  rut: string
  date: Date
  hash: string
  extension: string
}

export function extractFileMetadata(normalizedFileName: string): FileMetadata | null {
  // Pattern: {DOCTYPE}_{RUT}_{YYYYMMDD}_{HASH}.{ext}
  const pattern = /^([A-Z_]+)_(\d+)_(\d{8})_([a-f0-9]{8})\.([a-z]+)$/

  const match = normalizedFileName.match(pattern)
  if (!match) return null

  const [, documentTypeCode, rut, dateStr, hash, extension] = match

  // Parse date
  const year = parseInt(dateStr.substring(0, 4))
  const month = parseInt(dateStr.substring(4, 6))
  const day = parseInt(dateStr.substring(6, 8))
  const date = new Date(year, month - 1, day)

  return {
    documentTypeCode,
    rut,
    date,
    hash,
    extension,
  }
}
