import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching sample drivers from conductores table...')
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno')
      .limit(10)
      .order('apellido_paterno', { ascending: true })

    console.log('[v0] Query error:', error)
    console.log('[v0] Query data count:', data?.length)

    if (error) {
      console.error('[v0] Error fetching sample drivers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch drivers', details: error.message },
        { status: 500 }
      )
    }

    const drivers = (data || []).map(d => ({
      id: d.id,
      rut: d.rut,
      nombre: `${d.nombres} ${d.apellido_paterno || ''}`.trim()
    }))

    console.log('[v0] Returning sample drivers:', drivers)

    return NextResponse.json({
      drivers: drivers,
      total: drivers.length
    })
  } catch (error) {
    console.error('[v0] Error in sample-drivers:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
