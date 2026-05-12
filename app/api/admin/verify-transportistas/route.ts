import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get count and sample from transportistas table
    const { data: transportistas, error, count } = await supabase
      .from('transportistas')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        inSupabase: 0
      })
    }

    return NextResponse.json({
      success: true,
      inSupabase: count || 0,
      sample: transportistas?.map(t => ({
        rut: t.rut,
        razon_social: t.razon_social,
        ejecutiva: t.ejecutiva_nombre || 'N/A',
        is_active: t.is_active
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
