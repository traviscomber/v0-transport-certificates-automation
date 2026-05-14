import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get all conductores
    const { data: allConductores, error } = await supabase
      .from('conductores')
      .select('*')
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get column names from first record
    const columns = allConductores && allConductores.length > 0 
      ? Object.keys(allConductores[0]) 
      : []

    return NextResponse.json({
      total_conductores: allConductores?.length || 0,
      columns,
      sample_records: allConductores?.slice(0, 3) || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
