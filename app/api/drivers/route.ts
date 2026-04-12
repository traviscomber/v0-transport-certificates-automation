import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"
import { validateRUT, validateLicenseClass, validateChileanDate } from "@/lib/chilean-validators"
import { verifyAuth, checkOrganizationAccess, logAudit } from "@/lib/auth-middleware"

export const dynamic = 'force-dynamic'

// GET all drivers
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    
    // Check org access
    if (organizationId && !checkOrganizationAccess(user.organization_id, organizationId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot access other organization', success: false }, { status: 403 })
    }
    
    let query = supabase
      .from('drivers')
      .select(`*`)
      .order('full_name')
      .limit(500)
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ drivers: data, success: true })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers', success: false }, { status: 500 })
  }
}

// POST create new driver with validation
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    }

    // Only admin, dispatcher, transportista can create drivers
    if (!['admin', 'dispatcher', 'transportista'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Only admin/dispatcher/transportista can create drivers', success: false }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.organization_id) return NextResponse.json({ error: 'organization_id es requerido', success: false }, { status: 400 })
    if (!body.full_name) return NextResponse.json({ error: 'full_name es requerido', success: false }, { status: 400 })
    if (!body.rut) return NextResponse.json({ error: 'rut es requerido', success: false }, { status: 400 })
    
    // Check org access
    if (!checkOrganizationAccess(user.organization_id, body.organization_id)) {
      return NextResponse.json({ error: 'Forbidden: Cannot create driver in other organization', success: false }, { status: 403 })
    }

    // Validate RUT
    const rutValidation = validateRUT(body.rut)
    if (!rutValidation.valid) return NextResponse.json({ error: rutValidation.error, success: false }, { status: 400 })
    
    // Validate license class if provided
    if (body.license_type) {
      const licenseValidation = validateLicenseClass(body.license_type)
      if (!licenseValidation.valid) return NextResponse.json({ error: licenseValidation.error, success: false }, { status: 400 })
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
    
    // Log audit
    await logAudit(user.id, 'CREATE', 'driver', data.id, { driver_name: data.full_name })
    
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver', success: false }, { status: 500 })
  }
}
