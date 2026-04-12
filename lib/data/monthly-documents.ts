export interface MonthlyDocument {
  id: string
  nombre: string
  descripcion?: string
  docExtraClienteRequerido?: boolean
  certificacionesRelacionadas: string[]
}

export const allMonthlyDocuments: MonthlyDocument[] = [
  {
    id: 'doc-1',
    nombre: 'Planillas de imposiciones (AFP, Salud, Mutual, Seguro Social)',
    descripcion: 'Documentos de imposiciones obligatorias',
    docExtraClienteRequerido: true,
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-2',
    nombre: 'IVA',
    descripcion: 'Impuesto al Valor Agregado',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-3',
    nombre: 'F30',
    descripcion: 'Formulario F30',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-4',
    nombre: 'F30-1',
    descripcion: 'Formulario F30-1',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-5',
    nombre: 'Liq Sueldo',
    descripcion: 'Liquidación de sueldo',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-6',
    nombre: 'Cert. Afil Mutual',
    descripcion: 'Certificado de Afiliación Mutual',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-7',
    nombre: 'Cert. Tasas Mutual',
    descripcion: 'Certificado de Tasas Mutual',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-8',
    nombre: 'Hoja de vida',
    descripcion: 'Documento de hoja de vida',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-9',
    nombre: 'Cert. Antecedentes',
    descripcion: 'Certificado de Antecedentes',
    certificacionesRelacionadas: []
  },
  {
    id: 'doc-10',
    nombre: 'Certificado de cotizaciones',
    descripcion: 'Certificado de cotizaciones realizadas',
    certificacionesRelacionadas: ['Ariztia']
  },
  {
    id: 'doc-11',
    nombre: 'F30-1 Lts',
    descripcion: 'Formulario F30-1 LTS',
    certificacionesRelacionadas: ['LTS']
  },
  {
    id: 'doc-12',
    nombre: 'Comprobantes de pago sueldo',
    descripcion: 'Comprobantes de pago de sueldo',
    certificacionesRelacionadas: ['Rendic', 'Interpolar']
  }
]
