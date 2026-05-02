import { createAdminClient } from '@/lib/supabase/admin'

async function getOrgId(supabase: ReturnType<typeof createAdminClient>): Promise<string | null> {
  const { data } = await supabase.from('organizations').select('id').limit(1).single()
  return data?.id ?? null
}

/**
 * Generate alerts when a document is uploaded by conductor or client
 * Inserts into: alerts (organization_id, title, message, type, priority, category, is_read, action_url, metadata)
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
    const orgId = await getOrgId(supabase)

    // Insert alert WITHOUT user_id - organization-wide alert
    const { error: insertError } = await supabase
      .from('alerts')
      .insert({
        organization_id: orgId,
        title: `Nuevo Documento - ${uploaderType === 'conductor' ? 'Conductor' : 'Cliente'}`,
        message: `${uploaderName} ha subido ${documentType}. Acción requerida: revisar y validar.`,
        type: 'DOCUMENT_UPLOADED',
        priority: 'high',
        category: 'document_upload',
        is_read: false,
        action_url: `/dashboard/company/documentos`,
        metadata: {
          document_id: uploadedDocumentId,
          uploader_type: uploaderType,
          uploader_name: uploaderName,
          document_type: documentType,
        },
      })

    if (insertError) {
      console.error('[v0] Error inserting document upload alert:', insertError)
    } else {
      console.log(`[v0] Created document upload alert`)
    }
  } catch (error) {
    console.error('[v0] Error in generateDocumentUploadAlerts:', error)
  }
}

/**
 * Generate alerts when document status changes (approved/rejected/pending)
 */
export async function generateDocumentStatusChangeAlert(
  uploadedDocumentId: string,
  documentType: string,
  conductorName: string,
  conductorId: string,
  newStatus: 'approved' | 'rejected' | 'pending',
  reason?: string
) {
  try {
    const supabase = createAdminClient()
    const orgId = await getOrgId(supabase)

    console.log('[v0] generateDocumentStatusChangeAlert:', { uploadedDocumentId, documentType, conductorName, newStatus })

    // Build message based on status
    let title = ''
    let message = ''
    let type = 'DOCUMENT_STATUS_CHANGE'
    let priority = 'medium'
    let category = 'document_status_change'

    if (newStatus === 'approved') {
      title = `Documento Aprobado - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} fue aprobado.`
      type = 'DOCUMENT_APPROVED'
      priority = 'medium'
      category = 'document_approved'
    } else if (newStatus === 'rejected') {
      title = `Documento Rechazado - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} fue rechazado. Razón: ${reason || 'Sin especificar'}`
      type = 'DOCUMENT_REJECTED'
      priority = 'high'
      category = 'document_rejected'
    } else if (newStatus === 'pending') {
      title = `Documento en Revisión - ${documentType}`
      message = `El documento ${documentType} de ${conductorName} ha sido retornado a revisión.`
      type = 'DOCUMENT_PENDING'
      priority = 'medium'
      category = 'document_pending'
    }

    // Insert alert WITHOUT user_id - organization-wide alert shown to all admins
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        organization_id: orgId,
        title,
        message,
        type,
        priority,
        category,
        is_read: false,
        action_url: `/dashboard/company/documentos`,
        metadata: {
          document_id: uploadedDocumentId,
          conductor_id: conductorId,
          conductor_name: conductorName,
          document_type: documentType,
          reason: reason || null,
          status: newStatus,
        },
      })

    if (alertError) {
      console.error('[v0] Error creating status change alert:', alertError)
    } else {
      console.log(`[v0] Created status change alert for status: ${newStatus}`)
    }
  } catch (error) {
    console.error('[v0] Error in generateDocumentStatusChangeAlert:', error)
  }
}

/**
 * Generate expiration alerts for documents close to expiration date
 */
export async function generateExpirationAlerts() {
  try {
    const supabase = createAdminClient()
    const today = new Date()
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find documents expiring in the next 7 days
    const { data: expiringDocs } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, document_type_id, expiration_date, document_types(name)')
      .lt('expiration_date', in7days.toISOString())
      .gt('expiration_date', today.toISOString())
      .is('last_expiration_alert_sent', null)

    if (!expiringDocs || expiringDocs.length === 0) {
      return
    }

    const orgId = await getOrgId(supabase)

    // Create alerts for each expiring document - WITHOUT user_id
    const alertsToCreate = expiringDocs.map((doc: any) => ({
      organization_id: orgId,
      type: 'DOCUMENT_EXPIRATION',
      title: `Documento por Vencer - ${doc.document_types?.name || 'Documento'}`,
      message: `El documento vence el ${new Date(doc.expiration_date).toLocaleDateString('es-MX')}`,
      priority: 'high',
      category: 'document_expiration',
      is_read: false,
      action_url: `/dashboard/company/documentos`,
      metadata: {
        document_id: doc.id,
        conductor_id: doc.conductor_id,
        expiration_date: doc.expiration_date,
      },
    }))

    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('alerts')
        .insert(alertsToCreate)

      if (!insertError) {
        // Update last alert sent timestamp
        const { error: updateError } = await supabase
          .from('uploaded_documents')
          .update({ last_expiration_alert_sent: new Date().toISOString() })
          .in('id', expiringDocs.map((d: any) => d.id))

        console.log(`[v0] Created ${alertsToCreate.length} expiration alerts`)
      } else {
        console.error('[v0] Error inserting expiration alerts:', insertError)
      }
    }
  } catch (error) {
    console.error('[v0] Error in generateExpirationAlerts:', error)
  }
}
