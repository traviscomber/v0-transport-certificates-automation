import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCompanyFromAuth } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const company = await getCompanyFromAuth()
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const actionTaken = searchParams.get('actionTaken')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    let query = supabase
      .from('anomalies_with_document_details')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .order('severity', { ascending: false })
      .order('detected_at', { ascending: false })

    // Filter by severity if provided
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity)
    }

    // Filter by action status if provided
    if (actionTaken === 'pending') {
      query = query.is('action_taken', null)
    } else if (actionTaken && actionTaken !== 'all') {
      query = query.eq('action_taken', actionTaken)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[v0] Anomalies fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      anomalies: data || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('[v0] Anomalies API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
