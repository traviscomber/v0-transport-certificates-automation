/**
 * Shared Intelligence System - Sistema de Inteligencia Compartida
 * Permite que los módulos aprendan del comportamiento del sistema
 * y tomen decisiones más inteligentes en colaboración
 */

import { Alert } from '@/lib/operations/alert-system'
import { SmartAlert } from '@/lib/smart-alerts-generator'
import { ModuleEvent, SystemDecision, ModuleContext } from './module-orchestrator'

/**
 * Patrón de comportamiento del sistema
 */
export interface BehaviorPattern {
  id: string
  type: string // 'alert_surge', 'document_expiration_cycle', 'compliance_improvement'
  frequency: number // qué tan a menudo ocurre
  entities: string[] // entidades afectadas
  timeRange: { start: Date; end: Date }
  confidence: number // 0-100
  metadata: Record<string, any>
}

/**
 * Correlación entre eventos
 */
export interface EventCorrelation {
  eventType1: string
  eventType2: string
  occurrencesTogether: number
  totalOccurrences: number
  correlation: number // -1 to 1
  causality?: 'event1_causes_event2' | 'event2_causes_event1' | 'independent'
}

/**
 * Predicción del sistema
 */
export interface Prediction {
  id: string
  type: string // 'document_expiration', 'compliance_issue', 'operational_risk'
  entityId: string
  entityName: string
  probability: number // 0-100
  timeFrame: string // '7_days', '30_days', 'immediate'
  recommendation: string
  confidence: number
  timestamp: Date
}

/**
 * Base de conocimiento compartida
 */
export interface KnowledgeBase {
  patterns: BehaviorPattern[]
  correlations: EventCorrelation[]
  predictions: Prediction[]
  insights: string[]
  lastUpdated: Date
}

/**
 * Motor de análisis de inteligencia compartida
 */
export class SharedIntelligenceEngine {
  private patterns: Map<string, BehaviorPattern> = new Map()
  private correlations: EventCorrelation[] = []
  private predictions: Prediction[] = []
  private insights: string[] = []
  private eventHistory: ModuleEvent[] = []
  private maxHistorySize = 5000

  /**
   * Registra un evento en el historial
   */
  recordEvent(event: ModuleEvent) {
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Analizar el evento para generar patrones
    this.analyzeForPatterns()
    this.analyzeForCorrelations()
    this.generatePredictions()
  }

  /**
   * Analiza el historial para detectar patrones
   */
  private analyzeForPatterns() {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Patrones de ráfagas de alertas
    const recentAlerts = this.eventHistory.filter(
      e => e.type.includes('alert') && e.timestamp > oneWeekAgo
    )

    if (recentAlerts.length > 10) {
      const pattern: BehaviorPattern = {
        id: `pattern-alert-surge-${Date.now()}`,
        type: 'alert_surge',
        frequency: recentAlerts.length,
        entities: [...new Set(recentAlerts.map(e => e.context.entityId))],
        timeRange: { start: oneWeekAgo, end: now },
        confidence: Math.min(recentAlerts.length * 5, 95),
        metadata: {
          alertTypes: [...new Set(recentAlerts.map(e => e.type))],
          averagePerDay: (recentAlerts.length / 7).toFixed(1),
        },
      }
      this.patterns.set(pattern.id, pattern)
    }

    // Patrones cíclicos de vencimiento de documentos
    const expirationEvents = this.eventHistory.filter(e =>
      e.type.includes('expir')
    )

    if (expirationEvents.length > 5) {
      // Analizar distribución temporal
      const dayOfMonth = expirationEvents.map(e =>
        new Date(e.timestamp).getDate()
      )
      const clustering = this.detectClustering(dayOfMonth)

      if (clustering > 0.7) {
        const pattern: BehaviorPattern = {
          id: `pattern-expiration-cycle-${Date.now()}`,
          type: 'document_expiration_cycle',
          frequency: expirationEvents.length,
          entities: [...new Set(expirationEvents.map(e => e.context.entityId))],
          timeRange: { start: oneWeekAgo, end: now },
          confidence: clustering * 100,
          metadata: {
            clusterDay: Math.round(dayOfMonth.reduce((a, b) => a + b) / dayOfMonth.length),
            variance: this.calculateVariance(dayOfMonth),
          },
        }
        this.patterns.set(pattern.id, pattern)
      }
    }
  }

