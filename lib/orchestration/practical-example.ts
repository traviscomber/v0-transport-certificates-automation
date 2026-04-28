/**
 * Practical Implementation Example
 * Ejemplo práctico de cómo integrar el sistema de orquestación
 * con los módulos existentes del proyecto
 */

import { initializeOrchestrationSystem, OrchestrationAPI } from '@/lib/orchestration'
import {
  AlertsModule,
  DocumentsModule,
  NotificationsModule,
  ModuleReceiver,
  ModuleQuery,
  ModuleEvent,
  ModuleAction,
} from '@/lib/orchestration'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * PASO 1: Integrar con el sistema de alertas existente
 */
export class EnhancedAlertsModule extends AlertsModule {
  async processEvent(event: ModuleEvent) {
    console.log(`[EnhancedAlertsModule] Processing: ${event.type}`)

    // Procesar eventos de documentos
    if (event.type === 'document_uploaded' || event.type === 'document_validated') {
      // Generar alerta basada en documento
      const alert = this.analyzeDocument(event.payload)

      // Emitir evento de alerta generada
      const alertEvent = {
        id: `alert-${Date.now()}`,
        type: 'alert_generated',
        source: 'alerts',
        context: event.context,
        payload: alert,
        timestamp: new Date(),
        priority: alert.level === 'critical' ? 10 : 5,
      }

      // Registrar en inteligencia compartida
      const { sharedIntelligence } = await import('@/lib/orchestration')
      sharedIntelligence.recordEvent(alertEvent)

      // Notificar
      const action = {
        id: `action-${Date.now()}`,
        type: 'send_notification',
        targetModule: 'notifications',
        context: event.context,
        parameters: {
          alertType: alert.type,
          message: alert.message,
          email: event.payload.email,
        },
        status: 'pending' as const,
        timestamp: new Date(),
      }

      const { imcpHub } = await import('@/lib/orchestration')
      await imcpHub.executeAction(action)
    }
  }

  private analyzeDocument(payload: any) {
    // Lógica para analizar documento y generar alerta
    return {
      type: 'document_event',
      level: 'warning',
      message: `Documento: ${payload.fileName}`,
    }
  }
}

/**
 * PASO 2: Integrar con el sistema de documentos existente
 */
export class EnhancedDocumentsModule extends DocumentsModule {
  async processEvent(event: ModuleEvent) {
    console.log(`[EnhancedDocumentsModule] Processing: ${event.type}`)

    if (event.type === 'alert_generated') {
      // Cuando se genera una alerta, verificar documentos relacionados
      const documents = await this.getDocumentsForEntity(event.context.entityId)

      // Procesar documentos
      for (const doc of documents) {
        await this.validateDocumentExpiration(doc)
      }
    }
  }

  async query(query: ModuleQuery) {
    if (query.type === 'documents_by_entity') {
      return this.getDocumentsForEntity(query.parameters.entityId)
    }
    return super.query(query)
  }

  private async getDocumentsForEntity(entityId: string) {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_id', entityId)

    return data || []
  }

  private async validateDocumentExpiration(doc: any) {
    // Validar si documento está próximo a vencer
    const days = this.daysUntilExpiration(doc.expiration_date)

    if (days < 0) {
      // Emitir evento de documento vencido
      const { orchestrator } = await import('@/lib/orchestration')
      const event = {
        id: `event-${Date.now()}`,
        type: 'document_expired',
        source: 'documents',
        context: {
          userId: 'system',
          entityId: doc.entity_id,
          entityType: 'driver',
          entityName: doc.entity_name,
          timestamp: new Date(),
          metadata: {},
        },
        payload: {
          documentId: doc.id,
          documentType: doc.type,
          expirationDate: doc.expiration_date,
        },
        timestamp: new Date(),
        priority: 10,
      }
      orchestrator.emitEvent(event)
    }
  }

  private daysUntilExpiration(expirationDate: string): number {
    const today = new Date()
    const expiry = new Date(expirationDate)
    const diff = expiry.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }
}

/**
 * PASO 3: Integrar con el sistema de notificaciones existente
 */
export class EnhancedNotificationsModule extends NotificationsModule {
  async processEvent(event: ModuleEvent) {
    console.log(`[EnhancedNotificationsModule] Processing: ${event.type}`)

    if (event.type.includes('alert') || event.type.includes('expired')) {
      await this.sendNotification(event)
    }
  }

  private async sendNotification(event: ModuleEvent) {
    // Obtener información de contacto
    const supabase = createAdminClient()
    const { data: entity } = await supabase
      .from('transportistas')
      .select('correo, telefono')
      .eq('id', event.context.entityId)
      .single()

    if (entity?.correo) {
      // Enviar email
      await this.sendEmailNotification(
        entity.correo,
        event.context.entityName,
        event.payload
      )
    }

    if (entity?.telefono) {
      // Enviar SMS
      await this.sendSmsNotification(entity.telefono, event.context.entityName)
    }
  }

  private async sendEmailNotification(email: string, name: string, payload: any) {
    // Integrar con Resend, SendGrid, etc.
    console.log(`[Notification] Email to ${email}`)
    console.log(`Subject: Alerta importante para ${name}`)
    console.log(`Message:`, payload)
  }

  private async sendSmsNotification(phone: string, name: string) {
    // Integrar con Twilio, etc.
    console.log(`[Notification] SMS to ${phone}`)
    console.log(`Message: ${name}, tienes documentos próximos a vencer`)
  }
}

/**
 * PASO 4: Función de inicialización completa
 */
