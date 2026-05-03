import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno')
      .limit(10)
      .order('apellido_paterno', { ascending: true })

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
