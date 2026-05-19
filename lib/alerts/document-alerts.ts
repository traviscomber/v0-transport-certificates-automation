import { createAdminClient } from '@/lib/supabase/admin'

export type DocumentAlertType = 'DOCUMENT_UPLOADED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_EXPIRING'

interface CreateAlertParams {
  alertType: DocumentAlertType
  title: string
  description?: string
  entityType: 'document' | 'conductor' | 'subcontractor'
  entityId: string
  entityName: string
  relatedRut?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
  actionUrl?: string
}

export async function createDocumentAlert(params: CreateAlertParams) {
  try {
    const supabase = createAdminClient()

    const {
      alertType,
      title,
      description,
      entityType,
      entityId,
      entityName,
      relatedRut,
      priority = 'medium',
      actionUrl,
    } = params

    const { data, error } = await supabase
      .from('alerts_log')
      .insert({
        alert_type: alertType,
        title,
        description: description || title,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        related_rut: relatedRut,
        priority,
        action_url: actionUrl,
        is_read: false,
        is_resolved: false,
      })
      .select()

    if (error) {
      console.error('[v0] Error creating document alert:', error)
      return null
    }

    return data?.[0]
  } catch (err) {
    console.error('[v0] Exception creating document alert:', err)
    return null
  }
}

export async function getDocumentAlerts(limit = 50, offset = 0) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('alerts_log')
      .select('*')
      .in('alert_type', ['DOCUMENT_UPLOADED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED', 'DOCUMENT_EXPIRING'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[v0] Error fetching document alerts:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[v0] Exception fetching document alerts:', err)
    return []
  }
}
