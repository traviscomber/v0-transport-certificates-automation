import { ChileanDocumentReference } from './types'
import * as conductorDocs from './conductor'
import * as vehiculoDocs from './vehiculo'
import * as empresaDocs from './empresa'

// Aggregator - builds on demand
let _cache: Record<string, ChileanDocumentReference> | null = null

export function getCHILEAN_DOCUMENTS(): Record<string, ChileanDocumentReference> {
  if (_cache) return _cache

  _cache = {
    // Conductor
    licencia_a4: conductorDocs.licencia_a4,
    licencia_a5: conductorDocs.licencia_a5,
    certificado_capacitacion_123: conductorDocs.certificado_capacitacion_123,
    antecedentes_transito: conductorDocs.antecedentes_transito,
    // Vehículo
    permiso_circulacion: vehiculoDocs.permiso_circulacion,
    rtv: vehiculoDocs.rtv,
    seguro_responsabilidad: vehiculoDocs.seguro_responsabilidad,
    registro_propiedad: vehiculoDocs.registro_propiedad,
    // Empresa
    rut_empresa: empresaDocs.rut_empresa,
    inscripcion_mtt: empresaDocs.inscripcion_mtt,
  }

  return _cache
}

export const CHILEAN_DOCUMENTS = new Proxy({}, {
  get: (_target, prop: string | symbol) => {
    const docs = getCHILEAN_DOCUMENTS()
    return docs[prop as string]
  },
  has: (_target, prop: string | symbol) => {
    const docs = getCHILEAN_DOCUMENTS()
    return prop in docs
  },
})

export function getDocumentRequirements(documentType: string) {
  const docs = getCHILEAN_DOCUMENTS()
  return docs[documentType] || null
}

export function getDocumentsByCategory(category: 'conductor' | 'vehiculo' | 'empresa' | 'especial') {
  const docs = getCHILEAN_DOCUMENTS()
  return Object.values(docs).filter(doc => doc.category === category)
}

export function getCriticalDocuments() {
  const docs = getCHILEAN_DOCUMENTS()
  return Object.values(docs).filter(doc => doc.priority === 'CRÍTICA')
}

export type { ChileanDocumentReference }
