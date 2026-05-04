export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical'
export type AnomalyType = 'fraud' | 'alteration' | 'expiration' | 'invalid_format' | 'missing_data' | 'document_damage'
export type ActionTaken = 'approved' | 'rejected' | 'investigated' | 'pending'

export interface AnomalyTracking {
  id: string
  document_id: string
  anomaly_type: AnomalyType
  severity: AnomalySeverity
  description: string | null
  detected_at: string
  action_taken: ActionTaken | null
  action_taken_by: string | null
  action_taken_at: string | null
  action_notes: string | null
  raw_anomaly_data: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface AnomalyWithDetails extends AnomalyTracking {
  document_type: string
  ocr_text: string | null
  extracted_data: Record<string, any> | null
  status: string
  company_id: string
  company_name: string
  driver_name: string | null
  driver_rut: string | null
}

export interface AnomalyListResponse {
  anomalies: AnomalyWithDetails[]
  total: number
  page: number
  limit: number
}

export interface AnomalyActionPayload {
  anomaly_id: string
  action: ActionTaken
  notes?: string
}

export interface AnomalyActionResponse {
  success: boolean
  message: string
  anomaly?: AnomalyTracking
}

export interface EmailAlertPayload {
  anomaly_id: string
  recipient_email: string
  recipient_name: string
  company_name: string
  driver_name?: string
  anomaly_type: AnomalyType
  severity: AnomalySeverity
  description: string
}
