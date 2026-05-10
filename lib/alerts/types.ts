// Enhanced Alert Types for Ejecutiva-based Filtering

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
  metadata?: Record<string, any>
  action_type?: 'approve' | 'reject' | 'request_info'
  action_notes?: string
  actioned_by?: string
  actioned_at?: string
  created_at: string
  timestamp?: Date
}

export interface AlertAction {
  id: string
  alertId: string
  type: 'approve' | 'reject' | 'request_info'
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
