export type DocumentCategory = 'identity' | 'licenses' | 'insurance' | 'certifications' | 'background' | 'medical' | 'training' | 'compliance'

export type DocumentTag = 'required' | 'optional' | 'expiring' | 'critical' | 'recurring' | 'one_time' | 'operational'

export interface DocumentType {
  id: string
  name: string
  category: DocumentCategory
  tags: DocumentTag[]
  description: string
  required: boolean
  expiresAfterMonths?: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  notes?: string
}

export const DOCUMENT_CATEGORIES = {
  identity: {
    label: 'Identidad y Documentos Personales',
    icon: 'User',
    color: 'bg-blue-500'
  },
  licenses: {
    label: 'Licencias y Permisos',
    icon: 'License',
    color: 'bg-green-500'
  },
  insurance: {
    label: 'Seguros',
    icon: 'Shield',
    color: 'bg-purple-500'
  },
  certifications: {
    label: 'Certificaciones y Entrenamientos',
    icon: 'Award',
    color: 'bg-orange-500'
  },
  background: {
    label: 'Antecedentes y Verificación',
    icon: 'CheckCircle',
    color: 'bg-indigo-500'
  },
  medical: {
    label: 'Médicos y Salud',
    icon: 'Heart',
    color: 'bg-red-500'
  },
  training: {
    label: 'Capacitación',
    icon: 'BookOpen',
    color: 'bg-cyan-500'
  },
  compliance: {
    label: 'Cumplimiento y Legal',
    icon: 'FileCheck',
    color: 'bg-slate-500'
  }
}

