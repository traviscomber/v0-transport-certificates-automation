'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface AlertEvent {
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  entityType?: 'driver' | 'subcontractor' | 'document' | 'system'
  entityId?: string
  entityName?: string
  actionUrl?: string
}

/**
 * Registra un evento de alerta en el sistema
 * Se puede llamar desde cualquier endpoint para registrar eventos importantes
 */
export async function logAlert(event: AlertEvent) {
  try {
    console.log('[v0] 🔔 Alert triggered:', {
      type: event.type,
      title: event.title,
      entity: event.entityType,
      timestamp: new Date().toISOString(),
    })

    // Guardar en la tabla de alertas en Supabase
    const adminClient = await createAdminClient()
    
    // Construir mensaje descriptivo
    const message = event.description || event.title
    
    // Construir metadata si hay información adicional
    const metadata = {
      entityType: event.entityType,
      entityId: event.entityId,
      entityName: event.entityName,
    }

    // Mapear el tipo de alerta a prioridad
    const priorityMap: Record<string, string> = {
      'error': 'high',
      'warning': 'normal',
      'success': 'normal',
      'info': 'low'
    }

    const alertData = {
      title: event.title,
      message: message,
      type: event.type,
      category: event.entityType || 'general',
      priority: priorityMap[event.type] || 'normal',
      action_url: event.actionUrl || null,
      metadata: metadata,
      is_read: false,
      organization_id: '00000000-0000-0000-0000-000000000000' // Default org
    }

    console.log('[v0] Saving alert to database:', alertData)

    const { data, error } = await adminClient
      .from('alerts_log')
      .insert([alertData])
      .select()

    if (error) {
      console.error('[v0] Error saving alert to database:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log('[v0] ✅ Alert saved successfully to database')

    return {
      success: true,
      event,
      timestamp: new Date(),
      savedAlert: data?.[0]
    }
  } catch (error) {
    console.error('[v0] ❌ Exception in logAlert:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Dispara una alerta cuando un documento es subido
 */
export async function triggerDocumentUploadedAlert(driverId: string, fileName: string, driverName?: string) {
  return logAlert({
    type: 'success',
    title: 'Documento subido',
    description: `${driverName || 'Un conductor'} ha subido un nuevo documento: ${fileName}`,
    entityType: 'document',
    entityId: driverId,
    entityName: driverName,
    actionUrl: `/dashboard/company/conductores?search=${encodeURIComponent(driverName || '')}`,
  })
}

/**
 * Dispara una alerta cuando un documento es aprobado
 */
export async function triggerDocumentApprovedAlert(driverId: string, documentType: string, driverName?: string) {
  return logAlert({
    type: 'success',
    title: 'Documento aprobado',
    description: `El documento "${documentType}" de ${driverName || 'un conductor'} ha sido aprobado correctamente`,
    entityType: 'document',
    entityId: driverId,
    entityName: driverName,
    actionUrl: `/dashboard/company/conductores?search=${encodeURIComponent(driverName || '')}`,
  })
}

/**
 * Dispara una alerta cuando un documento es rechazado
 */
export async function triggerDocumentRejectedAlert(driverId: string, documentType: string, reason: string, driverName?: string) {
  return logAlert({
    type: 'error',
    title: 'Documento rechazado',
    description: `El documento "${documentType}" de ${driverName || 'un conductor'} fue rechazado. Razón: ${reason}`,
    entityType: 'document',
    entityId: driverId,
    entityName: driverName,
    actionUrl: `/dashboard/company/conductores?search=${encodeURIComponent(driverName || '')}`,
  })
}

/**
 * Dispara una alerta cuando está próximo a vencer un documento
 */
export async function triggerDocumentExpiringAlert(documentType: string, daysUntilExpiry: number) {
  return logAlert({
    type: daysUntilExpiry <= 7 ? 'error' : 'warning',
    title: `${documentType} próximo a vencer (${daysUntilExpiry} días)`,
    description: `Hay documentos de tipo "${documentType}" que vencen en ${daysUntilExpiry} días. Requiere atención urgente.`,
    entityType: 'document',
    actionUrl: `/dashboard/company/reportes`,
  })
}

/**
 * Dispara una alerta cuando un conductor es agregado al sistema
 */
export async function triggerDriverAddedAlert(driverName: string, driverId: string) {
  return logAlert({
    type: 'info',
    title: 'Nuevo conductor agregado',
    description: `${driverName} ha sido agregado al sistema como nuevo conductor`,
    entityType: 'driver',
    entityId: driverId,
    entityName: driverName,
    actionUrl: `/dashboard/company/conductores?search=${encodeURIComponent(driverName)}`,
  })
}

/**
 * Dispara una alerta cuando el estado de un documento cambia
 */
export async function triggerDocumentStatusAlert(
  documentId: string,
  status: 'approved' | 'rejected' | 'expired',
  documentName: string,
  reason?: string
) {
  if (status === 'approved') {
    return triggerDocumentApprovedAlert(documentId, documentName)
  } else if (status === 'rejected') {
    return triggerDocumentRejectedAlert(documentId, documentName, reason || 'Sin especificar')
  } else if (status === 'expired') {
    return logAlert({
      type: 'warning',
      title: 'Documento vencido',
      description: `El documento "${documentName}" ha vencido y requiere renovación`,
      entityType: 'document',
      entityId: documentId,
      actionUrl: `/dashboard/company/documentos`,
    })
  }
}

/**
 * Dispara una alerta cuando un documento de subcontratista es subido
 */
export async function triggerSubcontractorDocumentUploadedAlert(subcontractorId: string, fileName: string, subcontractorName?: string) {
  return logAlert({
    type: 'success',
    title: 'Documento de subcontratista subido',
    description: `${subcontractorName || 'Un subcontratista'} ha subido un nuevo documento: ${fileName}`,
    entityType: 'document',
    entityId: subcontractorId,
    entityName: subcontractorName,
    actionUrl: `/dashboard/company/subcontratistas?search=${encodeURIComponent(subcontractorName || '')}`,
  })
}

/**
 * Dispara una alerta de error del sistema
 */
export async function triggerSystemAlert(title: string, description: string) {
  return logAlert({
    type: 'error',
    title,
    description,
    entityType: 'system',
  })
}
