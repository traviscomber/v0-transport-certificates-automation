import { createAdminClient } from '@/lib/supabase/admin'

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  changes: Record<string, any>
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export async function logAuditEvent(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<AuditLog> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes || {},
      timestamp: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAuditLogs(
  filters?: {
    userId?: string
    entityType?: string
    action?: string
    startDate?: string
    endDate?: string
  }
): Promise<AuditLog[]> {
  const supabase = createAdminClient()
  
  let query = supabase.from('audit_logs').select('*')
  
  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.entityType) query = query.eq('entity_type', filters.entityType)
  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.startDate) query = query.gte('timestamp', filters.startDate)
  if (filters?.endDate) query = query.lte('timestamp', filters.endDate)
  
  const { data, error } = await query.order('timestamp', { ascending: false })

  if (error) throw error
  return data || []
}
