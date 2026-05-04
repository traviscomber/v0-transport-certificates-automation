import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-middleware'
import { createClient } from '@/lib/supabase/server'
import { getAnomalyTypeLabel } from '@/lib/anomalies/utils'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const {
      anomaly_id,
      recipient_email,
      anomaly_type,
      severity,
      description,
      driver_name,
    } = await request.json()

    if (!anomaly_id || !recipient_email || !anomaly_type || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create HTML email body
    const htmlBody = `
      <h2>Alerta de Anomalía Detectada</h2>
      <p><strong>Tipo:</strong> ${getAnomalyTypeLabel(anomaly_type)}</p>
      <p><strong>Severidad:</strong> ${severity}</p>
      ${driver_name ? `<p><strong>Conductor:</strong> ${driver_name}</p>` : ''}
      ${description ? `<p><strong>Descripción:</strong> ${description}</p>` : ''}
      <p>Por favor revisa el dashboard para más detalles.</p>
    `

    // Queue email for sending
    const { error: emailError } = await supabase
      .from('email_queue')
      .insert({
        recipient: recipient_email,
        subject: `[ALERTA] Anomalía en documento - ${getAnomalyTypeLabel(anomaly_type)}`,
        html_body: htmlBody,
        status: 'pending',
      })

    if (emailError) {
      console.error('[v0] Email queue error:', emailError)
      return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 })
    }

    // Create in-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'anomaly_alert',
        title: `Anomalía: ${getAnomalyTypeLabel(anomaly_type)}`,
        message: description || 'Se detectó una anomalía en un documento',
        data: { anomaly_id, severity },
        read: false,
      })
      .then()
      .catch((err) => console.error('[v0] Notification insert error:', err))

    return NextResponse.json({
      success: true,
      message: 'Alert queued successfully',
    })
  } catch (error) {
    console.error('[v0] Email alert API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
