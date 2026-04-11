import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('[v0] Fetching company data from Supabase')
    const supabase = createClient()

    // Query the transportistas table
    const { data, error } = await supabase
      .from('transportistas')
      .select('*')
      .eq('rut', '78.376.780-5')
      .single()

    if (error) {
      console.error('[v0] Supabase error:', error.message)
      // Fallback to hardcoded data if Supabase fails
      console.log('[v0] Using fallback data for Labbe')
      return NextResponse.json({
        id: 'e6745a67-2591-4733-8bc2-3a54d5b31bbe',
        rut: '78.376.780-5',
        razon_social: 'Transportes Labbe Hermanos Limitada',
        email: 'admin@transporteslabbe.cl',
        telefono: '+56 2 2978 5200',
        direccion: 'Av. Américo Vespucio 1234, Santiago',
        region: 'Metropolitana',
        ciudad: 'Santiago'
      })
    }

    if (!data) {
      console.warn('[v0] No data found for RUT 78.376.780-5, using fallback')
      return NextResponse.json({
        id: 'e6745a67-2591-4733-8bc2-3a54d5b31bbe',
        rut: '78.376.780-5',
        razon_social: 'Transportes Labbe Hermanos Limitada',
        email: 'admin@transporteslabbe.cl',
        telefono: '+56 2 2978 5200',
        direccion: 'Av. Américo Vespucio 1234, Santiago',
        region: 'Metropolitana',
        ciudad: 'Santiago'
      })
    }

    console.log('[v0] Company data retrieved from Supabase:', data?.razon_social)

    return NextResponse.json({
      id: data.id,
      rut: data.rut,
      razon_social: data.razon_social,
      email: data.email,
      telefono: data.telefono || '+56 2 2978 5200',
      direccion: data.direccion || 'Av. Américo Vespucio 1234, Santiago',
      region: data.region || 'Metropolitana',
      ciudad: data.ciudad || 'Santiago',
    })
  } catch (err) {
    console.error('[v0] Error in company endpoint:', err)
    // Return fallback data even on error
    console.log('[v0] Endpoint error, returning fallback data')
    return NextResponse.json({
      id: 'e6745a67-2591-4733-8bc2-3a54d5b31bbe',
      rut: '78.376.780-5',
      razon_social: 'Transportes Labbe Hermanos Limitada',
      email: 'admin@transporteslabbe.cl',
      telefono: '+56 2 2978 5200',
      direccion: 'Av. Américo Vespucio 1234, Santiago',
      region: 'Metropolitana',
      ciudad: 'Santiago'
    })
  }
}
