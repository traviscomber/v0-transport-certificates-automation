import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find TRANSPORTES SAN LORENZO SPA by RUT
    const { data: company, error: companyError } = await supabase
      .from('transportistas')
      .select('id, razon_social, rut')
      .eq('rut', '78302429-2')
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Find Daniela
    const { data: executives, error: execError } = await supabase
      .from('executive_staff')
      .select('id, nombres, apellido_paterno, email, cargo')
      .ilike('nombres', '%Daniela%')

    if (execError || !executives || executives.length === 0) {
      return NextResponse.json({ error: 'Executive not found' }, { status: 404 })
    }

    const daniela = executives[0]

    console.log('[v0] Assigning:', { company: company.razon_social, executive: daniela.nombres })

    // Delete existing assignment for this company
    await supabase
      .from('executive_staff')
      .delete()
      .eq('transportista_id', company.id)

    // Create new assignment
    const { data: result, error: assignError } = await supabase
      .from('executive_staff')
      .insert({
        id: daniela.id,
        transportista_id: company.id,
        nombres: daniela.nombres,
        apellido_paterno: daniela.apellido_paterno,
        email: daniela.email,
        cargo: daniela.cargo || 'EJECUTIVA',
        is_active: true
      })
      .select()

    if (assignError) {
      console.error('[v0] Assignment error:', assignError)
      return NextResponse.json({ error: assignError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${company.razon_social} assigned to ${daniela.nombres}`,
      company,
      executive: daniela,
      result
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
