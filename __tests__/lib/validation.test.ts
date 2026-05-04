import { 
  validateChangeStatusRequest, 
  validateAnomalyActionRequest, 
  validateEmailAlertRequest,
  isValidEmail 
} from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('validateChangeStatusRequest', () => {
    it('should accept valid status change request', () => {
      const result = validateChangeStatusRequest({
        status: 'approved',
        reason: 'Document verified'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject missing status', () => {
      const result = validateChangeStatusRequest({
        reason: 'No status provided'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Status is required')
    })

    it('should reject invalid status values', () => {
      const result = validateChangeStatusRequest({
        status: 'invalid-status',
        reason: 'Bad status'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should allow all valid statuses', () => {
      const validStatuses = ['approved', 'rejected', 'pending']
      validStatuses.forEach(status => {
        const result = validateChangeStatusRequest({ status })
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('validateAnomalyActionRequest', () => {
    it('should accept valid anomaly action request', () => {
      const result = validateAnomalyActionRequest({
        anomaly_id: '123',
        action: 'investigated',
        notes: 'Investigation complete'
      })
      expect(result.valid).toBe(true)
    })

    it('should reject missing anomaly_id', () => {
      const result = validateAnomalyActionRequest({
        action: 'investigated'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Anomaly ID is required')
    })

    it('should reject invalid action values', () => {
      const result = validateAnomalyActionRequest({
        anomaly_id: '123',
        action: 'invalid-action'
      })
      expect(result.valid).toBe(false)
    })

    it('should allow valid anomaly actions', () => {
      const validActions = ['approved', 'rejected', 'investigated']
      validActions.forEach(action => {
        const result = validateAnomalyActionRequest({
          anomaly_id: '123',
          action
        })
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('validateEmailAlertRequest', () => {
    it('should accept valid email alert request', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'user@example.com',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'high',
        description: 'Speeding violation detected'
      })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'invalid-email',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'high'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid email address')
    })

    it('should reject missing required fields', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123'
        // Missing other required fields
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject invalid severity', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'user@example.com',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'invalid-severity'
      })
      expect(result.valid).toBe(false)
    })
  })
})
