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
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Executive staff creation with placeholder credentials is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
