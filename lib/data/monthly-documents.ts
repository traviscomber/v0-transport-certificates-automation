export interface MonthlyDocument {
  id: string
  nombre: string
  descripcion: string
  docExtraClienteRequerido: boolean
  certificacionesRelacionadas: string[]
}

export const allMonthlyDocuments: MonthlyDocument[] = [
  {
    id: 'doc-001',
    nombre: 'Planillas de imposiciones (AFP, Salud, Mutual, Seguro Social)',
    descripcion: 'Documentos mensuales de imposiciones de seguridad social',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-002',
    nombre: 'IVA',
    descripcion: 'Declaración mensual de IVA',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-003',
    nombre: 'F30',
    descripcion: 'Formulario F30 de Hacienda',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-004',
    nombre: 'F30-1',
    descripcion: 'Formulario F30-1 de Hacienda',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-005',
    nombre: 'Liq Sueldo',
    descripcion: 'Liquidación de sueldos mensuales',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-006',
    nombre: 'Cert. Afil Mutual',
    descripcion: 'Certificado de afiliación a mutual',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-007',
    nombre: 'Cert. Tasas Mutual',
    descripcion: 'Certificado de tasas de mutual',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-008',
    nombre: 'Hoja de vida',
    descripcion: 'Hoja de vida de empleados',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-009',
    nombre: 'Cert. Antecedentes',
    descripcion: 'Certificado de antecedentes',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-010',
    nombre: 'Certificado de cotizaciones',
    descripcion: 'Certificado de cotizaciones mensuales',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: ['Ariztia']
  },
  {
    id: 'doc-011',
    nombre: 'F30-1 Lts',
    descripcion: 'Formulario F30-1 para LTS',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: ['LTS']
  },
  {
    id: 'doc-012',
    nombre: 'Comprobantes de pago sueldo',
    descripcion: 'Comprobantes de pago de sueldos',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: ['Rendic', 'Interpolar']
  }
]
