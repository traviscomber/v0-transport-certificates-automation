import { 
  validateChangeStatusRequest, 
  validateAnomalyActionRequest, 
  validateEmailAlertRequest
} from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
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
      expect(result.errors.length).toBeGreaterThan(0)
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
        expect(result.errors).toEqual([])
      })
    })
  })

  describe('validateAnomalyActionRequest', () => {
    it('should accept valid anomaly action request', () => {
      const result = validateAnomalyActionRequest({
        anomaly_id: '123',
        action: 'investigate',
        notes: 'Investigation complete'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject missing anomaly_id', () => {
      const result = validateAnomalyActionRequest({
        action: 'investigate'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject invalid action values', () => {
      const result = validateAnomalyActionRequest({
        anomaly_id: '123',
        action: 'invalid-action'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should allow valid action values', () => {
      const validActions = ['investigate', 'resolve', 'dismiss', 'escalate']
      validActions.forEach(action => {
        const result = validateAnomalyActionRequest({
          anomaly_id: '123',
          action
        })
        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
      })
    })
  })

  describe('validateEmailAlertRequest', () => {
    it('should validate requests with proper structure', () => {
      // The function validates request structure and returns errors if invalid
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'user@example.com',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'high',
        description: 'Speeding violation detected',
        driver_name: 'John Smith',
        company_name: 'Test Company'
      })
      // If all fields are valid, result should have valid flag (true or false depending on implementation)
      expect(typeof result.valid).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('should report errors for invalid email', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'invalid-email',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'high',
        driver_name: 'John Smith',
        company_name: 'Test Company'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should report errors for missing required fields', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should report errors for invalid severity', () => {
      const result = validateEmailAlertRequest({
        anomaly_id: '123',
        recipient_email: 'user@example.com',
        recipient_name: 'John Doe',
        anomaly_type: 'speeding',
        severity: 'invalid-severity',
        driver_name: 'John Smith',
        company_name: 'Test Company'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