export async function setupOrchestrationSystem() {
  console.log('\n🚀 Inicializando Sistema de Orquestación Inteligente...\n')

  // Inicializar el sistema
  await initializeOrchestrationSystem()

  // Registrar módulos mejorados
  OrchestrationAPI.registerModule(new EnhancedAlertsModule())
  OrchestrationAPI.registerModule(new EnhancedDocumentsModule())
  OrchestrationAPI.registerModule(new EnhancedNotificationsModule())

  console.log('✅ Sistema de Orquestación listo!\n')
}

/**
 * PASO 5: Hook de React para usar en componentes
 */
export function useOrchestration() {
  return {
    // Emitir evento
    emitEvent: (type: string, payload: any, context?: any) => {
      OrchestrationAPI.emitEvent(type, 'documents', context || {}, payload)
    },

    // Obtener información del sistema
    getSystemStatus: () => OrchestrationAPI.getSystemStatus(),
    getInsights: () => OrchestrationAPI.getInsights(),
    getRecommendations: (entityId: string) =>
      OrchestrationAPI.getRecommendations(entityId),

    // Monitoreo
    getCommunicationStats: () => OrchestrationAPI.getCommunicationStats(),
    getRecentDecisions: (limit?: number) =>
      OrchestrationAPI.getRecentDecisions(limit),
  }
}

/**
 * PASO 6: Ejemplo de uso en componentes React
 */
export function DocumentUploadWithOrchestration() {
  const orchestration = useOrchestration()

  const handleDocumentUpload = async (file: File) => {
    // Subir documento
    const uploadedDoc = await uploadFile(file)

    // Emitir evento al sistema de orquestación
    orchestration.emitEvent(
      'document_uploaded',
      {
        fileName: file.name,
        fileSize: file.size,
        documentId: uploadedDoc.id,
        email: 'user@example.com',
      },
      {
        userId: 'user123',
        entityId: 'entity456',
        entityType: 'driver',
        entityName: 'Juan Pérez',
        timestamp: new Date(),
        metadata: { source: 'ui' },
      }
    )

    // Los módulos automáticamente:
    // 1. Analizan el documento
    // 2. Generan alertas si es necesario
    // 3. Crean notificaciones
    // 4. Registran patrones
    // 5. Hacen predicciones
  }

  return (
    <div>
      <input type="file" onChange={(e) => e.target.files && handleDocumentUpload(e.target.files[0])} />
    </div>
  )
}

/**
 * PASO 7: Monitoreo en tiempo real
 */
export async function monitorSystemHealth() {
  setInterval(() => {
    const status = OrchestrationAPI.getSystemStatus()
    const stats = OrchestrationAPI.getCommunicationStats()
    const insights = OrchestrationAPI.getInsights()

    console.log('=== System Health Check ===')
    console.log(`Modules: ${status.modules.length}`)
    console.log(`Total events: ${status.recentEvents.length}`)
    console.log(`Total requests: ${stats.totalRequests}`)
    console.log(`Average duration: ${stats.averageDuration}ms`)
    console.log(`Insights: ${insights.length}`)

    // Alertar si hay problemas
    const errors = status.modules.filter((m: any) => !m.isHealthy)
    if (errors.length > 0) {
      console.error(`⚠️ Modules with errors:`, errors)
    }
  }, 30000) // Revisar cada 30 segundos
}

/**
 * PASO 8: Integración con API existente
 */
export async function handleDocumentUploadAPI(req: any, res: any) {
  try {
    const { file, entityId, entityType } = req.body

    // Subir documento
    const uploadedDoc = await uploadToStorage(file)

    // Emitir evento al sistema de orquestación
    OrchestrationAPI.emitEvent(
      'document_uploaded',
      'documents',
      {
        userId: req.user.id,
        entityId,
        entityType,
        entityName: req.user.name,
        timestamp: new Date(),
        metadata: { source: 'api' },
      },
      {
        fileName: file.name,
        documentId: uploadedDoc.id,
        email: req.user.email,
      }
    )

    // El sistema automáticamente procesa el documento
    // y ejecuta todas las acciones necesarias

    res.json({ success: true, documentId: uploadedDoc.id })
  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
}

// Helpers
async function uploadFile(file: File) {
  return { id: 'doc-' + Date.now() }
}

async function uploadToStorage(file: any) {
  return { id: 'doc-' + Date.now() }
}

/**
 * FLUJO COMPLETO EJEMPLO
 *
 * 1. Usuario carga documento
 *    └─> API recibe documento
 *        └─> Emite evento "document_uploaded" al orquestador
 *
 * 2. Orquestador procesa evento
 *    └─> Registra en SharedIntelligence
 *        └─> Difunde a todos los módulos
 *
 * 3. Alerts Module recibe evento
 *    └─> Analiza documento
 *        └─> Genera alerta si es necesario
 *            └─> Emite evento "alert_generated"
 *
 * 4. Notifications Module recibe evento
 *    └─> Prepara notificación
 *        └─> Envía email/SMS
 *
 * 5. Documents Module recibe evento
 *    └─> Valida documento
 *        └─> Verifica vencimientos
 *            └─> Emite eventos de validación
 *
 * 6. SharedIntelligence analiza
 *    └─> Detecta patrones
 *        └─> Genera predicciones
 *            └─> Crea recomendaciones
 *
 * 7. Sistema toma decisión automática
 *    └─> Ejecuta acciones coordinadas
 *        └─> Notifica usuario
 *
 * 8. Toda la operación se registra
 *    └─> Disponible para análisis
 *        └─> Sistema aprende para mejorar
 */
