import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const documentId = params.id

    // Get audit trail for document
    const { data: auditLog, error } = await supabase
      .from('document_upload_log')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      documentId,
      auditTrail: auditLog || [],
      total: auditLog?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Audit endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const documentId = params.id
    const { action, newStatus, notes } = await request.json()

    // Get current document
    const { data: doc, error: docError } = await supabase
      .from('subcontractor_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Log the action
    const { error: logError } = await supabase
      .from('document_upload_log')
      .insert([
        {
          document_id: documentId,
          action,
          previous_status: doc.estado,
          new_status: newStatus || doc.estado,
          changed_by: user.email,
          notes,
          metadata: {
            timestamp: new Date().toISOString(),
            user_id: user.id,
          },
        },
      ])

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 })
    }

    // Update document if status changed
    if (newStatus && newStatus !== doc.estado) {
      const { error: updateError } = await supabase
        .from('subcontractor_documents')
        .update({
          estado: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      documentId,
      newStatus: newStatus || doc.estado,
      message: `Document ${action} logged successfully`,
    })
  } catch (error) {
    console.error('[v0] Audit PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
