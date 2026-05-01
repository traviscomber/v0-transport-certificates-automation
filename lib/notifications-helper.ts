import { createAdminClient } from '@/lib/supabase/admin'

export interface NotificationPayload {
  type: 'status_change' | 'document_uploaded' | 'document_expired'
  conductorName: string
  documentType: string
  oldStatus?: string
  newStatus?: string
  documentId: string
  createdAt?: string
}

/**
 * Send email notification to all ejecutivas about a document event
 */
export async function notifyExecutivas(payload: NotificationPayload) {
  try {
    console.log('[v0] Notifying ejecutivas about:', payload.type)

    // Fetch all ejecutivas with email
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/company/executives`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      console.error('[v0] Failed to fetch ejecutivas:', res.statusText)
      return { success: false, error: 'Could not fetch ejecutivas' }
    }

    const { ejecutivas } = await res.json()

    if (!ejecutivas || ejecutivas.length === 0) {
      console.warn('[v0] No ejecutivas found for notifications')
      return { success: false, error: 'No ejecutivas found' }
    }

    // Build notification message
    let title = ''
    let message = ''

    if (payload.type === 'status_change') {
      title = `Cambio de Estado: ${payload.documentType}`
      message = `El documento ${payload.documentType} del conductor ${payload.conductorName} cambió de ${payload.oldStatus} a ${payload.newStatus}.`
    } else if (payload.type === 'document_uploaded') {
      title = `Nuevo Documento: ${payload.documentType}`
      message = `Se subió un nuevo ${payload.documentType} para el conductor ${payload.conductorName}.`
    } else if (payload.type === 'document_expired') {
      title = `Documento Vencido: ${payload.documentType}`
      message = `El ${payload.documentType} del conductor ${payload.conductorName} ha vencido y requiere atención.`
    }

    // Create in-app notifications for each ejecutiva
    const adminClient = await createAdminClient()

    const notifications = ejecutivas.map((exec: any) => ({
      user_id: exec.id,
      type: payload.type,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
      related_document_id: payload.documentId,
    }))

    // Insert notifications into DB
    const { error: insertError } = await adminClient
      .from('notifications')
      .insert(notifications)

    if (insertError) {
      console.error('[v0] Error inserting notifications:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('[v0] Created', notifications.length, 'in-app notifications')

    // Send emails (mock for now, implement with Resend/SendGrid later)
    for (const exec of ejecutivas) {
      try {
        const emailRes = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: exec.email,
            subject: title,
            template: 'document_status_change',
            variables: {
              ejecutiva_name: exec.nombre,
              conductor_name: payload.conductorName,
              document_type: payload.documentType,
              old_status: payload.oldStatus || 'N/A',
              new_status: payload.newStatus || 'N/A',
            },
          }),
        })

        if (!emailRes.ok) {
          console.warn(`[v0] Failed to send email to ${exec.email}`)
        } else {
          console.log(`[v0] Email sent to ${exec.email}`)
        }
      } catch (error) {
        console.error(`[v0] Error sending email to ${exec.email}:`, error)
      }
    }

    return { success: true, notified: ejecutivas.length }
  } catch (error) {
    console.error('[v0] Error in notifyExecutivas:', error)
    return { success: false, error: String(error) }
  }
}
