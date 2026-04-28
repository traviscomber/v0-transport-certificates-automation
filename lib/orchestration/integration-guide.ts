/**
 * Module Integration Guide
 * Guía de cómo integrar los módulos existentes con el nuevo sistema de orquestación
 */

import { ModuleOrchestrator, createModuleEvent, createModuleAction, ModuleContext } from './module-orchestrator'
import { SharedIntelligenceEngine } from './shared-intelligence'
import { InterModuleCommunicationHub, IModule, ModuleReceiver, ModuleQuery } from './inter-module-protocol'
import { orchestrator } from './module-orchestrator'
import { sharedIntelligence } from './shared-intelligence'
import { imcpHub } from './inter-module-protocol'

/**
 * Ejemplo: Módulo de Alertas
 * Integrado con el sistema de orquestación
 */
export class AlertsModule extends ModuleReceiver {
  name = 'alerts'
  version = '1.0.0'
  dependencies = ['documents', 'notifications']

  async processEvent(event: any) {
    console.log(`[AlertsModule] Processing event: ${event.type}`)

    // Si es un evento de documento, generar alertas
    if (event.type === 'document_uploaded' || event.type === 'document_validated') {
      // Lógica para generar alertas basadas en el documento
      const alert = this.createAlert(event)
      
      // Comunicar al módulo de notificaciones
      const action = createModuleAction(
        'send_notification',
        'notifications',
        event.context,
        {
          alertId: alert.id,
          message: alert.message,
          email: event.payload.email,
        }
      )
      
      await imcpHub.executeAction(action)
    }
  }

  async executeAction(action: any) {
    if (action.type === 'generate_alert') {
      return this.generateAlertForEntity(
        action.parameters.entityId,
        action.parameters.entityType
      )
    }
  }

  async query(query: ModuleQuery) {
    if (query.type === 'alerts_by_entity') {
      return this.getAlertsByEntity(query.parameters.entityId)
    } else if (query.type === 'critical_alerts') {
      return this.getCriticalAlerts()
    }
    throw new Error(`Unknown query type: ${query.type}`)
  }

  private createAlert(event: any) {
    return {
      id: `alert-${Date.now()}`,
      type: 'document_event',
      message: `Document ${event.payload.fileName} - ${event.type}`,
      level: 'info',
      entityId: event.context.entityId,
    }
  }

  private async generateAlertForEntity(entityId: string, entityType: string) {
    // Implementar lógica
    return { success: true }
  }

  private async getAlertsByEntity(entityId: string) {
    // Implementar lógica
    return []
  }

  private async getCriticalAlerts() {
    // Implementar lógica
    return []
  }
}

/**
 * Ejemplo: Módulo de Documentos
 * Integrado con el sistema de orquestación
 */
export class DocumentsModule extends ModuleReceiver {
  name = 'documents'
  version = '1.0.0'
  dependencies = ['alerts']

  async processEvent(event: any) {
    console.log(`[DocumentsModule] Processing event: ${event.type}`)

    if (event.type === 'alert_generated') {
      // Verificar documentos relacionados
      const documents = await this.getDocumentsForEntity(event.context.entityId)
      // Procesar documentos
    }
  }

  async executeAction(action: any) {
    if (action.type === 'validate_document') {
      return this.validateDocument(action.parameters.documentId)
    }
  }

  async query(query: ModuleQuery) {
    if (query.type === 'documents_by_entity') {
      return this.getDocumentsForEntity(query.parameters.entityId)
    } else if (query.type === 'expiring_documents') {
      return this.getExpiringDocuments(query.parameters.days || 30)
    }
    throw new Error(`Unknown query type: ${query.type}`)
  }

  private async getDocumentsForEntity(entityId: string) {
    // Implementar lógica
    return []
  }

  private async validateDocument(documentId: string) {
    // Implementar lógica
    return { valid: true }
  }

  private async getExpiringDocuments(days: number) {
    // Implementar lógica
    return []
  }
}

/**
 * Ejemplo: Módulo de Notificaciones
 * Integrado con el sistema de orquestación
 */
export class NotificationsModule extends ModuleReceiver {
  name = 'notifications'
  version = '1.0.0'
  dependencies = []

  async processEvent(event: any) {
    console.log(`[NotificationsModule] Processing event: ${event.type}`)

    if (event.type.includes('alert')) {
      // Enviar notificación
      await this.sendNotification(event.context, event.payload)
    }
  }

  async executeAction(action: any) {
    if (action.type === 'send_notification') {
      return this.sendNotificationAction(action.parameters)
    }
  }

  async query(query: ModuleQuery) {
    if (query.type === 'notification_status') {
      return this.getNotificationStatus(query.parameters.notificationId)
    }
    throw new Error(`Unknown query type: ${query.type}`)
  }

  private async sendNotification(context: ModuleContext, payload: any) {
    // Implementar lógica de envío
    console.log(`Sending notification to ${context.entityName}`)
  }

  private async sendNotificationAction(parameters: any) {
    return { success: true, notificationId: `notif-${Date.now()}` }
  }

  private async getNotificationStatus(notificationId: string) {
    return { status: 'sent' }
  }
}

/**
 * Flujo de ejemplo: Cómo los módulos trabajan juntos
 */
