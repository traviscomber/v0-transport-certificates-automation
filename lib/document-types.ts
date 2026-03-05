/**
 * Document Types Configuration for Walmart Chile OCR Portal
 * 35+ document types across 6 categories
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

export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  // CATEGORÍA 1: EMPRESA (5)
  'RUT-EMPRESA': {
    code: 'RUT-EMPRESA',
    name: 'RUT Empresa',
    category: 'empresa',
    description: 'Registro Único Tributario de la empresa transportista',
    aiPrompt: `Extrae datos del RUT de empresa chilena. 
Campos a extraer:
- rut: Formato XX.XXX.XXX-X (ej: 12.345.678-9)
- razonSocial: Nombre oficial de la empresa
- estado: Estado del RUT (Activo/Inactivo)
- digito_verificador: Dígito verificador

Responde SOLO con JSON válido, sin explicaciones adicionales.`,
    requiredFields: ['rut', 'razonSocial', 'estado'],
    optionalFields: ['digito_verificador'],
    validationRules: {
      rut: { pattern: '^\\d{1,2}\\.\\d{3}\\.\\d{3}-[0-9K]$', type: 'rut' },
      estado: { enum: ['Activo', 'Inactivo'] },
    },
    expirationDays: null,
    sortOrder: 1,
  },

  'ESCRITURA-CONSTITUCION': {
    code: 'ESCRITURA-CONSTITUCION',
    name: 'Escritura de Constitución',
    category: 'empresa',
    description: 'Documento notarial de constitución de la empresa',
    aiPrompt: `Extrae datos de la escritura de constitución de empresa chilena.
Campos a extraer:
- fecha: Fecha de constitución (DD/MM/YYYY)
- notario: Nombre del notario
- socios: Nombres de socios constituyentes
- capital: Capital inicial si aparece
- observaciones: Notas relevantes

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'notario', 'socios'],
    optionalFields: ['capital', 'observaciones'],
    validationRules: {
      fecha: { type: 'date', format: 'DD/MM/YYYY' },
    },
    expirationDays: 365,
    sortOrder: 2,
  },

  'CERTIFICADO-VIGENCIA': {
    code: 'CERTIFICADO-VIGENCIA',
    name: 'Certificado de Vigencia',
    category: 'empresa',
    description: 'Certificado de vigencia del registro comercial',
    aiPrompt: `Extrae datos del certificado de vigencia de empresa.
Campos a extraer:
- estado: Estado vigente
- fechaCertificado: Fecha de emisión
- camara_comercio: Cámara emisora si aparece

Responde SOLO con JSON válido.`,
    requiredFields: ['estado', 'fechaCertificado'],
    optionalFields: ['camara_comercio'],
    validationRules: {
      estado: { enum: ['Vigente', 'No Vigente'] },
    },
    expirationDays: 90,
    sortOrder: 3,
  },

  'PODER-REPRESENTANTE': {
    code: 'PODER-REPRESENTANTE',
    name: 'Poder del Representante',
    category: 'empresa',
    description: 'Documento notarial otorgando poderes al representante legal',
    aiPrompt: `Extrae datos del poder del representante.
Campos a extraer:
- representante: Nombre del representante
- alcance: Alcance de poderes (apoderado, gerente, etc)
- fecha: Fecha de otorgamiento
- notario: Notario que otorga

Responde SOLO con JSON válido.`,
    requiredFields: ['representante', 'alcance', 'fecha'],
    optionalFields: ['notario'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 4,
  },

  'CEDULA-REPRESENTANTE': {
    code: 'CEDULA-REPRESENTANTE',
    name: 'Cédula Representante Legal',
    category: 'empresa',
    description: 'Cédula de identidad del representante legal',
    aiPrompt: `Analiza esta CÉDULA DE IDENTIDAD CHILENA del representante legal.
Campos a extraer:
- rut: RUT formato XX.XXX.XXX-X
- nombre: Nombre completo
- fecha_nacimiento: DD/MM/YYYY
- sexo: Masculino/Femenino
- nacionalidad: Nacionalidad

Responde SOLO con JSON válido, sin backticks.`,
    requiredFields: ['rut', 'nombre', 'fecha_nacimiento'],
    optionalFields: ['sexo', 'nacionalidad'],
    validationRules: {
      rut: { type: 'rut' },
    },
    expirationDays: null,
    sortOrder: 5,
  },

  // CATEGORÍA 2: CONDUCTOR (9)
  'CEDULA-IDENTIDAD': {
    code: 'CEDULA-IDENTIDAD',
    name: 'Cédula de Identidad',
    category: 'conductor',
    description: 'Cédula de identidad chilena del conductor',
    aiPrompt: `Analiza esta CÉDULA DE IDENTIDAD CHILENA y extrae los datos.

CAMPOS A EXTRAER:
- rut: RUT en formato XX.XXX.XXX-X
- nombreCompleto: Nombre y apellidos completos
- nombre: Solo nombre de pila
- apellidos: Apellidos completos
- fechaNacimiento: Fecha en DD/MM/YYYY
- sexo: Masculino, Femenino u Otro
- fechaEmision: Fecha de emisión en DD/MM/YYYY
- fechaVencimiento: Fecha de vencimiento en DD/MM/YYYY

IMPORTANTE: Si no puedes leer un campo claramente, OMÍTELO del JSON en lugar de dejar "No legible".
Responde SOLO con JSON válido, sin backticks ni explicaciones.`,
    requiredFields: ['rut', 'nombreCompleto', 'fechaNacimiento'],
    optionalFields: ['sexo', 'nacionalidad'],
    validationRules: {
      rut: { type: 'rut' },
      fechaNacimiento: { type: 'date' },
    },
    expirationDays: null,
    sortOrder: 6,
  },

  'LICENCIA-CONDUCIR': {
    code: 'LICENCIA-CONDUCIR',
    name: 'Licencia de Conducir Profesional',
    category: 'conductor',
    description: 'Licencia profesional A-4 o A-5 para transporte',
    aiPrompt: `Extrae datos de licencia profesional de conducir chilena.
Campos a extraer:
- rut: RUT del conductor
- clase: Clase de licencia (A-4, A-5)
- fechaVencimiento: Fecha vencimiento DD/MM/YYYY
- restricciones: Restricciones si las hay
- observaciones: Notas importantes

Responde SOLO con JSON válido.`,
    requiredFields: ['rut', 'clase', 'fechaVencimiento'],
    optionalFields: ['restricciones', 'observaciones'],
    validationRules: {
      clase: { enum: ['A-4', 'A-5'] },
    },
    expirationDays: 365,
    sortOrder: 7,
  },

  'HOJA-VIDA': {
    code: 'HOJA-VIDA',
    name: 'Hoja de Vida',
    category: 'conductor',
    description: 'Curriculum vitae del conductor',
    aiPrompt: `Extrae datos de la hoja de vida.
Campos a extraer:
- nombre: Nombre completo
- experiencia: Años de experiencia en transporte
- referencias: Contactos de referencias si aparecen

Responde SOLO con JSON válido.`,
    requiredFields: ['nombre', 'experiencia'],
    optionalFields: ['referencias', 'capacitaciones'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 8,
  },

  'CERTIFICADO-ANTECEDENTES': {
    code: 'CERTIFICADO-ANTECEDENTES',
    name: 'Certificado de Antecedentes',
    category: 'conductor',
    description: 'Certificado de antecedentes penales',
    aiPrompt: `Extrae datos del certificado de antecedentes.
Campos a extraer:
- fecha: Fecha de expedición
- estado: Estado (Sin antecedentes / Con antecedentes)
- autoridad: PDI o Carabineros

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'estado', 'autoridad'],
    optionalFields: ['observaciones'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 9,
  },

  'INHABILIDADES-MENORES': {
    code: 'INHABILIDADES-MENORES',
    name: 'Inhabilidades Menores',
    category: 'conductor',
    description: 'Certificado de no tener inhabilidades menores',
    aiPrompt: `Extrae datos del certificado de inhabilidades menores.
Campos a extraer:
- estado: No tiene inhabilidades / Tiene inhabilidades
- fecha: Fecha de expedición

Responde SOLO con JSON válido.`,
    requiredFields: ['estado', 'fecha'],
    optionalFields: ['autoridad'],
    validationRules: {},
    expirationDays: 180,
    sortOrder: 10,
  },

  'CONTRATO-TRABAJO': {
    code: 'CONTRATO-TRABAJO',
    name: 'Contrato de Trabajo',
    category: 'conductor',
    description: 'Contrato laboral entre empresa y conductor',
    aiPrompt: `Extrae datos del contrato de trabajo.
Campos a extraer:
- fechaInicio: Fecha de inicio
- conductor: Nombre del conductor
- empresa: Nombre de la empresa
- ambas_firmas: Si ambas partes han firmado (Sí/No)

Responde SOLO con JSON válido.`,
    requiredFields: ['fechaInicio', 'ambas_firmas'],
    optionalFields: ['salario', 'condiciones'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 11,
  },

  'CERTIFICADO-AFP': {
    code: 'CERTIFICADO-AFP',
    name: 'Certificado AFP',
    category: 'conductor',
    description: 'Certificado de afiliación a fondo de pensiones',
    aiPrompt: `Extrae datos del certificado AFP.
Campos a extraer:
- AFP: Nombre de la AFP (Integra, Habitat, etc)
- numeroAfiliacion: Número de afiliado
- estado: Estado de cotizaciones (Al día / Atrasado)

Responde SOLO con JSON válido.`,
    requiredFields: ['AFP', 'numeroAfiliacion', 'estado'],
    optionalFields: ['ultimas_cotizaciones'],
    validationRules: {},
    expirationDays: 180,
    sortOrder: 12,
  },

  'CERTIFICADO-SALUD': {
    code: 'CERTIFICADO-SALUD',
    name: 'Certificado de Salud',
    category: 'conductor',
    description: 'Certificado de salud válido para conducir',
    aiPrompt: `Extrae datos del certificado de salud.
Campos a extraer:
- fecha: Fecha de expedición
- vigencia: Período de vigencia
- estado: Apto / No apto para conducir

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'vigencia', 'estado'],
    optionalFields: ['examinador'],
    validationRules: {
      estado: { enum: ['Apto', 'No apto'] },
    },
    expirationDays: 365,
    sortOrder: 13,
  },

  'EXAMEN-PREOCUPACIONAL': {
    code: 'EXAMEN-PREOCUPACIONAL',
    name: 'Examen Preocupacional',
    category: 'conductor',
    description: 'Examen médico ocupacional',
    aiPrompt: `Extrae datos del examen preocupacional.
Campos a extraer:
- fecha: Fecha del examen
- resultado: Apto / No apto
- medico: Médico que realiza

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'resultado'],
    optionalFields: ['medico', 'recomendaciones'],
    validationRules: {
      resultado: { enum: ['Apto', 'No apto'] },
    },
    expirationDays: 365,
    sortOrder: 14,
  },

  // CATEGORÍA 3: VEHÍCULO (8)
  'PADRON-INSCRIPCION': {
    code: 'PADRON-INSCRIPCION',
    name: 'Padrón/Certificado Inscripción',
    category: 'vehiculo',
    description: 'Certificado de inscripción del vehículo',
    aiPrompt: `Extrae datos del padrón de inscripción del vehículo.
Campos a extraer:
- patente: Patente del vehículo (ej: HJKL-34)
- vin: Número VIN/Chasis
- marca: Marca (Mercedes-Benz, Volvo, etc)
- modelo: Modelo
- ano: Año de fabricación
- propietario: Nombre del propietario

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'vin', 'marca', 'modelo', 'ano'],
    optionalFields: ['propietario', 'color'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 15,
  },

  'PERMISO-CIRCULACION': {
    code: 'PERMISO-CIRCULACION',
    name: 'Permiso de Circulación',
    category: 'vehiculo',
    description: 'Permiso municipal de circulación',
    aiPrompt: `Extrae datos del permiso de circulación.
Campos a extraer:
- patente: Patente del vehículo
- fechaVencimiento: Fecha de vencimiento DD/MM/YYYY
- municipio: Municipio emisor
- estado: Vigente / Vencido

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'fechaVencimiento'],
    optionalFields: ['municipio', 'estado'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 16,
  },

  'REVISION-TECNICA': {
    code: 'REVISION-TECNICA',
    name: 'Revisión Técnica',
    category: 'vehiculo',
    description: 'Certificado de revisión técnica',
    aiPrompt: `Extrae datos de la revisión técnica.
Campos a extraer:
- patente: Patente del vehículo
- fecha: Fecha de revisión
- estado: Apto / No apto
- proxima_revision: Fecha próxima revisión

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'fecha', 'estado'],
    optionalFields: ['proxima_revision'],
    validationRules: {
      estado: { enum: ['Apto', 'No apto'] },
    },
    expirationDays: 365,
    sortOrder: 17,
  },

  'CERTIFICADO-EMISIONES': {
    code: 'CERTIFICADO-EMISIONES',
    name: 'Certificado de Emisiones',
    category: 'vehiculo',
    description: 'Certificado de control de emisiones',
    aiPrompt: `Extrae datos del certificado de emisiones.
Campos a extraer:
- patente: Patente del vehículo
- fecha: Fecha del certificado
- estado: Cumple / No cumple
- norma: Norma ISO/Euro cumplida

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'fecha', 'estado'],
    optionalFields: ['norma'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 18,
  },

  'SEGURO-SOAP': {
    code: 'SEGURO-SOAP',
    name: 'Seguro SOAP',
    category: 'vehiculo',
    description: 'Póliza de Seguro Obligatorio de Pasajeros',
    aiPrompt: `Extrae datos del seguro SOAP.
Campos a extraer:
- patente: Patente del vehículo
- fechaVencimiento: Fecha de vencimiento
- asegurador: Nombre de la aseguradora
- numeroPóliza: Número de póliza

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'fechaVencimiento', 'asegurador'],
    optionalFields: ['numeroPóliza'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 19,
  },

  'SEGURO-CARGA': {
    code: 'SEGURO-CARGA',
    name: 'Seguro de Carga',
    category: 'vehiculo',
    description: 'Seguro de responsabilidad civil para carga',
    aiPrompt: `Extrae datos del seguro de carga.
Campos a extraer:
- patente: Patente del vehículo
- cobertura: Monto de cobertura
- fechaVencimiento: Fecha de vencimiento
- asegurador: Aseguradora

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'cobertura', 'fechaVencimiento'],
    optionalFields: ['asegurador', 'numeroPóliza'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 20,
  },

  'SEGURO-RESPONSABILIDAD': {
    code: 'SEGURO-RESPONSABILIDAD',
    name: 'Seguro Responsabilidad Civil',
    category: 'vehiculo',
    description: 'Seguro de responsabilidad civil del vehículo',
    aiPrompt: `Extrae datos del seguro de responsabilidad civil.
Campos a extraer:
- patente: Patente del vehículo
- cobertura: Cobertura
- fechaVencimiento: Fecha de vencimiento
- asegurador: Aseguradora

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'cobertura', 'fechaVencimiento'],
    optionalFields: ['asegurador'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 21,
  },

  'FOTOGRAFIA-GPS': {
    code: 'FOTOGRAFIA-GPS',
    name: 'Fotografía + GPS',
    category: 'vehiculo',
    description: 'Fotografía y coordenadas GPS del vehículo',
    aiPrompt: `Extrae datos de la fotografía del vehículo.
Campos a extraer:
- patente: Patente visible en foto
- imagen_frontal: Confirmación de foto frontal/lateral
- coordenadas_gps: GPS si está presente

Responde SOLO con JSON válido.`,
    requiredFields: ['patente', 'imagen_frontal'],
    optionalFields: ['coordenadas_gps'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 22,
  },

  // CATEGORÍA 4: SEGURIDAD (5)
  'REGLAMENTO-INTERNO': {
    code: 'REGLAMENTO-INTERNO',
    name: 'Reglamento Interno',
    category: 'seguridad',
    description: 'Reglamento interno de la empresa',
    aiPrompt: `Extrae datos del reglamento interno.
Campos a extraer:
- fecha: Fecha de aprobación
- version: Versión del documento
- contenido_seguridad: Si incluye cláusulas de seguridad

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'version'],
    optionalFields: ['contenido_seguridad'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 23,
  },

  'PROCEDIMIENTOS-SEGURIDAD': {
    code: 'PROCEDIMIENTOS-SEGURIDAD',
    name: 'Procedimientos Trabajo Seguro',
    category: 'seguridad',
    description: 'Procedimientos de trabajo seguro',
    aiPrompt: `Extrae datos de procedimientos de trabajo seguro.
Campos a extraer:
- fecha: Fecha de vigencia
- areas_cubiertas: Áreas cubiertas por procedimientos

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'areas_cubiertas'],
    optionalFields: ['responsables'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 24,
  },

  'MATRIZ-RIESGOS': {
    code: 'MATRIZ-RIESGOS',
    name: 'Matriz de Riesgos',
    category: 'seguridad',
    description: 'Matriz de riesgos laborales',
    aiPrompt: `Extrae datos de matriz de riesgos.
Campos a extraer:
- fecha: Fecha de la matriz
- riesgos_identificados: Cantidad de riesgos identificados

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'riesgos_identificados'],
    optionalFields: ['niveles', 'controles'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 25,
  },

  'CAPACITACIONES': {
    code: 'CAPACITACIONES',
    name: 'Capacitaciones',
    category: 'seguridad',
    description: 'Registros de capacitaciones',
    aiPrompt: `Extrae datos de capacitaciones.
Campos a extraer:
- fecha: Fecha de capacitación
- tema: Tema capacitado

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'tema'],
    optionalFields: ['personal_capacitado', 'certificador'],
    validationRules: {},
    expirationDays: 180,
    sortOrder: 26,
  },

  'PROTOCOLOS-ACCIDENTES': {
    code: 'PROTOCOLOS-ACCIDENTES',
    name: 'Protocolos de Accidentes',
    category: 'seguridad',
    description: 'Protocolos ante accidentes',
    aiPrompt: `Extrae datos de protocolos de accidentes.
Campos a extraer:
- fecha: Fecha de documento
- version: Versión

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'version'],
    optionalFields: ['tipos_accidentes'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 27,
  },

  // CATEGORÍA 5: OPERACIONAL (5)
  'GUIA-DESPACHO': {
    code: 'GUIA-DESPACHO',
    name: 'Guía de Despacho',
    category: 'operacional',
    description: 'Guía de despacho de carga',
    aiPrompt: `Extrae datos de guía de despacho.
Campos a extraer:
- numero: Número de guía
- fecha: Fecha de emisión
- origen: Lugar de origen
- destino: Lugar de destino
- carga: Descripción de carga

Responde SOLO con JSON válido.`,
    requiredFields: ['numero', 'fecha', 'origen', 'destino'],
    optionalFields: ['carga'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 28,
  },

  'ORDEN-TRANSPORTE': {
    code: 'ORDEN-TRANSPORTE',
    name: 'Orden de Transporte',
    category: 'operacional',
    description: 'Orden de transporte emitida',
    aiPrompt: `Extrae datos de orden de transporte.
Campos a extraer:
- numero: Número de orden
- fecha: Fecha
- origen: Origen
- destino: Destino

Responde SOLO con JSON válido.`,
    requiredFields: ['numero', 'fecha', 'origen', 'destino'],
    optionalFields: ['cliente'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 29,
  },

  'CARTA-PORTE': {
    code: 'CARTA-PORTE',
    name: 'Carta de Porte',
    category: 'operacional',
    description: 'Carta de porte de transporte',
    aiPrompt: `Extrae datos de carta de porte.
Campos a extraer:
- numero: Número de carta
- fecha: Fecha
- transportista: Nombre transportista

Responde SOLO con JSON válido.`,
    requiredFields: ['numero', 'fecha', 'transportista'],
    optionalFields: ['origen', 'destino'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 30,
  },

  'DOCUMENTOS-CARGA': {
    code: 'DOCUMENTOS-CARGA',
    name: 'Documentos de Carga',
    category: 'operacional',
    description: 'Documentos que acompañan la carga',
    aiPrompt: `Extrae datos de documentos de carga.
Campos a extraer:
- tipo: Tipo de documento
- numero: Número
- fecha: Fecha

Responde SOLO con JSON válido.`,
    requiredFields: ['tipo', 'numero', 'fecha'],
    optionalFields: ['descripcion_carga'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 31,
  },

  'REGISTRO-ENTREGA': {
    code: 'REGISTRO-ENTREGA',
    name: 'Registro de Entrega',
    category: 'operacional',
    description: 'Comprobante de entrega',
    aiPrompt: `Extrae datos de registro de entrega.
Campos a extraer:
- fecha: Fecha de entrega
- destinatario: Nombre destinatario
- firma: Confirmación de firma

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'destinatario', 'firma'],
    optionalFields: ['conformidad'],
    validationRules: {},
    expirationDays: null,
    sortOrder: 32,
  },

  // CATEGORÍA 6: SUBCONTRATACIÓN (3)
  'CONTRATOS-SUBCONTRATACION': {
    code: 'CONTRATOS-SUBCONTRATACION',
    name: 'Contratos de Subcontratación',
    category: 'subcontratacion',
    description: 'Contratos de subcontratación',
    aiPrompt: `Extrae datos de contrato de subcontratación.
Campos a extraer:
- fecha: Fecha del contrato
- partes: Partes contratantes
- vigencia: Período de vigencia

Responde SOLO con JSON válido.`,
    requiredFields: ['fecha', 'partes', 'vigencia'],
    optionalFields: ['terminos'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 33,
  },

  'F30-1': {
    code: 'F30-1',
    name: 'F-30-1 Actualizado',
    category: 'subcontratacion',
    description: 'Certificado F-30-1 de capacidad',
    aiPrompt: `Extrae datos de certificado F-30-1.
Campos a extraer:
- numeroF30_1: Número del F-30-1
- rut: RUT del titular
- fechaVencimiento: Fecha de vencimiento
- capacidad: Capacidad de carga autorizada

Responde SOLO con JSON válido.`,
    requiredFields: ['numeroF30_1', 'rut', 'fechaVencimiento'],
    optionalFields: ['capacidad'],
    validationRules: {},
    expirationDays: 365,
    sortOrder: 34,
  },

  'CUMPLIMIENTO-PREVISIONAL': {
    code: 'CUMPLIMIENTO-PREVISIONAL',
    name: 'Cumplimiento Previsional',
    category: 'subcontratacion',
    description: 'Certificado de cumplimiento previsional',
    aiPrompt: `Extrae datos de certificado previsional.
Campos a extraer:
- rut: RUT del subcontratista
- estado: Estado de cumplimiento (Al día / Atrasado)
- fecha: Fecha del certificado

Responde SOLO con JSON válido.`,
    requiredFields: ['rut', 'estado', 'fecha'],
    optionalFields: ['autoridad'],
    validationRules: {},
    expirationDays: 90,
    sortOrder: 35,
  },
}

/**
 * Get all document types
 */
export function getAllDocumentTypes(): DocumentTypeConfig[] {
  return Object.values(DOCUMENT_TYPES)
}

/**
 * Get document types by category
 */
export function getDocumentsByCategory(
  category: keyof typeof DOCUMENT_CATEGORIES
): DocumentTypeConfig[] {
  return Object.values(DOCUMENT_TYPES).filter((doc) => doc.category === category)
}

/**
 * Get document type by code
 */
export function getDocumentTypeByCode(code: string): DocumentTypeConfig | undefined {
  return DOCUMENT_TYPES[code]
}

/**
 * Get all categories
 */
export function getCategories() {
  return DOCUMENT_CATEGORIES
}
