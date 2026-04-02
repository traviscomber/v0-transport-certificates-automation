import { ChileanDocumentReference } from './types'

// Documentos de Vehículos
export const permiso_circulacion: ChileanDocumentReference = {
  id: 'permiso_circulacion',
  name: 'Permiso de Circulación',
  category: 'vehiculo',
  issuer: 'Municipalidad',
  validity_years: 1,
  priority: 'CRÍTICA',
  ocr_fields: ['patente', 'vin', 'propietario', 'propietario_rut', 'tipo_vehiculo', 'año_fabricacion', 'fecha_emision', 'fecha_vencimiento'],
  mandatory_validations: ['Patente exacta', 'VIN coincide con registro', 'No está vencido', 'Propietario coincide'],
  penalties: 'Multa $65.000+ si vencido',
  renewal_process: 'Renovación anual en Municipalidad',
  notes: 'Validación crítica de patente - debe coincidir exactamente'
}

export const rtv: ChileanDocumentReference = {
  id: 'rtv',
  name: 'Certificado de Revisión Técnica',
  category: 'vehiculo',
  issuer: 'Centro RTV Autorizado',
  validity_years: 1,
  priority: 'CRÍTICA',
  ocr_fields: ['patente', 'centro_rtv', 'numero_certificado', 'fecha_emision', 'fecha_vencimiento', 'resultado', 'anomalias'],
  mandatory_validations: ['Resultado es APTA', 'Patente exacta', 'No está vencida', 'Centro RTV es válido'],
  penalties: 'Multa $354.000+ si vencida',
  renewal_process: 'Anual en centro RTV autorizado',
  notes: 'Rechazos o Condicionales = No puede operar'
}

export const seguro_responsabilidad: ChileanDocumentReference = {
  id: 'seguro_responsabilidad',
  name: 'Seguro Responsabilidad Civil',
  category: 'vehiculo',
  issuer: 'Aseguradora',
  validity_years: 1,
  priority: 'CRÍTICA',
  ocr_fields: ['numero_poliza', 'aseguradora', 'patente', 'vigencia_desde', 'vigencia_hasta', 'cobertura_monto', 'tipo_cobertura'],
  mandatory_validations: ['Cobertura mínima $25.000.000', 'Patente coincide', 'No está vencido', 'Aseguradora es válida'],
  penalties: 'Multa $400.000+ multa penal si causa accidente',
  renewal_process: 'Renovación anual con aseguradora',
  notes: 'Mínimo obligatorio: $25 millones'
}

export const registro_propiedad: ChileanDocumentReference = {
  id: 'registro_propiedad',
  name: 'Registro de Propiedad del Vehículo',
  category: 'vehiculo',
  issuer: 'Conservador de Bienes Raíces',
  validity_years: 99,
  priority: 'CRÍTICA',
  ocr_fields: ['patente', 'vin', 'propietario_nombre', 'propietario_rut', 'año_fabricacion', 'tipo_vehiculo', 'folio_real'],
  mandatory_validations: ['Patente exacta', 'VIN coincide', 'Propietario legal activo', 'Folio real válido'],
  penalties: 'Vehículo no puede circular sin registro',
  renewal_process: 'No requiere renovación (actualizable)',
  notes: 'Validación de propiedad legal del vehículo'
}
