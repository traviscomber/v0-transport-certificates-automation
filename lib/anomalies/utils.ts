import { createClient } from '@supabase/supabase-js'
import { AnomalyWithDetails, AnomalyListResponse, AnomalySeverity } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAnomalies(
  companyId: string,
  filters?: {
    severity?: AnomalySeverity
    actionTaken?: string | null
    limit?: number
    page?: number
  }
): Promise<AnomalyListResponse> {
  const limit = filters?.limit || 25
  const page = filters?.page || 1
  const offset = (page - 1) * limit

  let query = supabase
    .from('anomalies_with_document_details')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('detected_at', { ascending: false })

  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.actionTaken !== undefined) {
    if (filters.actionTaken === null) {
      query = query.is('action_taken', null)
    } else {
      query = query.eq('action_taken', filters.actionTaken)
    }
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[v0] Error fetching anomalies:', error)
    throw error
  }

  return {
    anomalies: (data || []) as AnomalyWithDetails[],
    total: count || 0,
    page,
    limit,
  }
}

export async function getAnomalyById(anomalyId: string): Promise<AnomalyWithDetails | null> {
  const { data, error } = await supabase
    .from('anomalies_with_document_details')
    .select('*')
    .eq('id', anomalyId)
    .single()

  if (error) {
    console.error('[v0] Error fetching anomaly:', error)
    return null
  }

  return data as AnomalyWithDetails
}

export async function getAnomaliesByDocumentId(documentId: string) {
  const { data, error } = await supabase
    .from('anomaly_tracking')
    .select('*')
    .eq('document_id', documentId)
    .order('detected_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching anomalies for document:', error)
    return []
  }

  return data || []
}

export function getSeverityColor(severity: AnomalySeverity): string {
  const colors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  }
  return colors[severity]
}

export function getSeverityBadgeColor(severity: AnomalySeverity): string {
  const colors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  }
  return colors[severity]
}

export function getAnomalyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fraud: 'Fraude Detectado',
    alteration: 'Documento Alterado',
    expiration: 'Documento Vencido',
    invalid_format: 'Formato Inválido',
    missing_data: 'Datos Faltantes',
    document_damage: 'Documento Dañado',
  }
  return labels[type] || type
}
