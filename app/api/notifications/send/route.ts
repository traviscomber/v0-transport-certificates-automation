import { NextRequest, NextResponse } from 'next/server'
import {
  sendEmailNotification,
  sendSmsNotification,
  createNotificationJob,
  NOTIFICATION_TEMPLATES,
} from '@/lib/notifications-service'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      type, // 'email' | 'sms' | 'both'
      template_id,
      variables,
      contact,
    } = body

    // Validar template
    if (!NOTIFICATION_TEMPLATES[template_id]) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 400 }
      )
    }

    const template = NOTIFICATION_TEMPLATES[template_id]

    // Crear job de notificación
    const job = await createNotificationJob(user_id, template_id, variables, contact)

    // Enviar notificación
    if ((type === 'email' || type === 'both') && contact.email && template.type === 'email') {
      await sendEmailNotification(contact.email, template_id, variables)
    }

    if ((type === 'sms' || type === 'both') && contact.phone && template.type === 'sms') {
      await sendSmsNotification(contact.phone, template_id, variables)
    }

    return NextResponse.json({
      success: true,
      job_id: job.id,
      message: 'Notificación enviada',
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET: Obtener plantillas disponibles
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'email' | 'sms'

    const templates = Object.values(NOTIFICATION_TEMPLATES).filter(
      (t) => !type || t.type === type
    )

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
