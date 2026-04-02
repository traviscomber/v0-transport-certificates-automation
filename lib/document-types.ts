/**
 * Document Types Configuration - Client-Safe Exports
 * The massive DOCUMENT_TYPES data has been moved to document-types-full.ts
 * This file exports only minimal metadata needed by the UI
 */

export interface DocumentFieldConfig {
  name: string
  type: 'string' | 'date' | 'number' | 'email' | 'phone' | 'rut' | 'patente'
  required: boolean
  pattern?: string
  description?: string
}

export interface DocumentTypeConfig {
  code: string
  name: string
  category: 'empresa' | 'conductor' | 'vehiculo' | 'seguridad' | 'operacional' | 'subcontratacion'
  description: string
  aiPrompt: string
  requiredFields: string[]
  optionalFields: string[]
  validationRules: Record<string, any>
  expirationDays: number | null
  sortOrder: number
}

// Minimal category metadata - this is all that gets bundled to the client
export const DOCUMENT_CATEGORIES = {
  empresa: {
    name: 'Empresa',
    description: 'Documentos legales y tributarios de la empresa',
    color: '#3B82F6',
  },
  conductor: {
    name: 'Conductor',
    description: 'Documentos personales y profesionales del conductor',
    color: '#10B981',
  },
  vehiculo: {
    name: 'Vehículo',
    description: 'Registros y permisos del vehículo',
    color: '#F59E0B',
  },
  seguridad: {
    name: 'Seguridad',
    description: 'Documentos de seguridad y prevención de riesgos',
    color: '#EF4444',
  },
  operacional: {
    name: 'Operacional',
    description: 'Documentos de operaciones y entregas',
    color: '#8B5CF6',
  },
  subcontratacion: {
    name: 'Subcontratación',
    description: 'Documentos de subcontratistas y terceros',
    color: '#EC4899',
  },
}

// Stub implementations - these don't actually load the full data
export async function getDocumentsByCategory(category: string): Promise<DocumentTypeConfig[]> {
  return []
}

export function getDocumentTypeByCode(code: string): DocumentTypeConfig | undefined {
  return undefined
}

export function getAllDocumentTypes(): DocumentTypeConfig[] {
  return []
}

export function getCategories() {
  return DOCUMENT_CATEGORIES
}
