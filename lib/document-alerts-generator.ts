import { createAdminClient } from '@/lib/supabase/admin'

const ORG_ID = '1b051f99-949d-4ba9-97da-3915cc648701'

/**
 * Generate alerts when a document is uploaded by conductor or client
 * Inserts into: alerts (user_id, organization_id, title, message, type, priority, category, is_read, action_url, metadata)
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

    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager', 'supervisor'])

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.error('[v0] No admin users found or error:', adminError)
      return
    }

    const alerts = adminUsers.map((admin: any) => ({
      user_id: admin.id,
      organization_id: ORG_ID,
      title: `Nuevo Documento - ${uploaderType === 'conductor' ? 'Conductor' : 'Cliente'}`,
      message: `${uploaderName} ha subido ${documentType}. Acción requerida: revisar y validar.`,
      type: 'DOCUMENT_UPLOADED',
      priority: 'high',
      category: 'document_upload',
      is_read: false,
      action_url: `/dashboard/company/documentos`,
      metadata: {
        document_id: uploadedDocumentId,
        uploader_id: uploaderId,
        uploader_type: uploaderType,
        uploader_name: uploaderName,
        document_type: documentType,
      },
    }))

    const { error: insertError } = await supabase
      .from('alerts')
      .insert(alerts)

    if (insertError) {
      console.error('[v0] Error creating upload alerts:', insertError)
    } else {
      console.log(`[v0] Created ${alerts.length} document upload alerts`)
    }
  } catch (error) {
    console.error('[v0] Unexpected error in generateDocumentUploadAlerts:', error)
  }
}

/**
 * Generate alerts when document status changes (approved/rejected)
 * Inserts into: alerts (admin alerts) + notifications (conductor notification)
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

    console.log('[v0] generateDocumentStatusChangeAlert called:', { uploadedDocumentId, documentType, conductorName, newStatus })

    // Create alert for admins in the alerts table (the main notification system)
    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager', 'supervisor', 'ejecutiva'])

    if (adminUsers && adminUsers.length > 0) {
      const adminAlerts = adminUsers.map((admin: any) => ({
        user_id: admin.id,
        organization_id: ORG_ID,
        title: isApproved
          ? `Documento Aprobado - ${documentType}`
          : `Documento Rechazado - ${documentType}`,
        message: isApproved
          ? `El documento ${documentType} de ${conductorName} fue aprobado.`
          : `El documento ${documentType} de ${conductorName} fue rechazado. Razón: ${reason || 'Sin especificar'}`,
        type: isApproved ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
        priority: isApproved ? 'medium' : 'high',
        category: isApproved ? 'document_approved' : 'document_rejected',
        is_read: false,
        action_url: `/dashboard/company/documentos`,
        metadata: {
          document_id: uploadedDocumentId,
          conductor_id: conductorId,
          conductor_name: conductorName,
          document_type: documentType,
          reason: reason || null,
        },
      }))

      const { error: alertError } = await supabase
        .from('alerts')
        .insert(adminAlerts)

      if (alertError) {
        console.error('[v0] ❌ Error creating admin alerts:', alertError)
      } else {
        console.log(`[v0] ✅ Created ${adminAlerts.length} admin alerts for status: ${newStatus}`)
      }
    }
  } catch (error) {
    console.error('[v0] ❌ Error in generateDocumentStatusChangeAlert:', error)
  }
}

/**
 * Generate expiration alerts for documents
 * Called by cron job daily
 */
export async function generateExpirationAlerts() {
  try {
    const supabase = createAdminClient()
    const today = new Date()

    const { data: documents, error: docsError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, document_type_id, extracted_expiration_date, last_expiration_alert_sent')
      .not('extracted_expiration_date', 'is', null)

    if (docsError || !documents) {
      console.error('[v0] Error fetching documents for expiration check:', docsError)
      return
    }

    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager', 'supervisor'])

    if (!adminUsers || adminUsers.length === 0) return

    const alertsToCreate: any[] = []
    const documentsToUpdate: string[] = []

    for (const doc of documents) {
      const expDate = new Date(doc.extracted_expiration_date)
      const daysUntilExp = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const lastAlertSent = doc.last_expiration_alert_sent ? new Date(doc.last_expiration_alert_sent) : null

      const { data: docType } = await supabase
        .from('document_types')
        .select('name')
        .eq('id', doc.document_type_id)
        .single()

      let shouldAlert = false
      let alertPriority = 'medium'
      let alertTitle = ''
      let alertMessage = ''

      if (daysUntilExp < 0) {
        shouldAlert = true
        alertPriority = 'critical'
        alertTitle = 'Documento Vencido'
        alertMessage = `${docType?.name} está vencido desde hace ${Math.abs(daysUntilExp)} días`
      } else if (daysUntilExp <= 1 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 12))) {
        shouldAlert = true
        alertPriority = 'critical'
        alertTitle = 'Documento Vence Hoy'
        alertMessage = `${docType?.name} vence hoy. Acción inmediata requerida.`
      } else if (daysUntilExp <= 7 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 24))) {
        shouldAlert = true
        alertPriority = 'high'
        alertTitle = 'Documento Próximo a Vencer'
        alertMessage = `${docType?.name} vence en ${daysUntilExp} días`
      } else if (daysUntilExp <= 30 && (!lastAlertSent || isMoreThanHoursAgo(lastAlertSent, 48))) {
        shouldAlert = true
        alertPriority = 'medium'
        alertTitle = 'Recordatorio de Vencimiento'
        alertMessage = `${docType?.name} vence en ${daysUntilExp} días. Considere renovar.`
      }

      if (shouldAlert) {
        adminUsers.forEach((admin: any) => {
          alertsToCreate.push({
            user_id: admin.id,
            organization_id: ORG_ID,
            title: alertTitle,
            message: alertMessage,
            type: 'DOCUMENT_EXPIRATION',
            priority: alertPriority,
            category: 'document_expiration',
            is_read: false,
            action_url: `/dashboard/company/documentos`,
            metadata: {
              document_id: doc.id,
              conductor_id: doc.conductor_id,
              days_until_expiration: daysUntilExp,
              expiration_date: doc.extracted_expiration_date,
            },
          })
        })
        documentsToUpdate.push(doc.id)
      }
    }

    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('alerts')
        .insert(alertsToCreate)

      if (!insertError) {
        await supabase
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

function isMoreThanHoursAgo(date: Date, hours: number): boolean {
  return (new Date().getTime() - date.getTime()) / (1000 * 60 * 60) > hours
}
