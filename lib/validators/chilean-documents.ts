/**
 * Validadores para documentos chilenos
 * Incluye: RUT, patentes, fechas, formatos
 */

/**
 * Valida RUT chileno usando dígito verificador
 * RUT formato: XX.XXX.XXX-K (donde K es dígito verificador 0-9 o K)
 */
export function validateChileanRUT(rut: string): {
  valid: boolean
  cleanRUT?: string
  error?: string
} {
  // Limpiar formato
  const cleaned = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase()

  if (!cleaned || cleaned.length < 8 || cleaned.length > 9) {
    return { valid: false, error: "RUT debe tener 8 o 9 caracteres" }
  }

  const numbers = cleaned.slice(0, -1)
  const verifier = cleaned.slice(-1)

  // Validar que los primeros 8 caracteres sean números
  if (!/^\d{8}$/.test(numbers)) {
    return { valid: false, error: "RUT debe contener solo números" }
  }

  // Calcular dígito verificador
  const calculated = calculateVerifier(numbers)

  if (calculated.toUpperCase() !== verifier) {
    return {
      valid: false,
      error: `Dígito verificador inválido. Esperado: ${calculated}, Recibido: ${verifier}`,
    }
  }

  return { valid: true, cleanRUT: numbers + "-" + verifier }
}

/**
 * Calcula el dígito verificador de un RUT chileno
 * Algoritmo: módulo 11
 */
export function calculateVerifier(rutNumber: string): string {
  const digits = rutNumber.split("").reverse()
  const multipliers = [2, 3, 4, 5, 6, 7]
  let sum = 0

  for (let i = 0; i < digits.length; i++) {
    const multiplier = multipliers[i % multipliers.length]
    sum += parseInt(digits[i]) * multiplier
  }

  const remainder = sum % 11
  const verifier = 11 - remainder

  if (verifier === 11) return "0"
  if (verifier === 10) return "K"
  return verifier.toString()
}

/**
 * Valida patente de vehículo chilena
 * Formatos:
 * - Antiguo: AA-##-BB (2 letras, 2 números, 2 letras)
 * - Nuevo: AABB-##-#### (4 letras, 2 números, 4 dígitos)
 * - SOAP (internacional): AABB-#### (4 letras, 4 números)
 */
export function validateChileanLicensePlate(plate: string): {
  valid: boolean
  format?: string
  cleanPlate?: string
  error?: string
} {
  const cleaned = plate.toUpperCase().replace(/[-]/g, "").trim()

  // Formato antiguo: AABB##BB (8 caracteres)
  if (cleaned.length === 8) {
    if (/^[A-Z]{2}\d{2}[A-Z]{2}$/.test(cleaned)) {
      return {
        valid: true,
        format: "antiguo",
        cleanPlate: `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`,
      }
    }
  }

  // Formato nuevo: AABB##CCCC (10 caracteres)
  if (cleaned.length === 10) {
    if (/^[A-Z]{4}\d{2}\d{4}$/.test(cleaned)) {
      return {
        valid: true,
        format: "nuevo",
        cleanPlate: `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 10)}`,
      }
    }
  }

  // Formato SOAP: AABB#### (8 caracteres)
  if (cleaned.length === 8) {
    if (/^[A-Z]{4}\d{4}$/.test(cleaned)) {
      return {
        valid: true,
        format: "soap",
        cleanPlate: `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`,
      }
    }
  }

  return { valid: false, error: "Formato de patente no válido" }
}

/**
 * Valida que una fecha de vencimiento no esté pasada
 */
export function validateExpirationDate(dateStr: string): {
  valid: boolean
  daysUntilExpiration?: number
  isExpired?: boolean
  error?: string
} {
  try {
    const date = new Date(dateStr)

    if (isNaN(date.getTime())) {
      return { valid: false, error: "Formato de fecha inválido" }
    }

    // Agregar un día para comparación (fecha de expiración es al final del día)
    const expirationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    const today = new Date()

    const isExpired = today > expirationDate
    const diffTime = expirationDate.getTime() - today.getTime()
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (isExpired) {
      return {
        valid: false,
        isExpired: true,
        daysUntilExpiration: daysUntilExpiration,
        error: `Documento expirado hace ${Math.abs(daysUntilExpiration)} días`,
      }
    }

    // Advertencia si vence en menos de 30 días
    if (daysUntilExpiration < 30) {
      return {
        valid: true,
        daysUntilExpiration: daysUntilExpiration,
        isExpired: false,
        error: `Documento expira en ${daysUntilExpiration} días (próximo a vencer)`,
      }
    }

    return {
      valid: true,
      daysUntilExpiration: daysUntilExpiration,
      isExpired: false,
    }
  } catch (error) {
    return { valid: false, error: "Error al validar fecha" }
  }
}

