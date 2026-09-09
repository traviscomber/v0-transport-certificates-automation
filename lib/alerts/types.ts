// Canonical alert contracts for the authenticated company workspace.

export interface Alert {
  id: string
  transportista_id?: string
  subcontratista_id?: string
  ejecutiva_nombre?: string
  status: 'pendiente' | 'actioned' | 'resuelto'
  type: string
  title: string
  message: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category?: string
  is_read: boolean
  is_dismissed: boolean
  action_url?: string
  document_id?: string
  document_type?: string
  driver_id?: string
  entity_name?: string
  source?: 'alerts_log' | 'alerts_legacy' | string
  metadata?: Record<string, any>
  // Legacy values remain readable for historical rows; new alert actions use
  // resolve/request_info and never mutate document approval state.
  action_type?: 'approve' | 'reject' | 'request_info' | 'resolve'
  action_notes?: string
  actioned_by?: string
  actioned_at?: string
  created_at: string
  timestamp?: Date
}

export interface AlertAction {
  id: string
  alertId: string
  type: 'request_info' | 'resolve'
  notes: string
  executivaName: string
  createdAt: string
}

export interface AlertSummary {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  unread: number
  byEjecutiva?: Record<string, number>
}

export interface AlertFilterOptions {
  ejecutiva?: string
  status?: 'pendiente' | 'actioned' | 'resuelto'
  priority?: 'critical' | 'high' | 'medium' | 'low'
  category?: string
  search?: string
}
