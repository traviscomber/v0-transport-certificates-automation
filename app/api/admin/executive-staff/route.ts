import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/executive-staff
 * Returns all active executives (Labbe employees) with @labbe.cl email
 */
export async function GET(request: NextRequest) {
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

    // Get all executives from executive_staff table
    const { data, error } = await supabase
      .from('executive_staff')
      .select('id, email, full_name, rut, cargo')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching executives:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Transform to match expected format (nombre instead of full_name)
    const executives = (data || [])
      .filter(e => e.email?.endsWith('@labbe.cl'))
      .map(e => ({
        id: e.id,
        email: e.email,
        nombre: e.full_name,
        apellido: '', // Not stored separately in this table
      }))

    console.log('[v0] Fetched', executives.length, 'Labbe executives')

    return NextResponse.json({ executives })
  } catch (error) {
    console.error('[v0] Error fetching executives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executives' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/executive-staff
 * Create a new executive (Labbe employee)
 * Body: { email: "name@labbe.cl", nombre: "Name", apellido: "Lastname", rut: "12345678-9" (optional) }
 */
export async function POST(request: NextRequest) {
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
    const { email, nombre, apellido, rut } = body

    // Validate email format
    if (!email || !nombre) {
      return NextResponse.json(
        { error: 'Email and nombre are required' },
        { status: 400 }
      )
    }

    if (!email.endsWith('@labbe.cl')) {
      return NextResponse.json(
        { error: 'Only @labbe.cl emails are allowed' },
        { status: 400 }
      )
    }

    // Check if executive already exists
    const { data: existing } = await supabase
      .from('executive_staff')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Executive already exists with this email' },
        { status: 400 }
      )
    }

    // Get a default transportista to link to (required by schema)
    const { data: defaultTransportista, error: transportistaError } = await supabase
      .from('transportistas')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (!defaultTransportista) {
      console.error('[v0] No transportista available for new executive')
      return NextResponse.json(
        { error: 'System configuration error: no default company available' },
        { status: 500 }
      )
    }

    // Insert new executive using full_name field
    const fullName = apellido ? `${nombre} ${apellido}` : nombre
    // Generate a placeholder RUT if not provided
    const execRut = rut || `${Math.floor(Math.random() * 10000000)}-${Math.floor(Math.random() * 9)}`

    const { data, error } = await supabase
      .from('executive_staff')
      .insert([{
        email,
        full_name: fullName,
        rut: execRut,
        cargo: 'Ejecutiva de Cuenta',
        is_active: true,
        transportista_id: defaultTransportista.id,
        password_hash: 'hash_placeholder',
      }])
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating executive:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create executive' },
        { status: 400 }
      )
    }

    console.log('[v0] Created executive:', email, 'with RUT:', execRut)
    return NextResponse.json({ 
      executive: { ...data, nombre: data?.full_name },
      message: 'Executive created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating executive:', error)
    return NextResponse.json(
      { error: 'Failed to create executive' },
      { status: 500 }
    )
  }
}
