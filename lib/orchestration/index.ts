/**
 * Orchestration System - Entry Point
 * Punto de entrada para todo el sistema de orquestación inteligente
 */

// Module Orchestrator
export {
  ModuleOrchestrator,
  orchestrator,
  createModuleEvent,
  createModuleAction,
  type ModuleContext,
  type ModuleEvent,
  type ModuleAction,
  type ModuleState,
  type SystemDecision,
} from './module-orchestrator'

// Shared Intelligence
export {
  SharedIntelligenceEngine,
  sharedIntelligence,
  type BehaviorPattern,
  type EventCorrelation,
  type Prediction,
  type KnowledgeBase,
} from './shared-intelligence'

// Inter-Module Communication Protocol
export {
  InterModuleCommunicationHub,
  ModuleReceiver,
  imcpHub,
  TrackedCall,
  type IModule,
  type ModuleQuery,
  type ModuleResponse,
  type CallContext,
} from './inter-module-protocol'

// Integration Guide
export {
  AlertsModule,
  DocumentsModule,
  NotificationsModule,
  demonstrateModuleIntegration,
  IMPLEMENTATION_GUIDE,
  TYPICAL_WORKFLOW,
} from './integration-guide'

/**
 * Sistema de Orquestación Inteligente Completo
 * 
 * Este sistema permite que todos los módulos del sistema trabajen juntos de forma coordinada:
 * 
 * 1. MODULE ORCHESTRATOR
 *    - Coordina eventos entre módulos
 *    - Ejecuta acciones de forma ordenada
 *    - Procesa decisiones automáticas
 * 
 * 2. SHARED INTELLIGENCE ENGINE
 *    - Detecta patrones de comportamiento
 *    - Identifica correlaciones entre eventos
 *    - Genera predicciones inteligentes
 *    - Proporciona recomendaciones
 * 
 * 3. INTER-MODULE COMMUNICATION HUB
 *    - Interfaz estándar para módulos
 *    - Enrutamiento de eventos
 *    - Ejecución de acciones remotas
 *    - Consultas inter-módulos
 * 
 * FLUJO DE FUNCIONAMIENTO:
 * 
 * Documento Cargado
 *   ↓
 * Módulo de Documentos emite evento
 *   ↓
 * IMCP Hub difunde a otros módulos
 *   ↓
 * SharedIntelligence registra evento
 *   ↓
 * Orchestrator analiza con SharedIntelligence
 *   ↓
 * Se genera decisión inteligente
 *   ↓
 * Acción automática: generar alerta + notificar
 *   ↓
 * Otros módulos responden
 *   ↓
 * Sistema aprende del patrón
 */

import { orchestrator, ModuleEvent, ModuleContext } from './module-orchestrator'
import { sharedIntelligence } from './shared-intelligence'
import { imcpHub } from './inter-module-protocol'

/**
 * Inicializa todo el sistema de orquestación
 */
export async function initializeOrchestrationSystem() {
  console.log('🚀 Initializing Intelligent Module Orchestration System...\n')

  try {
    console.log('✓ Module Orchestrator initialized')
    console.log('✓ Shared Intelligence Engine initialized')
    console.log('✓ Inter-Module Communication Hub initialized')

    console.log('\n📋 System ready with following capabilities:')
    console.log('  • Real-time event broadcasting between modules')
    console.log('  • Intelligent decision making based on patterns')
    console.log('  • Automatic action execution and coordination')
    console.log('  • Module communication protocol (IMCP)')
    console.log('  • Behavior pattern detection and analysis')
    console.log('  • Smart predictions and recommendations')
    console.log('  • Complete communication history and statistics')

    return true
  } catch (error) {
    console.error('❌ Error initializing orchestration system:', error)
    return false
  }
}

/**
 * API pública simplificada para usar el sistema
 */
export const OrchestrationAPI = {
  /**
   * Emitir un evento desde un módulo
   */
  emitEvent(
    type: string,
    source: 'alerts' | 'documents' | 'compliance' | 'notifications',
    context: ModuleContext,
    payload: any,
    priority = 5
  ) {
    const event: ModuleEvent = {
      id: `evt-${Date.now()}`,
      type,
      source,
      context,
      payload,
      timestamp: new Date(),
      priority,
    }
    orchestrator.emitEvent(event)
    return event
  },

  /**
   * Registrar un módulo
   */
  registerModule(module: any) {
    imcpHub.registerModule(module)
  },

  /**
   * Enviar evento a módulo específico
   */
  async sendEventToModule(targetModule: string, event: ModuleEvent) {
    return await imcpHub.sendEvent(targetModule, event)
  },

  /**
   * Ejecutar acción en módulo
   */
  async executeAction(action: any) {
    return await imcpHub.executeAction(action)
  },

  /**
   * Consultar módulo
   */
  async queryModule(targetModule: string, query: any) {
    return await imcpHub.queryModule(targetModule, query)
  },

  /**
   * Obtener status del sistema
   */
  getSystemStatus() {
    return orchestrator.getSystemStatus()
  },

  /**
   * Obtener base de conocimiento compartida
   */
  getKnowledgeBase() {
    return sharedIntelligence.getKnowledgeBase()
  },

  /**
   * Obtener insights inteligentes
   */
  getInsights() {
    return sharedIntelligence.generateInsights()
  },

  /**
   * Obtener recomendaciones para una entidad
   */
  getRecommendations(entityId: string) {
    return sharedIntelligence.getSmartRecommendations(entityId)
  },

  /**
   * Obtener estadísticas de comunicación
   */
  getCommunicationStats() {
    return imcpHub.getCommunicationStats()
  },

  /**
   * Obtener decisiones recientes
   */
  getRecentDecisions(limit = 10) {
    return orchestrator.getRecentDecisions(limit)
  },

  /**
   * Obtener historial de comunicaciones
   */
  getCommunicationHistory(limit = 100) {
    return imcpHub.getRequestHistory(limit)
  },
}

/**
 * Ejemplo de uso del API
 */
export const USAGE_EXAMPLE = `
=== Ejemplos de Uso del Sistema de Orquestación ===

// 1. Inicializar el sistema
import { initializeOrchestrationSystem, OrchestrationAPI } from '@/lib/orchestration'
await initializeOrchestrationSystem()

// 2. Emitir un evento
OrchestrationAPI.emitEvent(
  'document_uploaded',
  'documents',
  {
    userId: 'user123',
    entityId: 'driver456',
    entityType: 'driver',
    entityName: 'Juan Pérez',
    timestamp: new Date(),
    metadata: {}
  },
  { fileName: 'licencia.pdf', type: 'driver_license' }
)

// 3. Consultar información de un módulo
const alerts = await OrchestrationAPI.queryModule('alerts', {
  type: 'alerts_by_entity',
  parameters: { entityId: 'driver456' }
})

// 4. Obtener inteligencia compartida
const insights = OrchestrationAPI.getInsights()
const recommendations = OrchestrationAPI.getRecommendations('driver456')

// 5. Monitorear el sistema
const status = OrchestrationAPI.getSystemStatus()
const stats = OrchestrationAPI.getCommunicationStats()
const decisions = OrchestrationAPI.getRecentDecisions()

// 6. Registrar un nuevo módulo
OrchestrationAPI.registerModule(new MiModulo())

// 7. Ejecutar una acción coordinada
await OrchestrationAPI.executeAction({
  id: 'action123',
  type: 'send_notification',
  targetModule: 'notifications',
  context: context,
  parameters: {
    email: 'user@example.com',
    message: 'Tu documento está próximo a vencer'
  },
  status: 'pending',
  timestamp: new Date()
})
`
