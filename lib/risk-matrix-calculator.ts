export type RiskLevel = 'VERDE' | 'AMARILLO' | 'ROJO'

export interface RiskAssessment {
  riskLevel: RiskLevel
  score: number
  issues: string[]
  description: string
}

export interface ConductorRiskData {
  id: string
  nombres: string
  apellido_paterno: string
  vencimiento_licencia: string | null
  is_active: boolean
}

export interface TransportistaRiskData {
  id: string
  razon_social: string
  is_active: boolean
  vehiculos_count: number
  conductores_count: number
  documentos_vencidos_count: number
}

/**
 * Calcula el nivel de riesgo de un conductor
 * VERDE: Todo ok, licencia vigente
 * AMARILLO: Licencia vence en menos de 30 días
 * ROJO: Licencia vencida o sin documentos críticos
 */
export function calculateConductorRisk(conductor: ConductorRiskData): RiskAssessment {
  const issues: string[] = []
  let score = 0

  // Check 1: ¿Conductor activo?
  if (!conductor.is_active) {
    issues.push('Conductor inactivo')
    score += 50
  }

  // Check 2: Validar licencia
  if (!conductor.vencimiento_licencia) {
    issues.push('Sin fecha de vencimiento de licencia')
    score += 40
  } else {
    const hoyDate = new Date()
    const licenciaDate = new Date(conductor.vencimiento_licencia)
    const diasRestantes = Math.floor((licenciaDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) {
      issues.push(`Licencia vencida hace ${Math.abs(diasRestantes)} días`)
      score += 100
    } else if (diasRestantes < 7) {
      issues.push(`Licencia vence en ${diasRestantes} días`)
      score += 60
    } else if (diasRestantes < 30) {
      issues.push(`Licencia vence en ${diasRestantes} días (próximo mes)`)
      score += 30
    }
  }

  // Determinar nivel de riesgo
  let riskLevel: RiskLevel
  let description: string

  if (score >= 80) {
    riskLevel = 'ROJO'
    description = 'Crítico - No puede operar'
  } else if (score >= 40) {
    riskLevel = 'AMARILLO'
    description = 'Moderado - Requiere atención'
  } else {
    riskLevel = 'VERDE'
    description = 'Cumplido - Operativo'
  }

  return {
    riskLevel,
    score,
    issues,
    description,
  }
}

/**
 * Calcula el nivel de riesgo de un transportista
 * VERDE: Todos los conductores y vehículos completos
 * AMARILLO: Algún documento por vencer
 * ROJO: Documentos vencidos o sin registros completos
 */
export function calculateTransportistaRisk(transportista: TransportistaRiskData): RiskAssessment {
  const issues: string[] = []
  let score = 0

  // Check 1: ¿Transportista activo?
  if (!transportista.is_active) {
    issues.push('Transportista inactivo')
    score += 50
  }

  // Check 2: ¿Tiene conductores registrados?
  if (transportista.conductores_count === 0) {
    issues.push('Sin conductores registrados')
    score += 30
  }

  // Check 3: ¿Tiene vehículos registrados?
  if (transportista.vehiculos_count === 0) {
    issues.push('Sin vehículos registrados')
    score += 30
  }

  // Check 4: ¿Tiene documentos vencidos?
  if (transportista.documentos_vencidos_count > 0) {
    issues.push(`${transportista.documentos_vencidos_count} documento(s) vencido(s)`)
    score += 40
  }

  // Determinar nivel de riesgo
  let riskLevel: RiskLevel
  let description: string

  if (score >= 80) {
    riskLevel = 'ROJO'
    description = 'Crítico - Requiere intervención inmediata'
  } else if (score >= 40) {
    riskLevel = 'AMARILLO'
    description = 'Moderado - Completar registros'
  } else {
    riskLevel = 'VERDE'
    description = 'Operativo - Compliant'
  }

  return {
    riskLevel,
    score,
    issues,
    description,
  }
}

/**
 * Retorna el color del riesgo para UI
 */
export function getRiskColor(riskLevel: RiskLevel): { bg: string; text: string; border: string } {
  switch (riskLevel) {
    case 'VERDE':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
    case 'AMARILLO':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
    case 'ROJO':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  }
}
