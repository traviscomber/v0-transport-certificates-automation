import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Generate alerts when a document is uploaded by conductor or client
 */
export async function generateDocumentUploadAlerts(
  uploadedDocumentId: string,
  documentType: string,
  uploaderName: string,
  uploaderType: 'conductor' | 'client',
  uploaderId: string
) {
  try {
    const supabase = createAdminClient()

    // Get all admin/manager/supervisor users
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, first_name')
      .in('role', ['admin', 'manager', 'supervisor'])

    if (adminError) {
      console.error('[v0] Error fetching admin users:', adminError)
      return
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('[v0] No admin users found for alerts')
      return
    }

    // Create alerts for each admin
    const alerts = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      title: `Nuevo Documento - ${uploaderType === 'conductor' ? 'Conductor' : 'Cliente'}`,
      message: `${uploaderName} ha subido ${documentType}. Acción requerida: revisar y validar.`,
      type: 'DOCUMENT_UPLOADED',
      level: 'warning',
      priority: 'high',
      category: 'document_upload',
      metadata: {
        document_id: uploadedDocumentId,
        uploader_id: uploaderId,
        uploader_type: uploaderType,
        uploader_name: uploaderName,
        document_type: documentType,
        timestamp: new Date().toISOString(),
      },
      action_url: `/admin/documents/${uploadedDocumentId}`,
      is_resolved: false,
    }))

    const { error: insertError } = await supabase
      .from('alerts_log')
      .insert(alerts)

    if (insertError) {
      console.error('[v0] Error creating alerts:', insertError)
      return
    }

    console.log(`[v0] Created ${alerts.length} document upload alerts`)

    // Also create notifications
    const notifications = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      title: `Documento Subido: ${documentType}`,
      message: `${uploaderName} ha completado la carga de ${documentType}. Requiere validación.`,
      type: 'document_upload',
      read: false,
      created_at: new Date().toISOString(),
      metadata: {
        document_id: uploadedDocumentId,
        action_url: `/admin/documents/${uploadedDocumentId}`,
      },
    }))

    await supabase
      .from('notifications')
      .insert(notifications)

  } catch (error) {
    console.error('[v0] Unexpected error in generateDocumentUploadAlerts:', error)
  }
}

/**
 * Generate alerts when document status changes (approved/rejected)
 */
export async function generateDocumentStatusChangeAlert(
  uploadedDocumentId: string,
  documentType: string,
  conductorName: string,
  conductorId: string,
  newStatus: 'approved' | 'rejected' | 'aprobado' | 'rechazado',
  reason?: string
) {
  try {
    const supabase = createAdminClient()
    const isApproved = newStatus === 'approved' || newStatus === 'aprobado'
    const priority = isApproved ? 'normal' : 'high'
    const category = isApproved ? 'document_approved' : 'document_rejected'

    console.log('[v0] 📢 Starting generateDocumentStatusChangeAlert:', {
      documentId: uploadedDocumentId,
      documentType,
      conductorName,
      newStatus,
      isApproved,
    })

    // Alert for conductors/clients (via notifications table)
    const conductorNotification = {
      user_id: conductorId,
      title: `Documento ${isApproved ? 'Aprobado' : 'Rechazado'}: ${documentType}`,
      message: isApproved
        ? `Tu ${documentType} ha sido revisado y aprobado.`
        : `Tu ${documentType} ha sido rechazado. Razón: ${reason || 'Revisar con supervisores'}`,
      type: `document_${isApproved ? 'approved' : 'rejected'}`,
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        document_id: uploadedDocumentId,
        status: isApproved ? 'approved' : 'rejected',
        reason: reason || null,
      },
    }

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(conductorNotification)

    if (notifError) {
      console.error('[v0] ❌ Error inserting conductor notification:', notifError)
    } else {
      console.log('[v0] ✅ Conductor notification created successfully')
    }

    // Alert for admins/managers (only on rejection, to alerts_log)
    if (!isApproved) {
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .in('role', ['admin', 'manager', 'supervisor'])

      if (adminUsers && adminUsers.length > 0) {
        const adminAlerts = adminUsers.map((admin: any) => ({
          alert_type: 'DOCUMENT_REJECTED',
          priority: priority,
          title: `Documento Rechazado - ${documentType}`,
          description: `${conductorName} tiene un documento rechazado. Razón: ${reason || 'Revisar'}`,
          entity_type: 'document',
          entity_id: uploadedDocumentId,
          entity_name: documentType,
          action_url: `/admin/documents/${uploadedDocumentId}`,
          is_read: false,
          is_resolved: false,
        }))

        const { error: alertError } = await supabase
          .from('alerts_log')
          .insert(adminAlerts)

        if (alertError) {
          console.error('[v0] ❌ Error creating admin alerts:', alertError)
        } else {
          console.log('[v0] ✅ Admin rejection alerts created successfully')
        }
      }
    }

    console.log('[v0] ✅ Completed status change alert generation for:', newStatus)

  } catch (error) {
    console.error('[v0] ❌ Error in generateDocumentStatusChangeAlert:', error)
  }
}

