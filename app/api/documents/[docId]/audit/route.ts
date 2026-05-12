import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Get audit log for document
    const { data: logs, error } = await supabase
      .from('document_upload_log')
      .select('*')
      .eq('documento_id', params.docId)
      .order('timestamp', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      document_id: params.docId,
      audit_log: logs,
      total_changes: logs?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Audit log error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}

// Update document status and create audit entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const { estado, userEmail, notas } = await request.json()

    if (!estado || !userEmail) {
      return NextResponse.json(
        { error: 'Missing estado or userEmail' },
        { status: 400 }
      )
    }

    // Get current document state (for audit)
    const { data: currentDoc } = await supabase
      .from('subcontractor_documents')
      .select('*')
      .eq('id', params.docId)
      .single()

    // Update document
    const { data: updatedDoc, error: updateError } = await supabase
      .from('subcontractor_documents')
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.docId)
      .select()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the change
    const accionMap: Record<string, string> = {
      approved: 'approved',
      rejected: 'rejected',
      expired: 'expired',
      pending: 'updated',
    }

    await supabase.from('document_upload_log').insert([
      {
        documento_id: params.docId,
        usuario_email: userEmail,
        accion: accionMap[estado] || 'updated',
        cambios_anteriores: currentDoc ? { estado: currentDoc.estado } : null,
        notas,
      },
    ])

    return NextResponse.json({
      success: true,
      documento_id: params.docId,
      nuevo_estado: estado,
      message: 'Document status updated and logged',
    })
  } catch (error) {
    console.error('[v0] Document update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}
