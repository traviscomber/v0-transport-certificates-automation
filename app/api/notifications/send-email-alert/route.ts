import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCompanyFromAuth } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { getAnomalyTypeLabel } from '@/lib/anomalies/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyFromAuth()
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      anomaly_id,
      recipient_email,
      recipient_name,
      anomaly_type,
      severity,
      description,
      driver_name,
    } = await request.json()

    if (!anomaly_id || !recipient_email || !anomaly_type || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify anomaly belongs to this company
    const { data: anomaly, error: anomalyError } = await supabase
      .from('anomalies_with_document_details')
      .select('id, company_id, document_type, detected_at')
      .eq('id', anomaly_id)
      .single()

    if (anomalyError || !anomaly) {
      return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 })
    }

    if (anomaly.company_id !== company.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1)
    const anomalyTypeLabel = getAnomalyTypeLabel(anomaly_type)
    const emailTemplate = `
      <h2>Alerta de Anomalía Detectada</h2>
      <p>Hola ${recipient_name},</p>
      <p>Se ha detectado una anomalía en un documento de tu empresa.</p>
      
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tipo de Documento:</strong> ${anomaly.document_type}</p>
        <p><strong>Tipo de Anomalía:</strong> ${anomalyTypeLabel}</p>
        <p><strong>Severidad:</strong> <span style="color: ${getSeverityEmailColor(severity)}; font-weight: bold;">${severityLabel}</span></p>
        ${driver_name ? `<p><strong>Conductor:</strong> ${driver_name}</p>` : ''}
        <p><strong>Descripción:</strong> ${description || 'N/A'}</p>
        <p><strong>Detectado:</strong> ${new Date(anomaly.detected_at).toLocaleString('es-CL')}</p>
      </div>
      
      <p>Por favor accede al dashboard de anomalías para revisar y tomar acción sobre este documento.</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Este es un mensaje automático. Por favor no respondas a este correo.
      </p>
    `

    await sendEmail({
      to: recipient_email,
      subject: `[ALERTA] Anomalía Detectada - ${anomalyTypeLabel} (${severityLabel})`,
      html: emailTemplate,
      replyTo: 'noreply@transporteslabe.cl',
    })

    // Log the notification in database
    await supabase
      .from('notifications')
      .insert({
        user_id: null, // System notification
        type: 'anomaly_alert',
        title: `Anomalía Detectada: ${anomalyTypeLabel}`,
        message: `Se detectó una anomalía de ${severity} en un ${anomaly.document_type}.`,
        related_id: anomaly_id,
        metadata: {
          anomaly_type,
          severity,
          document_type: anomaly.document_type,
        },
      })

    return NextResponse.json({
      success: true,
      message: 'Alert email sent successfully',
    })
  } catch (error) {
    console.error('[v0] Email alert API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getSeverityEmailColor(severity: string): string {
  const colors: Record<string, string> = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return colors[severity] || '#6b7280'
}