/**
 * Generate expiration alerts for documents
 * Called by a scheduled job to check for expiring documents
 */
export async function generateExpirationAlerts() {
  try {
    const supabase = createAdminClient()
    const today = new Date()

    // Get all documents with expiration dates
    const { data: documents, error: docsError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, document_type_id, extracted_expiration_date, last_expiration_alert_sent')
      .not('extracted_expiration_date', 'is', null)

    if (docsError || !documents) {
      console.error('[v0] Error fetching documents for expiration check:', docsError)
      return
    }

    const alertsToCreate: any[] = []
    const documentsToUpdate: string[] = []

    for (const doc of documents) {
      const expDate = new Date(doc.extracted_expiration_date)
      const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const lastAlertSent = doc.last_expiration_alert_sent ? new Date(doc.last_expiration_alert_sent) : null

      // Get document type name
      const { data: docType } = await supabase
        .from('document_types')
        .select('name')
        .eq('id', doc.document_type_id)
        .single()

      let shouldAlert = false
      let alertPriority = 'medium'
      let alertTitle = ''
      let alertDescription = ''

      // Check if document is overdue
      if (daysUntilExp < 0) {
        shouldAlert = true
        alertPriority = 'critical'
        alertTitle = 'Documento Vencido'
        alertDescription = `${docType?.name} está vencido desde hace ${Math.abs(daysUntilExp)} días`
      }
      // Check if expires in 1 day
      else if (daysUntilExp === 0 || (daysUntilExp === 1 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 12)))) {
        shouldAlert = true
        alertPriority = 'critical'
        alertTitle = 'Documento Vence Hoy'
        alertDescription = `${docType?.name} vence hoy. Acción inmediata requerida.`
      }
      // Check if expires in 7 days
      else if (daysUntilExp <= 7 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 24))) {
        shouldAlert = true
        alertPriority = 'high'
        alertTitle = 'Documento Próximo a Vencer'
        alertDescription = `${docType?.name} vence en ${daysUntilExp} días`
      }
      // Check if expires in 30 days
      else if (daysUntilExp <= 30 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 48))) {
        shouldAlert = true
        alertPriority = 'medium'
        alertTitle = 'Recordatorio de Vencimiento'
        alertDescription = `${docType?.name} vence en ${daysUntilExp} días. Considere renovar.`
      }

      if (shouldAlert) {
        // Get admin users
        const { data: adminUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['admin', 'manager', 'supervisor'])

        if (adminUsers && adminUsers.length > 0) {
          adminUsers.forEach((admin: any) => {
            alertsToCreate.push({
              alert_type: 'DOCUMENT_EXPIRATION',
              priority: alertPriority,
              title: alertTitle,
              description: alertDescription,
              entity_type: 'document',
              entity_id: doc.id,
              entity_name: docType?.name || 'Documento',
              action_url: `/admin/documents/${doc.id}`,
              is_read: false,
              is_resolved: false,
            })
          })
        }

        documentsToUpdate.push(doc.id)
      }
    }

    // Insert alerts
    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('alerts_log')
        .insert(alertsToCreate)

      if (!insertError) {
        // Update last alert sent timestamp
        const { error: updateError } = await supabase
          .from('uploaded_documents')
          .update({ last_expiration_alert_sent: new Date().toISOString() })
          .in('id', documentsToUpdate)

        console.log(`[v0] Created ${alertsToCreate.length} expiration alerts`)
      } else {
        console.error('[v0] Error inserting expiration alerts:', insertError)
      }
    }

  } catch (error) {
    console.error('[v0] Error in generateExpirationAlerts:', error)
  }
}

/**
 * Helper function to check if a date is more than X hours ago
 */
function isMoreThanHoursAgo(date: Date, hours: number): boolean {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours > hours
}
