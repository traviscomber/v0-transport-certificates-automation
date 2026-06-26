import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(url, key)
}

// Log reminder in database
async function logReminder(
  supabase: any,
  subcontractorId: string,
  phone: string,
  pendingCount: number,
  status: 'sent' | 'failed' | 'pending',
  errorMessage?: string
) {
  await supabase.from('reminder_logs').insert({
    subcontractor_id: subcontractorId,
    phone,
    pending_count: pendingCount,
    status,
    error_message: errorMessage,
    sent_at: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { subcontractor_id } = await request.json()

    if (!subcontractor_id) {
      return NextResponse.json(
        { error: 'Missing subcontractor_id' },
        { status: 400 }
      )
    }

    // Get subcontractor info and pending documents
    const { data: subcontractor } = await supabase
      .from('subcontratistas')
      .select('nombre_fantasia, razon_social, telefono_whatsapp')
      .eq('id', subcontractor_id)
      .single()

    const { data: pendingDocs, count: pendingCount } = await supabase
      .from('subcontractor_documents')
      .select('document_type_id, subcontractor_document_types(code)', { count: 'exact' })
      .eq('subcontractor_id', subcontractor_id)
      .eq('status', 'pending')

    if (!subcontractor || !pendingCount) {
      await logReminder(supabase, subcontractor_id, '', 0, 'failed', 'Subcontractor not found or no pending docs')
      return NextResponse.json(
        { error: 'Subcontractor not found or no pending documents' },
        { status: 404 }
      )
    }

    const name = subcontractor.nombre_fantasia || subcontractor.razon_social
    const phone = subcontractor.telefono_whatsapp

    if (!phone || phone === '+56') {
      await logReminder(supabase, subcontractor_id, phone || '', pendingCount, 'failed', 'No phone number')
      return NextResponse.json(
        { error: 'Subcontractor does not have a WhatsApp number on file' },
        { status: 400 }
      )
    }

    // Build message
    const typesList = (pendingDocs as any[])
      ?.map((d: any) => d.subcontractor_document_types?.code || 'DESCONOCIDO')
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .join(', ')

    const message = `¡Hola ${name}! 

Tienes ${pendingCount} documento(s) pendiente(s) en la plataforma de LABBE:

📋 Tipos: ${typesList}

Por favor sube los documentos faltantes cuanto antes para mantener tu certificación vigente.

🔗 Ingresa a: https://cleaner2.vercel.app/login

¿Preguntas? Contacta al equipo de LABBE.`

    // Send via WhatsApp Web (using the link method since we don't have server automation)
    // For now, we'll just log it and create a notification
    // In production, this could integrate with Twilio or similar

    const { error: logError } = await supabase.from('reminder_logs').insert({
      subcontractor_id,
      phone,
      pending_count: pendingCount,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    if (logError) {
      console.error('Error logging reminder:', logError)
    }

    // Return success with WhatsApp Web link for manual sending
    const encodedMessage = encodeURIComponent(message)
    const whatsappLink = `https://web.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}&text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      message: 'Recordatorio preparado',
      subcontractor_name: name,
      pending_count: pendingCount,
      phone,
      whatsapp_link: whatsappLink,
      message_text: message,
    })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
