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
      .from('alerts')
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
 * Generate validation completion alerts
 */
export async function generateDocumentValidationAlert(
  uploadedDocumentId: string,
  documentType: string,
  uploaderName: string,
  uploaderType: 'conductor' | 'client',
  uploaderId: string,
  isApproved: boolean
) {
  try {
    const supabase = createAdminClient()

    const status = isApproved ? 'Aprobado' : 'Rechazado'
    const level = isApproved ? 'info' : 'warning'

    // Notify the uploader
    const notification = {
      user_id: uploaderId,
      title: `Documento ${status}: ${documentType}`,
      message: `Tu ${documentType} ha sido revisado y ${isApproved ? 'aprobado' : 'rechazado'}.`,
      type: `document_${isApproved ? 'approved' : 'rejected'}`,
      read: false,
      created_at: new Date().toISOString(),
      metadata: {
        document_id: uploadedDocumentId,
        status: isApproved ? 'approved' : 'rejected',
      },
    }

    await supabase
      .from('notifications')
      .insert(notification)

    console.log(`[v0] Created validation notification for ${uploaderType}`)

  } catch (error) {
    console.error('[v0] Error in generateDocumentValidationAlert:', error)
  }
}
