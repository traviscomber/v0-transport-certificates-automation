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
      // Try exact match first, then case-insensitive fuzzy match
      const normalizedRut = rut.trim().toUpperCase()
      query = query.or(`rut.eq.${normalizedRut},rut.ilike.${normalizedRut}%`)
    } else if (id) {
      query = query.eq('id', id)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('[v0] Query error:', error)
    }

    if (!data) {
      console.warn('[v0] Driver not found:', { rut, id, error })
      
      // Try alternative search if first attempt failed
      if (rut) {
        const altQuery = await adminClient
          .from('conductores')
          .select('id, rut, nombres, apellido_paterno, transportista_id')
          .ilike('rut', `%${rut.replace(/\s+/g, '')}%`)
          .maybeSingle()
        
        if (altQuery.data) {
          return NextResponse.json({
            id: altQuery.data.id,
            rut: altQuery.data.rut,
            nombre: `${altQuery.data.nombres} ${altQuery.data.apellido_paterno || ''}`.trim(),
            transportista_id: altQuery.data.transportista_id
          })
        }
      }
      
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
