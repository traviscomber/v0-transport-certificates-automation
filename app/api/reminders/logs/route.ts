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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const subcontractorId = searchParams.get('subcontractor_id')

    let query = supabase
      .from('reminder_logs')
      .select(`
        id,
        subcontractor_id,
        phone,
        pending_count,
        status,
        sent_at,
        error_message,
        subcontratistas(nombre_fantasia, razon_social)
      `)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (subcontractorId) {
      query = query.eq('subcontractor_id', subcontractorId)
    }

    const { data: logs, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to expected format
    const mapped = (logs as any[]).map((log: any) => ({
      id: log.id,
      subcontractor_id: log.subcontractor_id,
      subcontractor_name: log.subcontratistas?.nombre_fantasia || log.subcontratistas?.razon_social || 'Sin nombre',
      phone: log.phone,
      pending_count: log.pending_count,
      sent_at: log.sent_at,
      status: log.status,
      error_message: log.error_message,
    }))

    return NextResponse.json({ logs: mapped, count: mapped.length })
  } catch (error) {
    console.error('Error fetching reminder logs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
