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
    const adminClient = createAdminClient()

    // Log en consola
    console.log('[v0] Alert triggered:', {
      type: event.type,
      title: event.title,
      entity: event.entityType,
    })

    // Aquí se podría guardar en la tabla de alertas_log de Supabase si existe
    // Por ahora solo registramos en logs, pero la estructura está lista para
    // guardar en base de datos cuando la tabla esté configurada

    return {
      success: true,
      event,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('[v0] Error logging alert:', error)
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
