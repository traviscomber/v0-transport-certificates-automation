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
    const adminClient = await createAdminClient()

    // Log en consola
    console.log('[v0] Alert triggered:', {
      type: event.type,
      title: event.title,
      entity: event.entityType,
    })

    // Obtener la organization_id por defecto (primera organización o hardcodeada)
    // En un sistema multi-tenant, esto vendría de un contexto
    const { data: orgs, error: orgsError } = await adminClient
      .from('organizations')
      .select('id')
      .limit(1)

    if (orgsError) {
      console.warn('[v0] Error fetching organizations:', orgsError.message)
      return {
        success: false,
        error: 'No organization found',
      }
    }

    if (!orgs || orgs.length === 0) {
      console.warn('[v0] No organizations in database')
      return {
        success: false,
        error: 'No organization found',
      }
    }

    const organizationId = orgs[0].id
    console.log('[v0] Found organization:', organizationId)

    // Guardar en la tabla alerts_log
    const insertPayload = {
      organization_id: organizationId,
      alert_type: event.type.toUpperCase(),
      priority: mapTypeToPriority(event.type),
      title: event.title,
      description: event.description,
      entity_type: event.entityType,
      entity_id: event.entityId,
      entity_name: event.entityName,
      action_url: event.actionUrl,
      is_read: false,
      is_resolved: false,
    }

    console.log('[v0] Inserting alert:', insertPayload)

    const { data: savedAlert, error: insertError } = await adminClient
      .from('alerts_log')
      .insert(insertPayload)
      .select()

    if (insertError) {
      console.error('[v0] ❌ Error saving alert to database:', insertError)
      return {
        success: false,
        error: insertError.message,
      }
    }

    console.log('[v0] ✅ Alert saved to database:', {
      id: savedAlert?.[0]?.id,
      title: event.title,
    })

    return {
      success: true,
      event,
      timestamp: new Date(),
      alertId: savedAlert?.[0]?.id,
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
 * Mapea el tipo de alerta a prioridad
 */
function mapTypeToPriority(type: 'warning' | 'error' | 'success' | 'info'): string {
  switch (type) {
    case 'error':
      return 'high'
    case 'warning':
      return 'medium'
    case 'success':
      return 'low'
    case 'info':
      return 'low'
    default:
      return 'medium'
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
