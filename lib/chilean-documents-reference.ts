export interface ChileanDocumentReference {
  id: string
  name: string
  category: 'conductor' | 'vehiculo' | 'empresa' | 'especial'
  issuer: string
  validity_years: number
  priority: 'CRÍTICA' | 'ALTA' | 'MEDIA'
  ocr_fields: string[]
  mandatory_validations: string[]
  penalties: string
  renewal_process: string
  notes: string
}

// Lazy-load documents to avoid webpack serialization issues
let _documentsCache: Record<string, ChileanDocumentReference> | null = null

function getChileanDocuments(): Record<string, ChileanDocumentReference> {
  if (_documentsCache) {
    return _documentsCache
  }

  _documentsCache = {
    licencia_a4: {
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
    },
    licencia_a5: {
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
    },
    permiso_circulacion: {
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
    },
    rtv: {
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
    },
    seguro_responsabilidad: {
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
    },
    certificado_capacitacion_123: {
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
    },
    antecedentes_transito: {
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
    },
    registro_propiedad: {
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
    },
    rut_empresa: {
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
    },
    inscripcion_mtt: {
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
  }

  return _documentsCache
}

// Export lazy-loaded getter
export function getCHILEAN_DOCUMENTS(): Record<string, ChileanDocumentReference> {
  return getChileanDocuments()
}

// Función auxiliar para validar documento
export function getDocumentRequirements(documentType: string) {
  const docs = getChileanDocuments()
  return docs[documentType] || null
}

// Función para obtener documentos por categoría
export function getDocumentsByCategory(category: 'conductor' | 'vehiculo' | 'empresa' | 'especial') {
  const docs = getChileanDocuments()
  return Object.values(docs).filter(doc => doc.category === category)
}

// Función para obtener documentos críticos
export function getCriticalDocuments() {
  const docs = getChileanDocuments()
  return Object.values(docs).filter(doc => doc.priority === 'CRÍTICA')
}

// Mantener export por compatibilidad (getter lazy)
export const CHILEAN_DOCUMENTS = new Proxy({}, {
  get: (_target, prop: string | symbol) => {
    const docs = getChileanDocuments()
    return docs[prop as string]
  },
  has: (_target, prop: string | symbol) => {
    const docs = getChileanDocuments()
    return prop in docs
  },
  ownKeys: () => {
    const docs = getChileanDocuments()
    return Object.keys(docs)
  },
  getOwnPropertyDescriptor: () => ({
    enumerable: true,
    configurable: true,
  })
})
