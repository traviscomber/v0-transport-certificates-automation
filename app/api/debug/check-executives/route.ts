export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a base de datos',
      }, { status: 500 })
    }

    console.log('[v0] Checking executive_staff table...')

    // Check if table exists and has data
    const { data, error, count } = await supabase
      .from('executive_staff')
      .select('id, rut, full_name, email, is_active', { count: 'exact' })
      .limit(10)

    console.log('[v0] Query result:', { error, count, dataCount: data?.length })

    if (error) {
      console.error('[v0] Query error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      })
    }

    return NextResponse.json({
      success: true,
      totalCount: count,
      executives: data,
      message: `Found ${count} executives`,
    })
  } catch (err) {
    console.error('[v0] Debug error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
