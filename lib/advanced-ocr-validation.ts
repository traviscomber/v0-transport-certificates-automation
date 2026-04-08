import { CHILEAN_DOCUMENTS_REFERENCE } from '@/lib/chilean-documents-reference'

export interface OcrValidationResult {
  document_type: string
  confidence: number
  extracted_data: Record<string, string | null>
  validation_errors: string[]
  warnings: string[]
  is_valid: boolean
  score: number
}

export interface RutValidation {
  rut: string
  is_valid: boolean
  formatted_rut: string
  message: string
}

/**
 * Valida formato de RUT chileno
 */
export function validateRut(rut: string): RutValidation {
  if (!rut) {
    return {
      rut,
      is_valid: false,
      formatted_rut: '',
      message: 'RUT no proporcionado',
    }
  }

  // Limpiar espacios y guiones
  const cleanRut = rut.replace(/[\s.-]/g, '')

  // Validar que sea numérico + K
  if (!/^\d{7,8}[0-9K]$/.test(cleanRut)) {
    return {
      rut,
      is_valid: false,
      formatted_rut: '',
      message: 'Formato de RUT inválido',
    }
  }

  // Calcular dígito verificador
  const rutNumbers = cleanRut.slice(0, -1)
  const verifier = cleanRut.slice(-1).toUpperCase()

  let sum = 0
  let multiplier = 2

  for (let i = rutNumbers.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumbers[i]) * multiplier
    multiplier++
    if (multiplier > 7) multiplier = 2
  }

  const expectedVerifier = 11 - (sum % 11)
  let expectedChar = expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'K' : expectedVerifier.toString()

  const isValid = verifier === expectedChar

  const formattedRut = `${rutNumbers.slice(0, -3)}.${rutNumbers.slice(-3)}-${verifier}`

  return {
    rut,
    is_valid: isValid,
    formatted_rut: formattedRut,
    message: isValid ? 'RUT válido' : 'Dígito verificador inválido',
  }
}

/**
 * Valida OCR extraído vs datos de referencia
 */
export function validateOcrData(
  document_type: string,
  extracted_data: Record<string, string | null>
): OcrValidationResult {
  const docReference = CHILEAN_DOCUMENTS_REFERENCE[document_type]

  if (!docReference) {
    return {
      document_type,
      confidence: 0,
      extracted_data,
      validation_errors: [`Tipo de documento desconocido: ${document_type}`],
      warnings: [],
      is_valid: false,
      score: 0,
    }
  }

  const errors: string[] = []
  const warnings: string[] = []
  let score = 100

  // Validar campos requeridos
  docReference.required_fields.forEach((field) => {
    if (!extracted_data[field] || extracted_data[field]?.trim() === '') {
      errors.push(`Campo requerido faltante: ${field}`)
      score -= 20
    }
  })

  // Validar RUT si está presente
  if (extracted_data.rut) {
    const rutValidation = validateRut(extracted_data.rut)
    if (!rutValidation.is_valid) {
      errors.push(`RUT inválido: ${rutValidation.message}`)
      score -= 15
    }
  }

  // Validar fechas
  if (extracted_data.vencimiento) {
    if (!isValidDate(extracted_data.vencimiento)) {
      errors.push('Fecha de vencimiento inválida')
      score -= 10
    } else {
      const expirationDate = new Date(extracted_data.vencimiento)
      const today = new Date()
      if (expirationDate < today) {
        errors.push('Documento vencido')
        score -= 25
      }
    }
  }

  // Validaciones de patrón
  docReference.patterns.forEach(({ field, pattern, message }) => {
    if (extracted_data[field] && !new RegExp(pattern).test(extracted_data[field])) {
      warnings.push(`${field}: ${message}`)
      score -= 5
    }
  })

  const is_valid = errors.length === 0 && score >= 60

  return {
    document_type,
    confidence: Math.max(0, Math.min(100, score)),
    extracted_data,
    validation_errors: errors,
    warnings,
    is_valid,
    score: Math.max(0, Math.min(100, score)),
  }
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(dateString: string): boolean {
  // Acepta formatos: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
  const patterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
  ]

  if (!patterns.some((p) => p.test(dateString))) {
    return false
  }

  const dateParts = dateString.replace(/\//g, '-').split('-')
  let day, month, year

  if (dateString.includes('/')) {
    // DD/MM/YYYY
    day = parseInt(dateParts[0])
    month = parseInt(dateParts[1])
    year = parseInt(dateParts[2])
  } else if (dateString.startsWith('20') || dateString.startsWith('19')) {
    // YYYY-MM-DD
    year = parseInt(dateParts[0])
    month = parseInt(dateParts[1])
    day = parseInt(dateParts[2])
  } else {
    // DD-MM-YYYY
    day = parseInt(dateParts[0])
    month = parseInt(dateParts[1])
    year = parseInt(dateParts[2])
  }

  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

/**
 * Compara similitud entre dos strings (algoritmo Levenshtein)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 100

  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 100

  const dist = levenshteinDistance(s1, s2)
  return Math.round(((maxLen - dist) / maxLen) * 100)
}

/**
 * Calcula distancia de Levenshtein
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

/**
 * Detecta si un documento fue modificado comparando fields
 */
export function detectDocumentTampering(
  extracted_data: Record<string, string | null>,
  stored_data: Record<string, string | null>
): { is_tampered: boolean; discrepancies: string[] } {
  const discrepancies: string[] = []
  const criticalFields = ['rut', 'nombres', 'apellido_paterno', 'patente']

  criticalFields.forEach((field) => {
    if (extracted_data[field] && stored_data[field]) {
      const similarity = stringSimilarity(
        extracted_data[field] || '',
        stored_data[field] || ''
      )
      if (similarity < 85) {
        discrepancies.push(
          `${field}: "${extracted_data[field]}" vs "${stored_data[field]}" (similitud: ${similarity}%)`
        )
      }
    }
  })

  return {
    is_tampered: discrepancies.length > 2,
    discrepancies,
  }
}
