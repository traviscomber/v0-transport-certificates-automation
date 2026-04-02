import { ChileanDocumentReference } from './types'

// Documentos de Empresa
export const rut_empresa: ChileanDocumentReference = {
  id: 'rut_empresa',
  name: 'RUT Empresa (Certificado RUT)',
  category: 'empresa',
  issuer: 'SII',
  validity_years: 2,
  priority: 'CRÍTICA',
  ocr_fields: ['rut_empresa', 'nombre_razon_social', 'giro_comercial', 'estado', 'fecha_emision', 'fecha_vencimiento'],
  mandatory_validations: ['RUT empresa correcto', 'Estado VIGENTE', 'No está vencido', 'Giro relacionado a transporte'],
  penalties: 'Multa $20.000.000+ por falsificación',
  renewal_process: 'Renovación cada 2 años en SII',
  notes: 'Debe coincidir con RUT registrado'
}

export const inscripcion_mtt: ChileanDocumentReference = {
  id: 'inscripcion_mtt',
  name: 'Inscripción Registro Nacional Servicios Transporte',
  category: 'empresa',
  issuer: 'Ministerio Transportes',
  validity_years: 1,
  priority: 'ALTA',
  ocr_fields: ['numero_inscripcion', 'rut_transportista', 'tipo_servicio', 'cantidad_vehiculos', 'vigencia_desde', 'vigencia_hasta'],
  mandatory_validations: ['Número inscripción válido', 'RUT coincide', 'No vencida', 'Tipo servicio coincide'],
  penalties: 'Multa $500.000+ por operar sin inscripción',
  renewal_process: 'Renovación anual en MTT',
  notes: 'Requerida para operación legal'
}
