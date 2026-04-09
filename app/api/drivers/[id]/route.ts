import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateRUT, validateLicensePlate, validateChileanDate, validateEmail, validatePhone } from "@/lib/chilean-validators"

export const dynamic = 'force-dynamic'

// GET single driver
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        organization:organizations(id, name),
        certificates:certificates(id, document_type_id, status, expiry_date)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
  }
}

// PUT update driver with validation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    // Validate RUT if provided
    if (body.rut) {
      const rutValidation = validateRUT(body.rut)
      if (!rutValidation.valid) return NextResponse.json({ error: rutValidation.error }, { status: 400 })
    }
    
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
      const dateValidation = validateChileanDate(body.license_expiry)
      if (!dateValidation.valid) return NextResponse.json({ error: 'Formato de fecha de vencimiento inválido' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('drivers')
      .update({
        full_name: body.full_name,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        license_number: body.license_number,
        license_type: body.license_type,
        license_expiry: body.license_expiry,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

// DELETE driver (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('drivers')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Driver deleted' })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 })
  }
}