/**
 * Valida clases de licencia de conducir chilenas
 */
export const VALID_LICENSE_CLASSES = {
  A1: "Motocicletas",
  A2: "Motocicletas",
  A: "Motocicletas",
  B: "Automóviles",
  B1: "Automóviles pequeños",
  C: "Camionetas, camiones",
  D: "Transporte de pasajeros",
  E: "Transporte de pasajeros (buses)",
  F: "Remolques",
  G: "Maquinaria agrícola",
}

export function validateLicenseClass(
  licenseClass: string
): {
  valid: boolean
  className?: string
  error?: string
} {
  const cleaned = licenseClass.toUpperCase().trim()

  if (VALID_LICENSE_CLASSES[cleaned as keyof typeof VALID_LICENSE_CLASSES]) {
    return {
      valid: true,
      className: VALID_LICENSE_CLASSES[cleaned as keyof typeof VALID_LICENSE_CLASSES],
    }
  }

  return {
    valid: false,
    error: `Clase de licencia "${cleaned}" no válida. Válidas: ${Object.keys(VALID_LICENSE_CLASSES).join(", ")}`,
  }
}

/**
 * Detecta anomalías comunes en documentos de transporte
 */
export function detectCommonAnomalies(extractedData: Record<string, any>): string[] {
  const anomalies: string[] = []

  // RUT inválido
  if (extractedData.rut) {
    const rutValidation = validateChileanRUT(extractedData.rut)
    if (!rutValidation.valid) {
      anomalies.push(`RUT inválido: ${rutValidation.error}`)
    }
  }

  // Patente inválida
  if (extractedData.patente || extractedData.license_plate) {
    const plate = extractedData.patente || extractedData.license_plate
    const plateValidation = validateChileanLicensePlate(plate)
    if (!plateValidation.valid) {
      anomalies.push(`Patente inválida: ${plateValidation.error}`)
    }
  }

  // Fecha de vencimiento pasada
  if (extractedData.fecha_vencimiento || extractedData.expiration_date) {
    const date = extractedData.fecha_vencimiento || extractedData.expiration_date
    const dateValidation = validateExpirationDate(date)
    if (!dateValidation.valid) {
      anomalies.push(`Documento expirado: ${dateValidation.error}`)
    } else if (dateValidation.daysUntilExpiration !== undefined && dateValidation.daysUntilExpiration < 30) {
      anomalies.push(`Próximo a vencer: ${dateValidation.error}`)
    }
  }

  // Licencia sin clases válidas
  if (extractedData.license_class || extractedData.clases) {
    const classes = Array.isArray(extractedData.license_class || extractedData.clases)
      ? (extractedData.license_class || extractedData.clases)
      : [extractedData.license_class || extractedData.clases]

    for (const cls of classes) {
      const classValidation = validateLicenseClass(cls)
      if (!classValidation.valid) {
        anomalies.push(`Clase de licencia inválida: ${cls}`)
      }
    }
  }

  // Documento muy antiguo (más de 10 años)
  if (extractedData.fecha_emision || extractedData.issue_date) {
    const issueDate = new Date(extractedData.fecha_emision || extractedData.issue_date)
    const today = new Date()
    const yearsOld = (today.getFullYear() - issueDate.getFullYear())
    if (yearsOld > 10) {
      anomalies.push(`Documento muy antiguo (${yearsOld} años)`)
    }
  }

  return anomalies
}

/**
 * Calcula confidence score basado en anomalías
 */
export function calculateConfidenceScore(anomalies: string[], documentQuality: "high" | "medium" | "low" = "high"): {
  score: number
  level: "alta" | "media" | "baja"
} {
  let score = 100

  // Restar por cada anomalía
  const criticalAnomalies = anomalies.filter((a) => a.includes("inválido") || a.includes("expirado"))
  const warningAnomalies = anomalies.filter((a) => a.includes("próximo") || a.includes("antiguo"))

  score -= criticalAnomalies.length * 20
  score -= warningAnomalies.length * 5

  // Restar por calidad de documento
  if (documentQuality === "medium") score -= 10
  if (documentQuality === "low") score -= 25

  score = Math.max(0, Math.min(100, score))

  let level: "alta" | "media" | "baja" = "alta"
  if (score < 70) level = "baja"
  else if (score < 85) level = "media"

  return { score, level }
}
