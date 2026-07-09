import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logSupabaseError } from '@/lib/supabase/error-utils'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get conductor count
    const { count } = await supabase
      .from('conductores')
      .select('*', { count: 'exact', head: true })

    // Get sample conductores with their transportistas
    const { data: conductores } = await supabase
      .from('conductores')
      .select(`
        rut,
        nombres,
        apellido_paterno,
        rut_proveedor,
        transportistas(razon_social, rut)
      `)
      .limit(10)

    return NextResponse.json({
      success: true,
      totalConductores: count || 0,
      sample: conductores || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logSupabaseError('[v0] Error verifying conductores:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
