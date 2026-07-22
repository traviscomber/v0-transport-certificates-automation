export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ message: 'Server configuration missing' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: transportistas, error, count } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social', { count: 'exact' })
      .limit(10)

    if (error) {
      return NextResponse.json(
        {
          error: 'Error querying transportistas',
          details: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transportistas: transportistas || [],
      totalCount: count || 0,
      message: 'Read-only data check. No seed or mutation is performed.',
    })
  } catch (err) {
    console.error('[v0] Debug endpoint error:', err)
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