export async function demonstrateModuleIntegration() {
  console.log('\n=== Module Integration Demonstration ===\n')

  // 1. Registrar módulos en el hub
  console.log('1. Registering modules...')
  imcpHub.registerModule(new AlertsModule())
  imcpHub.registerModule(new DocumentsModule())
  imcpHub.registerModule(new NotificationsModule())

  // 2. Crear un contexto de ejemplo
  const context: ModuleContext = {
    userId: 'user123',
    entityId: 'entity456',
    entityType: 'driver',
    entityName: 'Juan Pérez',
    timestamp: new Date(),
    metadata: { source: 'demo' },
  }

  // 3. El módulo de documentos emite un evento
  console.log('\n2. Documents module emits an event...')
  const docEvent = createModuleEvent(
    'document_uploaded',
    'documents',
    context,
    {
      fileName: 'licencia_conducir.pdf',
      type: 'driver_license',
    }
  )

  // Registrar en inteligencia compartida
  sharedIntelligence.recordEvent(docEvent)

  // Difundir evento a otros módulos
  await imcpHub.broadcastEvent(docEvent)

  // 4. Consultar información de otros módulos
  console.log('\n3. Querying other modules...')
  const alertsResponse = await imcpHub.queryModule('alerts', {
    type: 'alerts_by_entity',
    parameters: { entityId: context.entityId },
  })

  const docsResponse = await imcpHub.queryModule('documents', {
    type: 'documents_by_entity',
    parameters: { entityId: context.entityId },
  })

  console.log('Alerts response:', alertsResponse)
  console.log('Documents response:', docsResponse)

  // 5. Ejecutar acciones coordinadas
  console.log('\n4. Executing coordinated actions...')
  const action = createModuleAction(
    'generate_alert',
    'alerts',
    context,
    { entityId: context.entityId, entityType: context.entityType }
  )

  await imcpHub.executeAction(action)

  // 6. Obtener inteligencia compartida
  console.log('\n5. Shared Intelligence insights...')
  const insights = sharedIntelligence.generateInsights()
  console.log('Insights:', insights)

  const recommendations = sharedIntelligence.getSmartRecommendations(context.entityId)
  console.log('Recommendations:', recommendations)

  // 7. Estadísticas de comunicación
  console.log('\n6. Communication Statistics...')
  const stats = imcpHub.getCommunicationStats()
  console.log('Stats:', JSON.stringify(stats, null, 2))
}

/**
 * Guía de implementación para un nuevo módulo
 */
export const IMPLEMENTATION_GUIDE = `
=== Guía de Implementación de Módulos ===

1. CREAR UN NUEVO MÓDULO:
   - Extender la clase ModuleReceiver
   - Implementar métodos: processEvent, executeAction, query
   - Definir name, version, dependencies

2. REGISTRAR EL MÓDULO:
   imcpHub.registerModule(new MiModulo())

3. RECIBIR EVENTOS:
   async processEvent(event: ModuleEvent) {
     if (event.type === 'mi_tipo_evento') {
       // Procesar evento
     }
   }

4. EJECUTAR ACCIONES:
   async executeAction(action: ModuleAction) {
     if (action.type === 'mi_accion') {
       // Ejecutar acción
       return resultado
     }
   }

5. RESPONDER CONSULTAS:
   async query(query: ModuleQuery) {
     if (query.type === 'mi_consulta') {
       return datos
     }
   }

6. COMUNICARSE CON OTROS MÓDULOS:
   // Enviar evento
   await imcpHub.broadcastEvent(evento)
   
   // Ejecutar acción en otro módulo
   await imcpHub.executeAction(accion)
   
   // Consultar información
   const resultado = await imcpHub.queryModule('nombre_modulo', consulta)

7. REGISTRAR EN INTELIGENCIA COMPARTIDA:
   sharedIntelligence.recordEvent(evento)

8. OBTENER RECOMENDACIONES INTELIGENTES:
   const recomendaciones = sharedIntelligence.getSmartRecommendations(entityId)
`

/**
 * Flujo típico de un sistema integrado
 */
export const TYPICAL_WORKFLOW = `
=== Flujo Típico del Sistema Integrado ===

1. USUARIO CARGA UN DOCUMENTO
   Documents Module → emite evento "document_uploaded"

2. ORQUESTADOR RECIBE EVENTO
   Orchestrator → registra en SharedIntelligence
   Orchestrator → difunde a otros módulos

3. ALERTS MODULE PROCESA
   Alerts → detecta vencimiento próximo
   Alerts → emite evento "alert_generated"

4. NOTIFICATIONS MODULE RESPONDE
   Notifications → recibe evento "alert_generated"
   Notifications → prepara notificación

5. SHARED INTELLIGENCE ANALIZA
   SharedIntelligence → detecta patrones
   SharedIntelligence → genera predicciones
   SharedIntelligence → crea recomendaciones

6. SISTEMA TOMA DECISIÓN
   Orchestrator → recibe insights de SharedIntelligence
   Orchestrator → ejecuta acciones automáticas
   Orchestrator → envía notificación al usuario

7. HISTÓRICO SE REGISTRA
   ImcpHub → registra todas las comunicaciones
   ImcpHub → estadísticas disponibles para análisis
`
