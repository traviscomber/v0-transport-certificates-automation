// Helper function to replace date-fns
function differenceInDays(date1: Date, date2: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  return Math.floor((date1.getTime() - date2.getTime()) / MS_PER_DAY)
}

export interface ContractorQualificationChecklist {
  hasValidRUT: boolean
  hasConductors: boolean
  hasVehicles: boolean
  allConductorsActive: boolean
  allConductorsLicenseValid: boolean
  allVehiclesCirculationValid: boolean
  allVehiclesMaintenanceValid: boolean
  hasRequiredDocuments: boolean
  noOutstandingIssues: boolean
}

export interface ContractorQualificationResult {
  contractorId: string
  contractorName: string
  status: 'green' | 'yellow' | 'red'
  score: number
  maxScore: number
  percentage: number
  checklist: ContractorQualificationChecklist
  failedRequirements: string[]
  recommendations: string[]
  canOperate: boolean
  lastUpdated: Date
}

export function calculateContractorQualification(
  contractorId: string,
  contractorName: string,
  data: {
    rut?: string
    conductores?: any[]
    vehiculos?: any[]
    documentos?: any[]
    outstandingIssues?: number
  }
): ContractorQualificationResult {
  const checklist: ContractorQualificationChecklist = {
    hasValidRUT: !!data.rut && data.rut.length > 0,
    hasConductors: (data.conductores?.length || 0) > 0,
    hasVehicles: (data.vehiculos?.length || 0) > 0,
    allConductorsActive: (data.conductores || []).every(c => c.is_active === true),
    allConductorsLicenseValid: (data.conductores || []).every(c => {
      if (!c.vencimiento_licencia) return false
      return differenceInDays(new Date(c.vencimiento_licencia), new Date()) > 0
    }),
    allVehiclesCirculationValid: (data.vehiculos || []).every(v => {
      if (!v.vencimiento_permiso_circulacion) return false
      return differenceInDays(new Date(v.vencimiento_permiso_circulacion), new Date()) > 0
    }),
    allVehiclesMaintenanceValid: (data.vehiculos || []).every(v => {
      if (!v.vencimiento_revision_tecnica) return false
      return differenceInDays(new Date(v.vencimiento_revision_tecnica), new Date()) > 0
    }),
    hasRequiredDocuments: (data.documentos?.length || 0) >= 3,
    noOutstandingIssues: (data.outstandingIssues || 0) === 0,
  }

  // Calcular score
  const checklistValues = Object.values(checklist)
  const score = checklistValues.filter(v => v === true).length
  const maxScore = checklistValues.length
  const percentage = Math.round((score / maxScore) * 100)

  // Determinar status
  let status: 'green' | 'yellow' | 'red' = 'red'
  if (percentage >= 90) status = 'green'
  else if (percentage >= 70) status = 'yellow'

  // Identificar requisitos fallidos
  const failedRequirements: string[] = []
  if (!checklist.hasValidRUT) failedRequirements.push('RUT no válido o no registrado')
  if (!checklist.hasConductors) failedRequirements.push('Sin conductores registrados')
  if (!checklist.hasVehicles) failedRequirements.push('Sin vehículos registrados')
  if (!checklist.allConductorsActive) failedRequirements.push('Algunos conductores están inactivos')
  if (!checklist.allConductorsLicenseValid) failedRequirements.push('Algunas licencias de conducir vencidas')
  if (!checklist.allVehiclesCirculationValid) failedRequirements.push('Algunos permisos de circulación vencidos')
  if (!checklist.allVehiclesMaintenanceValid) failedRequirements.push('Algunas revisiones técnicas vencidas')
  if (!checklist.hasRequiredDocuments) failedRequirements.push('Documentos requeridos incompletos')
  if (!checklist.noOutstandingIssues) failedRequirements.push('Problemas pendientes en verificación')

  // Recomendaciones
  const recommendations: string[] = []
  if (!checklist.allConductorsLicenseValid) {
    recommendations.push('Solicitar renovación de licencias vencidas')
  }
  if (!checklist.allVehiclesCirculationValid) {
    recommendations.push('Actualizar permisos de circulación')
  }
  if (!checklist.allVehiclesMaintenanceValid) {
    recommendations.push('Programar revisiones técnicas')
  }
  if (failedRequirements.length > 0) {
    recommendations.push('Completar los requisitos faltantes antes de operar')
  }

  return {
    contractorId,
    contractorName,
    status,
    score,
    maxScore,
    percentage,
    checklist,
    failedRequirements,
    recommendations,
    canOperate: status === 'green',
    lastUpdated: new Date(),
  }
}

// Calificación rápida para múltiples contratistas
export function qualifyMultipleContractors(
  contractors: Array<{
    id: string
    razon_social: string
    rut?: string
    conductores?: any[]
    vehiculos?: any[]
    documentos?: any[]
    outstandingIssues?: number
  }>
): ContractorQualificationResult[] {
  return contractors.map(c =>
    calculateContractorQualification(
      c.id,
      c.razon_social,
      {
        rut: c.rut,
        conductores: c.conductores,
        vehiculos: c.vehiculos,
        documentos: c.documentos,
        outstandingIssues: c.outstandingIssues,
      }
    )
  )
}

// Estadísticas de calificación
export function getQualificationStats(
  results: ContractorQualificationResult[]
) {
  return {
    total: results.length,
    green: results.filter(r => r.status === 'green').length,
    yellow: results.filter(r => r.status === 'yellow').length,
    red: results.filter(r => r.status === 'red').length,
    canOperate: results.filter(r => r.canOperate).length,
    averageScore: Math.round(
      results.reduce((sum, r) => sum + r.percentage, 0) / results.length
    ),
  }
}
