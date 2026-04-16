import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
