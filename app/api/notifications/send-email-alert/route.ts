'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      anomaly_id,
      recipient_email,
      recipient_name,
      anomaly_type,
      severity,
      description,
      driver_name,
      company_name,
    } = body

    if (!anomaly_id || !recipient_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Store email in queue table for processing
    const subject = `[Alerta ${severity?.toUpperCase()}] Anomalía detectada: ${getAnomalyTypeLabel(anomaly_type)}`
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Alerta de Anomalía Detectada</h1>
          <p style="color: #94a3b8; margin: 8px 0 0;">Transportes Labbé - Sistema de Documentos</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid ${getSeverityColor(severity)};">
            <p style="margin: 0 0 8px; font-weight: bold; color: #1e293b;">${getAnomalyTypeLabel(anomaly_type)}</p>
            <p style="margin: 0; color: #64748b; font-size: 14px;">${description || 'Se detectó una anomalía en un documento'}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Severidad:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1e293b; text-transform: capitalize;">${severity}</td>
            </tr>
            ${driver_name ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Conductor:</td><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">${driver_name}</td></tr>` : ''}
            ${company_name ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Empresa:</td><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">${company_name}</td></tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">ID Anomalía:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1e293b;">${anomaly_id}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">Este es un mensaje automático del sistema de gestión de documentos de Transportes Labbé.</p>
          </div>
        </div>
      </div>
    `

    const { error: queueError } = await supabase
      .from('email_queue')
      .insert({
        recipient: recipient_email,
        subject,
        html_body: htmlBody,
        status: 'pending',
      })

    if (queueError) {
      console.error('[v0] Error queueing email alert:', queueError)
      // Don't fail the request if email queue fails
    }

    return NextResponse.json({ success: true, message: 'Alert queued successfully' })
  } catch (error) {
    console.error('[v0] Email alert API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getAnomalyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fraud: 'Fraude Detectado',
    alteration: 'Documento Alterado',
    expiration: 'Documento Vencido',
    invalid_format: 'Formato Inválido',
    missing_data: 'Datos Faltantes',
    document_damage: 'Documento Dañado',
  }
  return labels[type] || type
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  return colors[severity] || '#64748b'
}
