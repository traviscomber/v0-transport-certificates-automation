export const MULTI_INSTANCE_DOCUMENT_CODES = new Set([
  'LIQUIDACION_SUELDO',
  'HOJA_VIDA',
  'CERT_ANTECEDENTES',
  'COMPROBANTE',
  'COMPROBANTE_PAGO',
  'PLANILLAS_IMPOSICIONES',
  'FOTO_PATENTE',
  'FOTO_PATENTES',
])

export const EXACT_SINGLE_INSTANCE_DOCUMENT_CODES = new Set([
  'F30-1_CLIENTE',
  'F30-1_DOÑA_ISIDORA',
  'CERT_COTIZACIONES',
  'CERT_AFIL_MUTUAL',
  'F30',
  'CERT_TASAS_MUTUAL',
  'F29',
])

export function isMultiInstanceDocumentCode(code: string | null | undefined): boolean {
  return Boolean(code && MULTI_INSTANCE_DOCUMENT_CODES.has(code))
}

export function shouldSupersedeByExactPeriod(code: string | null | undefined): boolean {
  return Boolean(code && EXACT_SINGLE_INSTANCE_DOCUMENT_CODES.has(code))
}

export function buildExactDocumentSlotKey(input: {
  subcontractorId: string | null | undefined
  documentTypeId: string | null | undefined
  periodYear: number | string | null | undefined
  periodMonth: number | string | null | undefined
}): string | null {
  const { subcontractorId, documentTypeId, periodYear, periodMonth } = input
  if (!subcontractorId || !documentTypeId || !periodYear || !periodMonth) return null
  return `${subcontractorId}:${documentTypeId}:${periodYear}:${periodMonth}`
}
