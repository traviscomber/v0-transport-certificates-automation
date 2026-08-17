export const LEGACY_MULTI_INSTANCE_SUBCONTRACTOR_CODES = [
  'LIQUIDACION_SUELDO',
  'HOJA_VIDA',
  'CERT_ANTECEDENTES',
  'COMPROBANTE_PAGO',
  'PLANILLAS_IMPOSICIONES',
  'FOTO_PATENTES',
] as const

export async function countActionableSubcontractorPending(supabase: any): Promise<number> {
  const { count: currentPending, error: currentError } = await supabase
    .from('subcontractor_documents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('is_current', true)

  if (currentError) throw currentError

  const { data: multiInstanceTypes, error: typesError } = await supabase
    .from('subcontractor_document_types')
    .select('id')
    .in('code', [...LEGACY_MULTI_INSTANCE_SUBCONTRACTOR_CODES])

  if (typesError) throw typesError

  const typeIds = (multiInstanceTypes || []).map((item: { id: string }) => item.id)
  if (typeIds.length === 0) return currentPending || 0

  const { count: legacyPending, error: legacyError } = await supabase
    .from('subcontractor_documents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('is_current', false)
    .in('document_type_id', typeIds)

  if (legacyError) throw legacyError

  return (currentPending || 0) + (legacyPending || 0)
}
