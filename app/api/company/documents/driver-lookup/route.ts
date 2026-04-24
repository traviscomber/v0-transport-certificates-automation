import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    const id = searchParams.get('id')

    if (!rut && !id) {
      return NextResponse.json(
        { error: 'RUT or ID required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    let query = adminClient
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno, transportista_id')

    if (rut) {
      query = query.eq('rut', rut)
    } else if (id) {
      query = query.eq('id', id)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      console.warn('[v0] Driver not found:', { rut, id, error })
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: data.id,
      rut: data.rut,
      nombre: `${data.nombres} ${data.apellido_paterno || ''}`.trim(),
      transportista_id: data.transportista_id
    })
  } catch (error) {
    console.error('[v0] Error looking up driver:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
