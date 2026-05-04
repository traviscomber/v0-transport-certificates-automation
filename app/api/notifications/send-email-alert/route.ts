import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'
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

    // Queue email for sending
    const { error: emailError } = await supabase
      .from('email_queue')
      .insert({
        recipient: recipient_email,
        subject: `Anomalía Detectada - ${getAnomalyTypeLabel(anomaly_type)} (${severity.toUpperCase()})`,
        html_body: generateEmailHTML({
          anomaly_type,
          severity,
          description,
          driver_name: driver_name || 'N/A',
          anomaly_id,
        }),
        status: 'pending',
      })

    if (emailError) {
      console.error('[v0] Email queue error:', emailError)
      return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email queued' })
  } catch (error) {
    console.error('[v0] Email alert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateEmailHTML({
  anomaly_type,
  severity,
  description,
  driver_name,
  anomaly_id,
}: {
  anomaly_type: string
  severity: string
  description: string
  driver_name: string
  anomaly_id: string
}): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #d9534f;">Alerta de Anomalía Detectada</h2>
      <p>Se ha detectado una anomalía en el sistema de gestión de documentos.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Tipo de Anomalía:</strong> ${getAnomalyTypeLabel(anomaly_type)}</p>
        <p><strong>Severidad:</strong> <span style="color: ${getSeverityColor(severity)}; font-weight: bold;">${severity.toUpperCase()}</span></p>
        <p><strong>Conductor:</strong> ${driver_name}</p>
        <p><strong>Descripción:</strong> ${description}</p>
        <p><strong>ID de Anomalía:</strong> ${anomaly_id}</p>
      </div>
      
      <p>Por favor, revise y tome las acciones correspondientes.</p>
      <p style="color: #999; font-size: 12px;">Este es un mensaje automático. No responda a este correo.</p>
    </div>
  `
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '#d9534f'
    case 'high':
      return '#f0ad4e'
    case 'medium':
      return '#5bc0de'
    default:
      return '#5cb85c'
  }
}
