import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validatePlate, validateVIN } from "@/lib/validations"

export const dynamic = 'force-dynamic'

// GET single vehicle
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data, error } = await supabase
      .from('vehicles')
      .select(`*, organization:organizations(id, name)`)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }
}

// PUT update vehicle with validation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    
    // Validate plate if provided
    if (body.plate) {
      const plateValidation = validatePlate(body.plate)
      if (!plateValidation.valid) return NextResponse.json({ error: plateValidation.error }, { status: 400 })
    }
    
    // Validate VIN if provided
    if (body.vin) {
      const vinValidation = validateVIN(body.vin)
      if (!vinValidation.valid) return NextResponse.json({ error: vinValidation.error }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: body.year,
        type: body.type,
        vin: body.vin,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

// DELETE vehicle (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { error } = await supabase
      .from('vehicles')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Vehicle deleted' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}

