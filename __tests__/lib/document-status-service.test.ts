import { validateStatus } from '@/lib/document-status-service'

describe('Document Status Service', () => {
  describe('validateStatus', () => {
    it('should validate English status values', () => {
      expect(validateStatus('approved')).toBe('approved')
      expect(validateStatus('rejected')).toBe('rejected')
      expect(validateStatus('pending')).toBe('pending')
    })

    it('should normalize Spanish status values to English', () => {
      expect(validateStatus('aprobado')).toBe('approved')
      expect(validateStatus('rechazado')).toBe('rejected')
      expect(validateStatus('pendiente')).toBe('pending')
    })

    it('should be case insensitive', () => {
      expect(validateStatus('APPROVED')).toBe('approved')
      expect(validateStatus('Pending')).toBe('pending')
      expect(validateStatus('APROBADO')).toBe('approved')
    })

    it('should handle whitespace', () => {
      expect(validateStatus('  approved  ')).toBe('approved')
      expect(validateStatus('\tpending\n')).toBe('pending')
    })

    it('should return null for invalid status values', () => {
      expect(validateStatus('invalid')).toBeNull()
      expect(validateStatus('EXPIRED')).toBeNull()
      expect(validateStatus('')).toBeNull()
      expect(validateStatus(null)).toBeNull()
      expect(validateStatus(undefined)).toBeNull()
    })

    it('should handle mixed case Spanish', () => {
      expect(validateStatus('ApRoBaDo')).toBe('approved')
      expect(validateStatus('RECHAZADO')).toBe('rejected')
      expect(validateStatus('PeNdIeNtE')).toBe('pending')
    })
  })
})
