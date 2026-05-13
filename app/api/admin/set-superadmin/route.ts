import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/set-superadmin
 * Creates or updates a superadmin user for ocarrasco@labbe.cl
 * This allows the user to view all data and delete alerts
 */
export async function POST(request: Request) {
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
    const body = await request.json()
    const { email = 'ocarrasco@labbe.cl' } = body

    // Check if superadmin user already exists
    const { data: existing } = await supabase
      .from('executive_staff')
      .select('id, email')
      .eq('email', email)
      .eq('cargo', 'SUPERADMIN')
      .single()

    if (existing) {
      console.log('[v0] Superadmin already exists:', existing.email)
      return NextResponse.json({
        message: 'Superadmin already exists',
        user: existing,
        success: true
      })
    }

    // Get or create a superadmin transportista (for reference)
    const { data: superTransportista } = await supabase
      .from('transportistas')
      .select('id')
      .eq('razon_social', 'LABBE_INTERNAL')
      .single()

    let transportistaId = superTransportista?.id

    // If no internal transportista exists, create one
    if (!transportistaId) {
      const { data: newTransportista, error: transError } = await supabase
        .from('transportistas')
        .insert([{
          razon_social: 'LABBE_INTERNAL',
          rut: '00000000-0',
          activo: true
        }])
        .select('id')
        .single()

      if (transError) {
        console.error('[v0] Error creating internal transportista:', transError)
        return NextResponse.json(
          { error: 'Failed to create internal transportista' },
          { status: 500 }
        )
      }

      transportistaId = newTransportista?.id
    }

    // Create superadmin user
    const { data: newUser, error } = await supabase
      .from('executive_staff')
      .insert([{
        transportista_id: transportistaId,
        nombres: 'Oscar',
        apellido_paterno: 'Carrasco',
        apellido_materno: '',
        email: email,
        telefono: '',
        cargo: 'SUPERADMIN',
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating superadmin:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('[v0] Superadmin created successfully:', newUser.email)
    return NextResponse.json({
      message: 'Superadmin created successfully',
      user: newUser,
      success: true
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in set-superadmin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
