import {
  AnomalySeverity,
  AnomalyType,
  ActionTaken,
  AnomalyTracking,
  AnomalyWithDetails,
  AnomalyListResponse,
  AnomalyActionPayload,
} from '@/lib/anomalies/types'

describe('Anomaly Types', () => {
  describe('Type exports', () => {
    it('should have all severity levels defined', () => {
      const severities: AnomalySeverity[] = ['low', 'medium', 'high', 'critical']
      expect(severities.length).toBe(4)
    })

    it('should have all anomaly types defined', () => {
      const types: AnomalyType[] = ['fraud', 'alteration', 'expiration', 'invalid_format', 'missing_data', 'document_damage']
      expect(types.length).toBe(6)
    })

    it('should have all action types defined', () => {
      const actions: ActionTaken[] = ['approved', 'rejected', 'investigated', 'pending']
      expect(actions.length).toBe(4)
    })
  })

  describe('AnomalyTracking interface', () => {
    it('should create valid AnomalyTracking object', () => {
      const anomaly: AnomalyTracking = {
        id: '123',
        document_id: 'doc-456',
        anomaly_type: 'fraud',
        severity: 'high',
        description: 'Potential fraud detected',
        detected_at: new Date().toISOString(),
        action_taken: null,
        action_taken_by: null,
        action_taken_at: null,
        action_notes: null,
        raw_anomaly_data: { field: 'value' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      expect(anomaly.id).toBe('123')
      expect(anomaly.severity).toBe('high')
      expect(anomaly.anomaly_type).toBe('fraud')
    })
  })

  describe('AnomalyActionPayload interface', () => {
    it('should create valid action payload with required fields', () => {
      const payload: AnomalyActionPayload = {
        anomaly_id: '123',
        action: 'approved',
      }

      expect(payload.anomaly_id).toBe('123')
      expect(payload.action).toBe('approved')
      expect(payload.notes).toBeUndefined()
    })

    it('should create valid action payload with optional notes', () => {
      const payload: AnomalyActionPayload = {
        anomaly_id: '123',
        action: 'investigated',
        notes: 'Investigated and cleared',
      }

      expect(payload.notes).toBe('Investigated and cleared')
    })
  })

  describe('AnomalyListResponse interface', () => {
    it('should create valid list response', () => {
      const response: AnomalyListResponse = {
        anomalies: [],
        total: 0,
        page: 1,
        limit: 25,
      }

      expect(response.total).toBe(0)
      expect(response.page).toBe(1)
      expect(response.anomalies.length).toBe(0)
    })
  })
})