  /**
   * Analiza correlaciones entre eventos
   */
  private analyzeForCorrelations() {
    const eventTypes = [...new Set(this.eventHistory.map(e => e.type))]

    // Buscar correlaciones entre pares de eventos
    for (let i = 0; i < eventTypes.length; i++) {
      for (let j = i + 1; j < eventTypes.length; j++) {
        const type1 = eventTypes[i]
        const type2 = eventTypes[j]

        const eventsType1 = this.eventHistory.filter(e => e.type === type1)
        const eventsType2 = this.eventHistory.filter(e => e.type === type2)

        // Calcular co-ocurrencia temporal (dentro de 1 hora)
        let coOccurrence = 0
        const oneHourMs = 60 * 60 * 1000

        for (const e1 of eventsType1) {
          for (const e2 of eventsType2) {
            if (Math.abs(e1.timestamp.getTime() - e2.timestamp.getTime()) < oneHourMs) {
              coOccurrence++
            }
          }
        }

        if (coOccurrence > 0) {
          const correlation =
            coOccurrence / Math.max(eventsType1.length, eventsType2.length)

          if (correlation > 0.3) {
            this.correlations.push({
              eventType1: type1,
              eventType2: type2,
              occurrencesTogether: coOccurrence,
              totalOccurrences: Math.max(eventsType1.length, eventsType2.length),
              correlation,
            })
          }
        }
      }
    }

    // Limitar el tamaño de correlaciones
    this.correlations = this.correlations.slice(-100)
  }

  /**
   * Genera predicciones basadas en patrones y correlaciones
   */
  private generatePredictions() {
    this.predictions = []

    // Predecir próximos vencimientos
    const expirationPattern = Array.from(this.patterns.values()).find(
      p => p.type === 'document_expiration_cycle'
    )

    if (expirationPattern) {
      const clusterDay = expirationPattern.metadata.clusterDay
      const today = new Date().getDate()
      const daysUntilCluster =
        clusterDay > today ? clusterDay - today : 30 - today + clusterDay

      for (const entityId of expirationPattern.entities) {
        const prediction: Prediction = {
          id: `pred-${Date.now()}-${Math.random()}`,
          type: 'document_expiration',
          entityId,
          entityName: `Entity ${entityId}`,
          probability: expirationPattern.confidence,
          timeFrame: daysUntilCluster <= 7 ? '7_days' : '30_days',
          recommendation: `Preparar renovación de documentos en los próximos ${daysUntilCluster} días`,
          confidence: expirationPattern.confidence,
          timestamp: new Date(),
        }
        this.predictions.push(prediction)
      }
    }

    // Predecir problemas de cumplimiento
    const alertSurgePattern = Array.from(this.patterns.values()).find(
      p => p.type === 'alert_surge'
    )

    if (alertSurgePattern) {
      const alertTypes = alertSurgePattern.metadata.alertTypes

      if (alertTypes.includes('COMPLIANCE_SCORE_LOW')) {
        for (const entityId of alertSurgePattern.entities) {
          const prediction: Prediction = {
            id: `pred-${Date.now()}-${Math.random()}`,
            type: 'compliance_issue',
            entityId,
            entityName: `Entity ${entityId}`,
            probability: Math.min(alertSurgePattern.confidence * 1.2, 100),
            timeFrame: 'immediate',
            recommendation: 'Revisar urgentemente estado de cumplimiento',
            confidence: alertSurgePattern.confidence,
            timestamp: new Date(),
          }
          this.predictions.push(prediction)
        }
      }
    }
  }

