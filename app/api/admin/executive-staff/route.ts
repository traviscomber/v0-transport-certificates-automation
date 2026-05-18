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

    // Get all executives from auth.users that match @labbe.cl email
    const { data, error } = await supabase
      .from('executive_staff')
      .select('id, email, nombre, apellido, is_active')
      .eq('is_active', true)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching executives:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Filter to only @labbe.cl emails (Labbe employees)
    const labbExecutives = (data || []).filter(e => e.email?.endsWith('@labbe.cl'))
    console.log('[v0] Fetched', labbExecutives.length, 'Labbe executives')

    return NextResponse.json({ executives: labbExecutives })
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
 * Body: { email: "name@labbe.cl", nombre: "Name", apellido: "Lastname" }
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
    const { email, nombre, apellido } = body

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
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Executive already exists with this email' },
        { status: 400 }
      )
    }

    // Insert new executive
    const { data, error } = await supabase
      .from('executive_staff')
      .insert([{
        email,
        nombre,
        apellido,
        is_active: true
      }])
      .select()

    if (error) {
      console.error('[v0] Error creating executive:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('[v0] Created executive:', email)
    return NextResponse.json({ executive: data?.[0], message: 'Executive created' }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating executive:', error)
    return NextResponse.json(
      { error: 'Failed to create executive' },
      { status: 500 }
    )
  }
}
