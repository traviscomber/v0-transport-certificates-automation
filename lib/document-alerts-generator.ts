import { createAdminClient } from '@/lib/supabase/admin'

async function getOrgId(supabase: ReturnType<typeof createAdminClient>): Promise<string | null> {
  const { data } = await supabase.from('organizations').select('id').limit(1).single()
  return data?.id ?? null
}

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
    const orgId = await getOrgId(supabase)

    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager', 'supervisor', 'ejecutiva'])

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.error('[v0] No admin users found or error:', adminError)
      return
    }

    const alerts = adminUsers.map((admin: any) => ({
      user_id: admin.id,
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
    }))

    const { error: insertError } = await supabase
      .from('alerts')
      .insert(alerts)

    if (insertError) {
      console.error('[v0] Error inserting document upload alerts:', insertError)
    } else {
      console.log(`[v0] Created ${alerts.length} document upload alerts`)
    }
  } catch (error) {
    console.error('[v0] Error in generateDocumentUploadAlerts:', error)
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
  newStatus: 'approved' | 'rejected',
  reason?: string
) {
  try {
    const supabase = createAdminClient()
    const orgId = await getOrgId(supabase)

    console.log('[v0] generateDocumentStatusChangeAlert:', { uploadedDocumentId, documentType, conductorName, newStatus })

    // Create alert for admins in the alerts table
    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager', 'supervisor', 'ejecutiva'])

    if (adminUsers && adminUsers.length > 0) {
      const adminAlerts = adminUsers.map((admin: any) => ({
        user_id: admin.id,
        organization_id: orgId,
        title: newStatus === 'approved'
          ? `Documento Aprobado - ${documentType}`
          : `Documento Rechazado - ${documentType}`,
        message: newStatus === 'approved'
          ? `El documento ${documentType} de ${conductorName} fue aprobado.`
          : `El documento ${documentType} de ${conductorName} fue rechazado. Razón: ${reason || 'Sin especificar'}`,
        type: newStatus === 'approved' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
        priority: newStatus === 'approved' ? 'medium' : 'high',
        category: newStatus === 'approved' ? 'document_approved' : 'document_rejected',
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

    // Create alerts for each expiring document
    const alertsToCreate = expiringDocs.map((doc: any) => ({
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
      const orgId = await getOrgId(supabase)

      // Add organization_id to all alerts
      const alertsWithOrg = alertsToCreate.map(alert => ({
        ...alert,
        organization_id: orgId
      }))

      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['admin', 'manager', 'supervisor', 'ejecutiva'])

      if (adminUsers && adminUsers.length > 0) {
        const finalAlerts = adminUsers.flatMap((admin: any) =>
          alertsWithOrg.map(alert => ({
            ...alert,
            user_id: admin.id,
          }))
        )

        const { error: insertError } = await supabase
          .from('alerts')
          .insert(finalAlerts)

        if (!insertError) {
          // Update last alert sent timestamp
          const { error: updateError } = await supabase
            .from('uploaded_documents')
            .update({ last_expiration_alert_sent: new Date().toISOString() })
            .in('id', expiringDocs.map((d: any) => d.id))

          console.log(`[v0] Created ${finalAlerts.length} expiration alerts`)
        } else {
          console.error('[v0] Error inserting expiration alerts:', insertError)
        }
      }
    }
  } catch (error) {
    console.error('[v0] Error in generateExpirationAlerts:', error)
  }
}
