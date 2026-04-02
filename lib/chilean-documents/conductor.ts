import { ChileanDocumentReference } from './types'

// Documentos de Conductor
export const licencia_a4: ChileanDocumentReference = {
  id: 'licencia_a4',
  name: 'Licencia de Conducción Profesional A4',
  category: 'conductor',
  issuer: 'Municipalidad',
  validity_years: 5,
  priority: 'CRÍTICA',
  ocr_fields: ['numero_licencia', 'nombres', 'apellido_paterno', 'apellido_materno', 'rut', 'fecha_nacimiento', 'categoria_a4', 'fecha_emision', 'fecha_vencimiento', 'restricciones'],
  mandatory_validations: ['RUT coincide con otros documentos', 'No está vencida', 'Categoría exacta es A4', 'Firma presente', 'Foto clara'],
  penalties: 'Multa $109.860 (2024) si vencida',
  renewal_process: 'Municipalidad competente, requiere examen',
  notes: 'Campo más crítico: fecha_vencimiento y categoria'
}

export const licencia_a5: ChileanDocumentReference = {
  id: 'licencia_a5',
  name: 'Licencia de Conducción Profesional A5',
  category: 'conductor',
  issuer: 'Municipalidad',
  validity_years: 5,
  priority: 'CRÍTICA',
  ocr_fields: ['numero_licencia', 'nombres', 'apellido_paterno', 'rut', 'categoria_a5', 'fecha_vencimiento'],
  mandatory_validations: ['Categoría exacta es A5', 'No está vencida', 'RUT coincide'],
  penalties: 'Multa $109.860 (2024)',
  renewal_process: 'Renovación en Municipalidad',
  notes: 'Para conducción de camiones'
}

export const certificado_capacitacion_123: ChileanDocumentReference = {
  id: 'certificado_capacitacion_123',
  name: 'Certificado de Capacitación Ley 20.123',
  category: 'conductor',
  issuer: 'Instituto Capacitador Acreditado',
  validity_years: 3,
  priority: 'CRÍTICA',
  ocr_fields: ['nombre_conductor', 'rut_conductor', 'institucion_capacitadora', 'fecha_capacitacion', 'fecha_vencimiento', 'tipo_capacitacion', 'numero_certificado'],
  mandatory_validations: ['RUT coincide', 'No está vencido', 'Instituto es acreditada', 'Tipo capacitación válido'],
  penalties: 'Multa $83.000+ por incumplimiento Ley 20.123',
  renewal_process: 'Cada 3 años con institución acreditada',
  notes: 'Crítico para subcontratistas de transporte'
}

export const antecedentes_transito: ChileanDocumentReference = {
  id: 'antecedentes_transito',
  name: 'Certificado Antecedentes de Tránsito',
  category: 'conductor',
  issuer: 'Juzgado de Tránsito / CONASET',
  validity_years: 1,
  priority: 'CRÍTICA',
  ocr_fields: ['rut', 'nombre_conductor', 'estado', 'fecha_emision', 'fecha_vencimiento', 'infracciones', 'puntos_restados'],
  mandatory_validations: ['Estado es APTO', 'No inhabilitado', 'Puntos > 0', 'RUT coincide'],
  penalties: 'Conductor inhabilitado = No puede conducir',
  renewal_process: 'Consulta a CONASET o Juzgado',
  notes: 'Si estado es INHABILITADO = RECHAZO automático'
}
