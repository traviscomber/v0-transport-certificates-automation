import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEmailTemplate, generateWhatsAppMessage } from '@/lib/conductor-notifications'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.json()
    const {
      conductor_id,
      conductor_name,
      conductor_email,
      conductor_phone,
      notification_type,
      document_type,
      rejection_reason,
      days_until_expiry,
      channel = 'both'
    } = body

    if (!conductor_id || !notification_type) {
      return NextResponse.json(
        { error: 'conductor_id and notification_type required' },
        { status: 400 }
      )
    }

    const data = {
      documentType: document_type,
      rejectionReason: rejection_reason,
      daysUntilExpiry: days_until_expiry
    }

    const notificationSent = {
      email: false,
      whatsapp: false
    }

    // Send Email notification
    if ((channel === 'email' || channel === 'both') && conductor_email) {
      try {
        const { subject, body: emailBody } = generateEmailTemplate(
          notification_type,
          conductor_name,
          data
        )

        // TODO: Integrate with email service (Resend, SendGrid, etc)
        console.log(`[v0] Email notification would be sent to ${conductor_email}`)
        console.log(`[v0] Subject: ${subject}`)
        console.log(`[v0] Body: ${emailBody}`)

        notificationSent.email = true
      } catch (error) {
        console.error('[v0] Error sending email:', error)
      }
    }

    // Send WhatsApp notification
    if ((channel === 'whatsapp' || channel === 'both') && conductor_phone) {
      try {
        const whatsappMessage = generateWhatsAppMessage(
          notification_type,
          conductor_name,
          data
        )

        // TODO: Integrate with WhatsApp API (Twilio, Baileys, Meta API, etc)
        console.log(`[v0] WhatsApp notification would be sent to ${conductor_phone}`)
        console.log(`[v0] Message: ${whatsappMessage}`)

        notificationSent.whatsapp = true
      } catch (error) {
        console.error('[v0] Error sending WhatsApp:', error)
      }
    }

    // Log notification in database
    try {
      await supabase
        .from('conductor_notifications')
        .insert({
          conductor_id,
          notification_type,
          channel,
          sent_email: notificationSent.email,
          sent_whatsapp: notificationSent.whatsapp,
          metadata: {
            document_type,
            rejection_reason,
            days_until_expiry
          }
        })
    } catch (error) {
      console.error('[v0] Error logging notification:', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent successfully',
        sent: notificationSent
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in send-notification endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
