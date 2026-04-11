export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('[v0] Debug: Checking database structure')

    // Check if transportistas table exists and has data
    const { data: transportistas, error: transportistasError, count } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social', { count: 'exact' })
      .limit(10)

    console.log('[v0] Transportistas query - Error:', transportistasError, 'Count:', count, 'Data:', transportistas?.length)

    if (transportistasError) {
      return NextResponse.json({
        error: 'Error querying transportistas',
        details: transportistasError,
      }, { status: 500 })
    }

    // If no data, try to seed
    if (!transportistas || transportistas.length === 0) {
      console.log('[v0] No transportistas found, attempting to seed...')
      
      const { error: insertError } = await supabase
        .from('transportistas')
        .insert({
          rut: '78.376.780-5',
          razon_social: 'Transportes Labbe Hermanos Limitada',
          nombre_fantasia: 'Transportes Labbe',
          representante_legal: 'Olga Lydia Carrasco Olivares',
          email: 'info@transporteslabbe.cl',
          telefono: '+56977764753',
          region: 'XIII Región Metropolitana',
          comuna: 'Paine',
          is_active: true,
        })

      if (insertError) {
        console.error('[v0] Insert error:', insertError)
        return NextResponse.json({
          error: 'Error seeding data',
          details: insertError,
        }, { status: 500 })
      }

      console.log('[v0] Successfully seeded transportista data')
    }

    // Get updated data
    const { data: updatedTransportistas, error: updatedError } = await supabase
      .from('transportistas')
      .select('*')

    return NextResponse.json({
      success: true,
      transportistas: updatedTransportistas,
      totalCount: updatedTransportistas?.length || 0,
    })
  } catch (err) {
    console.error('[v0] Debug endpoint error:', err)
    return NextResponse.json({
      error: 'Debug endpoint error',
      details: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
