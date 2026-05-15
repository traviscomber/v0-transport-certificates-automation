import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { rut, ejecutiva_email } = await request.json()

    if (!rut || !ejecutiva_email) {
      return NextResponse.json(
        { error: 'Missing required fields: rut and ejecutiva_email' },
        { status: 400 }
      )
    }

    console.log('[v0] Assigning ejecutiva:', { rut, ejecutiva_email })

    // Find the transportista by RUT
    const { data: transportista, error: transportistaError } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social')
      .eq('rut', rut)
      .single()

    if (transportistaError || !transportista) {
      console.error('[v0] Transportista not found:', rut, transportistaError)
      return NextResponse.json(
        { error: 'Transportista not found' },
        { status: 404 }
      )
    }

    // Find the ejecutiva by email
    const { data: ejecutiva, error: ejecutivaError } = await supabase
      .from('executive_staff')
      .select('id, full_name, email')
      .eq('email', ejecutiva_email)
      .single()

    if (ejecutivaError || !ejecutiva) {
      console.error('[v0] Ejecutiva not found:', ejecutiva_email, ejecutivaError)
      return NextResponse.json(
        { error: 'Ejecutiva not found' },
        { status: 404 }
      )
    }

    // Update transportista with the assigned executive
    const { data, error } = await supabase
      .from('transportistas')
      .update({ assigned_executive_id: ejecutiva.id })
      .eq('id', transportista.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error assigning ejecutiva:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to assign ejecutiva' },
        { status: 500 }
      )
    }

    console.log('[v0] Ejecutiva assigned successfully:', {
      transportista: transportista.rut,
      ejecutiva: ejecutiva.email,
      ejecutiva_id: ejecutiva.id,
    })

    return NextResponse.json({
      success: true,
      message: `Ejecutiva ${ejecutiva.full_name} assigned successfully to ${transportista.razon_social}`,
      data,
    }, { status: 200 })
  } catch (error: any) {
    console.error('[v0] Error in assign-ejecutiva-simple:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
