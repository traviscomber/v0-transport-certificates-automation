import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test 1: With eq filter
    const query1 = supabase
      .from('subcontractor_documents')
      .select('id, status', { count: 'exact', head: false })
      .eq('status', 'pending')

    const result1 = await query1

    // Test 2: Get all then filter in JS
    const query2 = supabase
      .from('subcontractor_documents')
      .select('id, status', { head: false })

    const result2 = await query2
    const filtered2 = result2.data?.filter(d => d.status === 'pending').length || 0

    return NextResponse.json({
      test1_eq_filter: {
        count: result1.data?.length,
        error: result1.error
      },
      test2_client_filter: {
        count: filtered2
      },
      first_5_statuses_test2: result2.data?.slice(0, 5).map(d => d.status)
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
