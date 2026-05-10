import { getSeverityColor, getSeverityBadgeColor, getAnomalyTypeLabel } from '@/lib/anomalies/utils'
import { AnomalySeverity, AnomalyType } from '@/lib/anomalies/types'

describe('Anomaly Utils', () => {
  describe('getSeverityColor', () => {
    it('should return correct color for low severity', () => {
      expect(getSeverityColor('low')).toContain('bg-blue')
      expect(getSeverityColor('low')).toContain('text-blue')
    })

    it('should return correct color for medium severity', () => {
      expect(getSeverityColor('medium')).toContain('bg-yellow')
      expect(getSeverityColor('medium')).toContain('text-yellow')
    })

    it('should return correct color for high severity', () => {
      expect(getSeverityColor('high')).toContain('bg-orange')
      expect(getSeverityColor('high')).toContain('text-orange')
    })

    it('should return correct color for critical severity', () => {
      expect(getSeverityColor('critical')).toContain('bg-red')
      expect(getSeverityColor('critical')).toContain('text-red')
    })

    it('should include border color class', () => {
      const severities: AnomalySeverity[] = ['low', 'medium', 'high', 'critical']
      severities.forEach(severity => {
        expect(getSeverityColor(severity)).toContain('border')
      })
    })
  })

  describe('getSeverityBadgeColor', () => {
    it('should return correct badge color for all severities', () => {
      expect(getSeverityBadgeColor('low')).toBe('bg-blue-500')
      expect(getSeverityBadgeColor('medium')).toBe('bg-yellow-500')
      expect(getSeverityBadgeColor('high')).toBe('bg-orange-500')
      expect(getSeverityBadgeColor('critical')).toBe('bg-red-500')
    })
  })

  describe('getAnomalyTypeLabel', () => {
    it('should return Spanish labels for known anomaly types', () => {
      expect(getAnomalyTypeLabel('fraud')).toBe('Fraude Detectado')
      expect(getAnomalyTypeLabel('alteration')).toBe('Documento Alterado')
      expect(getAnomalyTypeLabel('expiration')).toBe('Documento Vencido')
      expect(getAnomalyTypeLabel('invalid_format')).toBe('Formato Inválido')
      expect(getAnomalyTypeLabel('missing_data')).toBe('Datos Faltantes')
      expect(getAnomalyTypeLabel('document_damage')).toBe('Documento Dañado')
    })

    it('should return original type for unknown anomalies', () => {
      expect(getAnomalyTypeLabel('unknown_type')).toBe('unknown_type')
    })

    it('should handle empty string gracefully', () => {
      expect(getAnomalyTypeLabel('')).toBe('')
    })

    it('should handle all AnomalyType values', () => {
      const types: AnomalyType[] = ['fraud', 'alteration', 'expiration', 'invalid_format', 'missing_data', 'document_damage']
      types.forEach(type => {
        const label = getAnomalyTypeLabel(type)
        expect(label).toBeTruthy()
        expect(label.length > 0).toBe(true)
      })
    })
  })
})
