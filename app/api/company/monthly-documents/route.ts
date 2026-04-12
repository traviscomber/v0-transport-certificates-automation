import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const monthYear = searchParams.get('month_year')
    const driverId = searchParams.get('driver_id')
    const provider = searchParams.get('provider')

    let query = supabase.from('monthly_documents').select('*')

    if (monthYear) {
      query = query.eq('month_year', monthYear)
    }
    if (driverId) {
      query = query.eq('driver_id', driverId)
    }
    if (provider && provider !== 'all') {
      query = query.eq('provider', provider)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Failed to fetch monthly documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      driver_id,
      document_type,
      month_year,
      status,
      provider,
      file_url,
      file_name,
      expiry_date,
    } = body

    const { data, error } = await supabase
      .from('monthly_documents')
      .insert([
        {
          driver_id,
          document_type,
          month_year,
          status: status || 'pending',
          provider,
          file_url,
          file_name,
          expiry_date,
          uploaded_at: status === 'uploaded' ? new Date().toISOString() : null,
        },
      ])
      .select()

    if (error) throw error

    // Log to audit table
    if (data && data[0]) {
      await supabase.from('monthly_documents_audit').insert([
        {
          monthly_document_id: data[0].id,
          action: 'created',
          new_status: status || 'pending',
          changed_by: request.headers.get('user-id') || 'system',
        },
      ])
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create monthly document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, status, file_url, file_name, expiry_date } = body

    // Get current document to log changes
    const { data: currentDoc } = await supabase
      .from('monthly_documents')
      .select('status')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('monthly_documents')
      .update({
        status,
        file_url,
        file_name,
        expiry_date,
        uploaded_at: status === 'uploaded' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) throw error

    // Log to audit table if status changed
    if (currentDoc && currentDoc.status !== status) {
      await supabase.from('monthly_documents_audit').insert([
        {
          monthly_document_id: id,
          action: 'status_updated',
          previous_status: currentDoc.status,
          new_status: status,
          changed_by: request.headers.get('user-id') || 'system',
        },
      ])
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Failed to update monthly document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const { error } = await supabase.from('monthly_documents').delete().eq('id', id)

    if (error) throw error

    // Log deletion to audit
    await supabase.from('monthly_documents_audit').insert([
      {
        monthly_document_id: id,
        action: 'deleted',
        changed_by: request.headers.get('user-id') || 'system',
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete monthly document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