export const WALMART_REQUIRED_DOCUMENTS: DocumentType[] = [
  // IDENTITY & DOCUMENTS
  {
    id: 'doc_cedula',
    name: 'Cédula de Identidad / Pasaporte',
    category: 'identity',
    tags: ['required', 'critical', 'one_time'],
    description: 'Documento de identificación válido y vigente',
    required: true,
    expiresAfterMonths: 120,
    priority: 'critical'
  },
  {
    id: 'doc_rut',
    name: 'RUT / Número de Identificación Fiscal',
    category: 'identity',
    tags: ['required', 'critical', 'one_time'],
    description: 'Registro Único Tributario o equivalente',
    required: true,
    priority: 'critical'
  },
  {
    id: 'doc_birth_cert',
    name: 'Certificado de Nacimiento',
    category: 'identity',
    tags: ['required', 'critical', 'one_time'],
    description: 'Certificado de nacimiento oficial',
    required: true,
    priority: 'critical'
  },
  
  // LICENSES & PERMITS
  {
    id: 'lic_driving',
    name: 'Licencia de Conducir',
    category: 'licenses',
    tags: ['required', 'critical', 'expiring', 'recurring'],
    description: 'Licencia de conducir válida y vigente (Clase A5 mínimo)',
    required: true,
    expiresAfterMonths: 60,
    priority: 'critical',
    notes: 'Debe estar vigente. Renovar antes de vencer.'
  },
  {
    id: 'lic_commercial',
    name: 'Licencia Comercial',
    category: 'licenses',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Permiso de conducir vehículos comerciales',
    required: true,
    expiresAfterMonths: 60,
    priority: 'high'
  },
  {
    id: 'lic_vehicle_reg',
    name: 'Registro del Vehículo',
    category: 'licenses',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Tarjeta de circulación del vehículo',
    required: true,
    expiresAfterMonths: 12,
    priority: 'critical'
  },
  {
    id: 'lic_vehicle_inspection',
    name: 'Revisión Técnica del Vehículo (RTV)',
    category: 'licenses',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Inspección mecánica anual del vehículo',
    required: true,
    expiresAfterMonths: 12,
    priority: 'critical'
  },
  {
    id: 'lic_operating_permit',
    name: 'Permiso de Operación',
    category: 'licenses',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Permiso municipal o estatal para operación comercial',
    required: true,
    expiresAfterMonths: 12,
    priority: 'high'
  },

  // INSURANCE
  {
    id: 'ins_liability',
    name: 'Seguro de Responsabilidad Civil',
    category: 'insurance',
    tags: ['required', 'critical', 'expiring', 'recurring'],
    description: 'Póliza de responsabilidad civil vigente',
    required: true,
    expiresAfterMonths: 12,
    priority: 'critical'
  },
  {
    id: 'ins_vehicle',
    name: 'Seguro del Vehículo',
    category: 'insurance',
    tags: ['required', 'critical', 'expiring', 'recurring'],
    description: 'Póliza de seguro del vehículo completo',
    required: true,
    expiresAfterMonths: 12,
    priority: 'critical'
  },
  {
    id: 'ins_cargo',
    name: 'Seguro de Carga',
    category: 'insurance',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Seguro de la mercancía transportada',
    required: true,
    expiresAfterMonths: 12,
    priority: 'high'
  },
  {
    id: 'ins_accidental',
    name: 'Seguro contra Accidentes',
    category: 'insurance',
    tags: ['optional', 'expiring'],
    description: 'Cobertura adicional de accidentes',
    required: false,
    expiresAfterMonths: 12,
    priority: 'medium'
  },

  // CERTIFICATIONS & TRAINING
  {
    id: 'cert_hazmat',
    name: 'Certificación HazMat',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Certificación para transporte de materiales peligrosos',
    required: false,
    expiresAfterMonths: 36,
    priority: 'medium'
  },
  {
    id: 'cert_cold_chain',
    name: 'Certificación Cadena de Frío',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Certificación para transporte de productos refrigerados',
    required: false,
    expiresAfterMonths: 24,
    priority: 'medium'
  },
  {
    id: 'cert_food_safety',
    name: 'Certificado de Manipuleo de Alimentos',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Certificación de seguridad alimentaria',
    required: false,
    expiresAfterMonths: 24,
    priority: 'medium'
  },
  {
    id: 'cert_forklift',
    name: 'Certificación Montacargas',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Certificación para operar equipo de carga',
    required: false,
    expiresAfterMonths: 24,
    priority: 'medium'
  },
  {
    id: 'cert_forklift_renewal',
    name: 'Renovación Certificación Montacargas',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Renovación anual de certificación',
    required: false,
    expiresAfterMonths: 12,
    priority: 'medium'
  },
  {
    id: 'cert_safety',
    name: 'Certificación de Seguridad en el Trabajo',
    category: 'certifications',
    tags: ['optional', 'expiring', 'recurring'],
    description: 'Capacitación y certificación de seguridad laboral',
    required: false,
    expiresAfterMonths: 24,
    priority: 'medium'
  },

  // BACKGROUND & VERIFICATION
  {
    id: 'bg_criminal',
    name: 'Verificación Antecedentes Penales',
    category: 'background',
    tags: ['required', 'critical', 'one_time'],
    description: 'Certificado de antecedentes penales',
    required: true,
    priority: 'critical',
    notes: 'Expedido por autoridades competentes'
  },
  {
    id: 'bg_civil',
    name: 'Certificado Antecedentes Civiles',
    category: 'background',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Certificado de antecedentes civiles',
    required: true,
    expiresAfterMonths: 24,
    priority: 'high'
  },
  {
    id: 'bg_credit',
    name: 'Verificación de Crédito',
    category: 'background',
    tags: ['optional', 'one_time'],
    description: 'Reporte de historial crediticio',
    required: false,
    priority: 'low'
  },
  {
    id: 'bg_employment',
    name: 'Verificación de Empleo Previo',
    category: 'background',
    tags: ['required', 'one_time'],
    description: 'Referencia de empleadores anteriores',
    required: true,
    priority: 'high'
  },
  {
    id: 'bg_references',
    name: 'Referencias Personales',
    category: 'background',
    tags: ['required', 'one_time'],
    description: 'Mínimo 3 referencias personales o profesionales',
    required: true,
    priority: 'high'
  },

  // MEDICAL & HEALTH
  {
    id: 'med_physical',
    name: 'Examen Físico Anual',
    category: 'medical',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Certificado médico de aptitud física',
    required: true,
    expiresAfterMonths: 12,
    priority: 'high'
  },
  {
    id: 'med_psychological',
    name: 'Evaluación Psicológica',
    category: 'medical',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Evaluación psicológica de aptitud',
    required: true,
    expiresAfterMonths: 24,
    priority: 'high'
  },
  {
    id: 'med_drug_test',
    name: 'Prueba de Drogas',
    category: 'medical',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Prueba toxicológica o examen de drogas',
    required: true,
    expiresAfterMonths: 12,
    priority: 'critical'
  },
  {
    id: 'med_vaccination',
    name: 'Certificado de Vacunación',
    category: 'medical',
    tags: ['optional', 'expiring'],
    description: 'Comprobante de vacunación requerida',
    required: false,
    expiresAfterMonths: 24,
    priority: 'low'
  },

  // TRAINING & DEVELOPMENT
  {
    id: 'train_walmart_onboarding',
    name: 'Capacitación de Orientación Walmart',
    category: 'training',
    tags: ['required', 'one_time'],
    description: 'Programa de inducción Walmart completo',
    required: true,
    priority: 'high'
  },
  {
    id: 'train_safety',
    name: 'Capacitación de Seguridad',
    category: 'training',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Capacitación anual de seguridad',
    required: true,
    expiresAfterMonths: 12,
    priority: 'high'
  },
  {
    id: 'train_customer_service',
    name: 'Capacitación Servicio al Cliente',
    category: 'training',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Capacitación de atención al cliente',
    required: true,
    expiresAfterMonths: 24,
    priority: 'medium'
  },
  {
    id: 'train_compliance',
    name: 'Capacitación de Cumplimiento',
    category: 'training',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Capacitación de políticas y cumplimiento Walmart',
    required: true,
    expiresAfterMonths: 12,
    priority: 'high'
  },
  {
    id: 'train_ethics',
    name: 'Capacitación de Ética Empresarial',
    category: 'training',
    tags: ['required', 'one_time'],
    description: 'Capacitación de código de ética',
    required: true,
    priority: 'high'
  },

  // COMPLIANCE & LEGAL
  {
    id: 'comp_contract',
    name: 'Contrato de Empleo',
    category: 'compliance',
    tags: ['required', 'critical', 'one_time'],
    description: 'Contrato laboral firmado',
    required: true,
    priority: 'critical'
  },
  {
    id: 'comp_tax_form',
    name: 'Formulario Fiscal (W9/W4)',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Formulario tributario completado',
    required: true,
    priority: 'critical'
  },
  {
    id: 'comp_i9_verification',
    name: 'Verificación I-9 / Autorización de Trabajo',
    category: 'compliance',
    tags: ['required', 'critical', 'one_time'],
    description: 'Formulario I-9 o equivalente de autorización de trabajo',
    required: true,
    priority: 'critical'
  },
  {
    id: 'comp_background_consent',
    name: 'Consentimiento de Verificación de Antecedentes',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Autorización firmada para verificación de antecedentes',
    required: true,
    priority: 'critical'
  },
  {
    id: 'comp_confidentiality',
    name: 'Acuerdo de Confidencialidad',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Acuerdo de no divulgación firmado',
    required: true,
    priority: 'high'
  },
  {
    id: 'comp_code_conduct',
    name: 'Código de Conducta Firmado',
    category: 'compliance',
    tags: ['required', 'expiring', 'recurring'],
    description: 'Reconocimiento de código de conducta',
    required: true,
    expiresAfterMonths: 24,
    priority: 'high'
  },
  {
    id: 'comp_policy_handbook',
    name: 'Manual de Políticas - Confirmación',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Reconocimiento de lectura del manual',
    required: true,
    priority: 'high'
  },
  {
    id: 'comp_harassment_policy',
    name: 'Política Anti-Acoso - Confirmación',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Reconocimiento de política anti-acoso',
    required: true,
    priority: 'high'
  },
  {
    id: 'comp_diversity_training',
    name: 'Capacitación de Diversidad e Inclusión',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Capacitación en diversidad e inclusión',
    required: true,
    priority: 'medium'
  },
  {
    id: 'comp_data_protection',
    name: 'Confirmación Protección de Datos',
    category: 'compliance',
    tags: ['required', 'one_time'],
    description: 'Reconocimiento de política de datos personales',
    required: true,
    priority: 'high'
  },
]

// Alias for backward compatibility
export const DOCUMENT_TYPES = WALMART_REQUIRED_DOCUMENTS

export function getDocumentsByCategory(category: DocumentCategory): DocumentType[] {
  return WALMART_REQUIRED_DOCUMENTS.filter(doc => doc.category === category)
}

export function getRequiredDocuments(): DocumentType[] {
  return WALMART_REQUIRED_DOCUMENTS.filter(doc => doc.required)
}

export function getOptionalDocuments(): DocumentType[] {
  return WALMART_REQUIRED_DOCUMENTS.filter(doc => !doc.required)
}

export function getExpiringDocuments(): DocumentType[] {
  return WALMART_REQUIRED_DOCUMENTS.filter(doc => doc.tags.includes('expiring'))
}

export function getDocumentsByTag(tag: DocumentTag): DocumentType[] {
  return WALMART_REQUIRED_DOCUMENTS.filter(doc => doc.tags.includes(tag))
}
