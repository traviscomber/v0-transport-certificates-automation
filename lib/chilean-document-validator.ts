export interface ChileanDocumentValidation {
  documentType: string
  isValid: boolean
  confidence: number
  extractedData: Record<string, any>
  errors: string[]
}

// Validar formato RUT chileno (XX.XXX.XXX-K)
export function validateChileanRUT(rut: string): boolean {
  const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/
  if (!rutRegex.test(rut)) return false
  
  const parts = rut.replace(/\./g, '').split('-')
  const number = parts[0]
  const checkDigit = parts[1]
  
  let sum = 0
  let multiplier = 2
  
  for (let i = number.length - 1; i >= 0; i--) {
    sum += parseInt(number[i]) * multiplier
    multiplier = multiplier === 9 ? 2 : multiplier + 1
  }
  
  const expectedDigit = (11 - (sum % 11)) === 11 ? '0' : (11 - (sum % 11)) === 10 ? 'K' : String(11 - (sum % 11))
  return checkDigit === expectedDigit
}

// Detectar tipo de documento chileno basado en palabras clave
export function detectChileanDocumentType(text: string): string {
  const upperText = text.toUpperCase()
  
  if (upperText.includes('CÉDULA') || upperText.includes('CARNET')) return 'cedula-identidad'
  if (upperText.includes('LICENCIA') && upperText.includes('CONDUCIR')) return 'licencia-conducir'
  if (upperText.includes('CLASE B')) return 'licencia-b'
  if (upperText.includes('CLASE D')) return 'licencia-d'
  if (upperText.includes('CLASE E')) return 'licencia-e'
  if (upperText.includes('RTV') || upperText.includes('REVISIÓN TÉCNICA')) return 'rtv'
  if (upperText.includes('CERTIFICADO') && upperText.includes('RUT')) return 'certificado-rut'
  if (upperText.includes('TARJETA') && upperText.includes('CIRCULACIÓN')) return 'tarjeta-circulacion'
  if (upperText.includes('RESPONSABILIDAD CIVIL') || upperText.includes('SEGURO')) return 'seguro-rc'
  
  return 'unknown'
}

// Validar elementos específicos de cédula de identidad
export function validateCarnetIdentidad(text: string): ChileanDocumentValidation {
  const errors: string[] = []
  const extractedData: Record<string, any> = {}
  
  // Buscar RUT
  const rutMatch = text.match(/\d{1,2}\.\d{3}\.\d{3}-[0-9K]/i)
  if (rutMatch) {
    extractedData.rut = rutMatch[0]
    if (!validateChileanRUT(rutMatch[0])) {
      errors.push('RUT no válido')
    }
  } else {
    errors.push('RUT no encontrado')
  }
  
  // Buscar nombre
  const nameMatch = text.match(/(?:NOMBRES?:|NOMBRE COMPLETO:?\s+)([A-ZÁÉÍÓÚ\s]+)/i)
  if (nameMatch) {
    extractedData.nombre = nameMatch[1].trim()
  } else {
    errors.push('Nombre no encontrado')
  }
  
  // Verificar elementos de seguridad mencionados
  const securityElements = ['COPIHUE', 'HUEMUL', 'CÓNDOR', 'ANDES', 'QR', 'CHIP']
  extractedData.securityElementsFound = securityElements.filter(el => text.toUpperCase().includes(el))
  
  return {
    documentType: 'cedula-identidad',
    isValid: errors.length === 0,
    confidence: errors.length === 0 ? 0.95 : 0.5,
    extractedData,
    errors
  }
}

// Validar licencia de conducir
export function validateLicenciaConducir(text: string): ChileanDocumentValidation {
  const errors: string[] = []
  const extractedData: Record<string, any> = {}
  
  // RUT/Número de licencia
  const rutMatch = text.match(/\d{1,2}\.\d{3}\.\d{3}-[0-9K]/i)
  if (rutMatch) {
    extractedData.numeroLicencia = rutMatch[0]
    if (!validateChileanRUT(rutMatch[0])) {
      errors.push('Número de licencia no válido')
    }
  } else {
    errors.push('Número de licencia no encontrado')
  }
  
  // Clase de licencia
  const claseMatch = text.match(/CLASE\s+([A-E])/i)
  if (claseMatch) {
    extractedData.clase = claseMatch[1]
  } else {
    errors.push('Clase de licencia no encontrada')
  }
  
  // Fecha de vencimiento
  const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g)
  if (dateMatch && dateMatch.length > 0) {
    extractedData.fechaVencimiento = dateMatch[dateMatch.length - 1]
  } else {
    errors.push('Fecha de vencimiento no encontrada')
  }
  
  return {
    documentType: 'licencia-conducir',
    isValid: errors.length === 0,
    confidence: errors.length === 0 ? 0.92 : 0.5,
    extractedData,
    errors
  }
}

// Validar RUT
export function validateCertificadoRUT(text: string): ChileanDocumentValidation {
  const errors: string[] = []
  const extractedData: Record<string, any> = {}
  
  const rutMatch = text.match(/\d{1,2}\.\d{3}\.\d{3}-[0-9K]/i)
  if (rutMatch) {
    extractedData.rut = rutMatch[0]
    if (!validateChileanRUT(rutMatch[0])) {
      errors.push('RUT inválido')
    }
  } else {
    errors.push('RUT no encontrado')
  }
  
  // Estado tributario
  if (text.toUpperCase().includes('ACTIVO')) {
    extractedData.estadoTributario = 'ACTIVO'
  } else if (text.toUpperCase().includes('INACTIVO')) {
    extractedData.estadoTributario = 'INACTIVO'
  } else {
    errors.push('Estado tributario no encontrado')
  }
  
  // SII logo/marca
  if (!text.toUpperCase().includes('SII')) {
    errors.push('No se detectó marca SII')
  }
  
  return {
    documentType: 'certificado-rut',
    isValid: errors.length === 0,
    confidence: errors.length === 0 ? 0.90 : 0.5,
    extractedData,
    errors
  }
}

// Validar documento genérico chileno
export function validateChileanDocument(text: string): ChileanDocumentValidation {
  const documentType = detectChileanDocumentType(text)
  
  switch (documentType) {
    case 'cedula-identidad':
      return validateCarnetIdentidad(text)
    case 'licencia-conducir':
    case 'licencia-b':
    case 'licencia-d':
    case 'licencia-e':
      return validateLicenciaConducir(text)
    case 'certificado-rut':
      return validateCertificadoRUT(text)
    default:
      return {
        documentType: 'unknown',
        isValid: false,
        confidence: 0,
        extractedData: { text: text.substring(0, 100) },
        errors: ['No se pudo identificar el tipo de documento']
      }
  }
}
