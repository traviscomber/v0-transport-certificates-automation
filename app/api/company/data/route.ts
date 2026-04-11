import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    console.log('[v0] Fetching company data from Supabase')

    // Query the transportistas table
    const { data, error } = await supabase
      .from('transportistas')
      .select('*')
      .eq('rut', '78.376.780-5')
      .single()

    if (error) {
      console.error('[v0] Error fetching company:', error.message)
      return NextResponse.json(
        { error: 'No se encontró la empresa' },
        { status: 404 }
      )
    }

    console.log('[v0] Company data retrieved:', data?.razon_social)

    return NextResponse.json({
      id: data.id,
      rut: data.rut,
      razon_social: data.razon_social,
      email: data.email,
      telefono: data.telefono || '',
      direccion: data.direccion || '',
      region: data.region || '',
      ciudad: data.ciudad || '',
    })
  } catch (err) {
    console.error('[v0] Error in company endpoint:', err)
    return NextResponse.json(
      { error: 'Error al obtener datos de la empresa' },
      { status: 500 }
    )
  }
}
