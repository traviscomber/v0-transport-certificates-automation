import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateRUT, validateLicenseClass, validateDateFormat, validateEmail, validatePhone } from "@/lib/validations"

export const dynamic = 'force-dynamic'

// GET all drivers
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    
    let query = supabase
      .from('drivers')
      .select(`
        *,
        organization:organizations(id, name),
        assignments:driver_assignments(
          vehicle:vehicles(id, plate, brand, model)
        )
      `)
      .eq('is_active', true)
      .order('full_name')
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

// POST create new driver with validation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.organization_id) return NextResponse.json({ error: 'organization_id es requerido' }, { status: 400 })
    if (!body.full_name) return NextResponse.json({ error: 'full_name es requerido' }, { status: 400 })
    if (!body.rut) return NextResponse.json({ error: 'rut es requerido' }, { status: 400 })
    
    // Validate RUT
    const rutValidation = validateRUT(body.rut)
    if (!rutValidation.valid) return NextResponse.json({ error: rutValidation.error }, { status: 400 })
    
    // Validate email if provided
    if (body.email) {
      const emailValidation = validateEmail(body.email)
      if (!emailValidation.valid) return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }
    
    // Validate phone if provided
    if (body.phone) {
      const phoneValidation = validatePhone(body.phone)
      if (!phoneValidation.valid) return NextResponse.json({ error: phoneValidation.error }, { status: 400 })
    }
    
    // Validate license class if provided
    if (body.license_type) {
      const licenseValidation = validateLicenseClass(body.license_type)
      if (!licenseValidation.valid) return NextResponse.json({ error: licenseValidation.error }, { status: 400 })
    }
    
    // Validate license expiry date if provided
    if (body.license_expiry) {
      const dateValidation = validateDateFormat(body.license_expiry)
      if (!dateValidation.valid) return NextResponse.json({ error: 'Formato de fecha de vencimiento inválido' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('drivers')
      .insert({
        organization_id: body.organization_id,
        full_name: body.full_name,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        license_number: body.license_number,
        license_type: body.license_type,
        license_expiry: body.license_expiry,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
