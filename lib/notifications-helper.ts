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

    let title = ''
    let message = ''

    const adminClient = createAdminClient()

    // Resolve real conductor name from conductores table using the document
    let resolvedConductorName = payload.conductorName
    if (!resolvedConductorName || resolvedConductorName === 'Unknown') {
      const { data: doc } = await adminClient
        .from('uploaded_documents')
        .select('conductor_id')
        .eq('id', payload.documentId)
        .single()

      if (doc?.conductor_id) {
        const { data: conductor } = await adminClient
          .from('conductores')
          .select('nombres, apellido_paterno, apellido_materno')
          .eq('id', doc.conductor_id)
          .single()

        if (conductor) {
          resolvedConductorName = [conductor.nombres, conductor.apellido_paterno, conductor.apellido_materno]
            .filter(Boolean)
            .join(' ')
            .trim()
        }
      }
    }

    // Rebuild message with resolved name
    if (payload.type === 'status_change') {
      title = `Cambio de Estado: ${payload.documentType}`
      message = `El documento ${payload.documentType} del conductor ${resolvedConductorName} cambió de ${payload.oldStatus} a ${payload.newStatus}.`
    } else if (payload.type === 'document_uploaded') {
      title = `Nuevo Documento: ${payload.documentType}`
      message = `Se subió un nuevo ${payload.documentType} para el conductor ${resolvedConductorName}.`
    } else if (payload.type === 'document_expired') {
      title = `Documento Vencido: ${payload.documentType}`
      message = `El ${payload.documentType} del conductor ${resolvedConductorName} ha vencido y requiere atención.`
    }

    // Organization ID for Labbe (constant - single company)
    const organizationId = '1b051f99-949d-4ba9-97da-3915cc648701'

    const alertInsert: any = {
      type: payload.type,
      title,
      message,
      priority: payload.type === 'status_change' ? 'high' : 'medium',
      category: payload.type,
      is_read: false,
      is_dismissed: false,
      organization_id: organizationId,
      action_url: `/dashboard/company/documentos`,
      metadata: {
        document_id: payload.documentId,
        old_status: payload.oldStatus,
        new_status: payload.newStatus,
        conductor: resolvedConductorName,
      },
    }

    const { error: alertError } = await adminClient
      .from('alerts')
      .insert(alertInsert)

    if (alertError) {
      console.error('[v0] Error inserting alert:', alertError)
    } else {
      console.log('[v0] Alert created successfully in alerts table')
    }

    // Create in-app notifications only for ejecutivas that have a valid profile id
    const validExecutivas = ejecutivas.filter((exec: any) => exec.id != null)

    if (validExecutivas.length > 0) {
      const notifications = validExecutivas.map((exec: any) => ({
        user_id: exec.id,
        type: payload.type,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      }))

      const { error: insertError } = await adminClient
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('[v0] Error inserting notifications:', insertError)
      } else {
        console.log('[v0] Created', notifications.length, 'in-app notifications')
      }
    } else {
      console.log('[v0] No ejecutivas with valid profile id found, skipping notifications insert')
    }

    console.log('[v0] Notification flow complete for', ejecutivas.length, 'ejecutivas')

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
