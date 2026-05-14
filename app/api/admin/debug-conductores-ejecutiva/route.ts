import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get all conductores - check for ejecutiva-related fields
    const { data: allConductores } = await supabase
      .from('conductores')
      .select('*')
      .limit(50)

    // Get columns from first record
    const columns = allConductores && allConductores.length > 0 
      ? Object.keys(allConductores[0]) 
      : []

    // Check for ejecutiva-related fields
    const ejecutivaFields = columns.filter(c => c.toLowerCase().includes('ejecutiva'))
    
    // Get sample with all data to check
    const sample = allConductores?.slice(0, 5).map(c => ({
      id: c.id,
      rut_proveedor: c.rut_proveedor,
      transportista_id: c.transportista_id,
      ...Object.keys(c)
        .filter(k => k.toLowerCase().includes('ejecutiva'))
        .reduce((acc, k) => ({ ...acc, [k]: c[k] }), {}),
    }))

    return NextResponse.json({
      total_conductores: allConductores?.length || 0,
      columns,
      ejecutiva_fields: ejecutivaFields,
      sample,
      full_sample: allConductores?.slice(0, 2),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