  /**
   * Genera insights basados en patrones y correlaciones
   */
  generateInsights(): string[] {
    this.insights = []

    // Insight sobre patrones detectados
    const patterns = Array.from(this.patterns.values())
    if (patterns.length > 0) {
      const highConfidencePatterns = patterns.filter(p => p.confidence > 80)
      if (highConfidencePatterns.length > 0) {
        this.insights.push(
          `Se detectaron ${highConfidencePatterns.length} patrones de alta confianza en el sistema`
        )
      }
    }

    // Insight sobre correlaciones
    const strongCorrelations = this.correlations.filter(c => c.correlation > 0.6)
    if (strongCorrelations.length > 0) {
      for (const corr of strongCorrelations.slice(0, 3)) {
        this.insights.push(
          `${corr.eventType1} está fuertemente correlacionado con ${corr.eventType2} (${(corr.correlation * 100).toFixed(0)}% de las veces)`
        )
      }
    }

    // Insight sobre tendencias
    const recentAlerts = this.eventHistory
      .filter(e => e.type.includes('alert'))
      .slice(-50)

    if (recentAlerts.length > 20) {
      const criticalCount = recentAlerts.filter(
        e => e.payload?.level === 'critical'
      ).length

      if (criticalCount > recentAlerts.length * 0.3) {
        this.insights.push(
          `⚠️ Mayor número de alertas críticas detectado en los últimos eventos (${((criticalCount / recentAlerts.length) * 100).toFixed(0)}%)`
        )
      }
    }

    // Insight sobre predicciones
    if (this.predictions.length > 0) {
      const highProbabilityPredictions = this.predictions.filter(
        p => p.probability > 75
      )
      if (highProbabilityPredictions.length > 0) {
        this.insights.push(
          `${highProbabilityPredictions.length} eventos de alto riesgo predichos para los próximos días`
        )
      }
    }

    return this.insights
  }

  /**
   * Recomendaciones inteligentes basadas en inteligencia compartida
   */
  getSmartRecommendations(entityId: string): string[] {
    const recommendations: string[] = []

    // Basado en patrones
    const entityPatterns = Array.from(this.patterns.values()).filter(p =>
      p.entities.includes(entityId)
    )

    for (const pattern of entityPatterns) {
      if (pattern.type === 'document_expiration_cycle') {
        recommendations.push(
          '📅 Implementar calendario de renovación automática para anticipar ciclos de vencimiento'
        )
      } else if (pattern.type === 'alert_surge') {
        recommendations.push(
          '🔔 Revisar raíz de ráfagas de alertas para identificar problemas sistémicos'
        )
      }
    }

    // Basado en predicciones
    const entityPredictions = this.predictions.filter(p => p.entityId === entityId)
    for (const pred of entityPredictions) {
      if (pred.probability > 70) {
        recommendations.push(`⚡ URGENTE: ${pred.recommendation}`)
      } else {
        recommendations.push(`💡 ${pred.recommendation}`)
      }
    }

    return recommendations
  }

  /**
   * Obtiene la base de conocimiento actual
   */
  getKnowledgeBase(): KnowledgeBase {
    return {
      patterns: Array.from(this.patterns.values()),
      correlations: this.correlations,
      predictions: this.predictions,
      insights: this.insights,
      lastUpdated: new Date(),
    }
  }

  /**
   * Detección de clustering de fechas
   */
  private detectClustering(values: number[]): number {
    if (values.length < 2) return 0
    const mean = values.reduce((a, b) => a + b) / values.length
    const variance = this.calculateVariance(values)
    return 1 - Math.min(variance / 225, 1) // normalizar a 0-1
  }

  /**
   * Calcula varianza
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0
    const mean = values.reduce((a, b) => a + b) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b) / values.length
  }
}

// Instancia singleton
export const sharedIntelligence = new SharedIntelligenceEngine()
