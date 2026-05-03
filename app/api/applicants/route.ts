import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      console.error('[v0] Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const companyId = searchParams.get('company_id')
    const search = searchParams.get('search')

    let query = supabase
      .from('applicants')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        rut,
        license_type,
        status,
        background_check_status,
        created_at,
        company_id
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Database error fetching applicants:', error)
      return NextResponse.json(
        { error: `Error al traer postulantes: ${error.message}` },
        { status: 400 }
      )
    }

    // Filter by search term if provided
    let filtered = data || []
    if (search && search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (applicant: any) =>
          applicant.first_name?.toLowerCase().includes(searchLower) ||
          applicant.last_name?.toLowerCase().includes(searchLower) ||
          applicant.rut?.includes(search) ||
          applicant.email?.toLowerCase().includes(searchLower)
      )
    }

    // Map to frontend format
    const applicants = filtered.map((applicant: any) => ({
      id: applicant.id,
      firstName: applicant.first_name,
      lastName: applicant.last_name,
      email: applicant.email,
      phone: applicant.phone,
      rut: applicant.rut,
      licenseType: applicant.license_type,
      status: applicant.status,
      backgroundCheckStatus: applicant.background_check_status,
      createdAt: applicant.created_at,
      companyName: 'Sin empresa',
    }))

    return NextResponse.json({ success: true, data: applicants }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error in applicants GET handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch applicants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      phone,
      rut,
      license_type,
      company_id,
      status = 'new',
    } = body

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !rut || !company_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Crear cliente Supabase con ANON_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      console.error('[v0] Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insertar postulante
    const { data, error } = await supabase
      .from('applicants')
      .insert([
        {
          first_name,
          last_name,
          email,
          phone: phone || null,
          rut,
          license_type,
          company_id,
          status,
          background_check_status: null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('[v0] Database error inserting applicant:', error)
      return NextResponse.json(
        { error: `Error al crear postulante: ${error.message}` },
        { status: 400 }
      )
    }

    console.log('[v0] Applicant created successfully:', data)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in applicants handler:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create applicant' },
      { status: 500 }
    )
  }
}
