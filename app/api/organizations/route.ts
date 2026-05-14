import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET all organizations or filter by type
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    let query = supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

// POST create new organization
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Handle both naming conventions
    const name = body.name
    const tax_id = body.tax_id || body.rut
    const service_type = body.service_type || body.type || 'TRANSPORTE'
    
    if (!name || !tax_id) {
      return NextResponse.json(
        { error: 'name and tax_id are required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        tax_id,
        service_type,
        email: body.email || null,
        is_active: true,
      })
      .select('id, name')
      .single()
    
    if (error) {
      console.error('Error creating organization:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create organization' },
        { status: 500 }
      )
    }

    console.log('[v0] Organization created:', data.id)
    
    return NextResponse.json({ id: data.id, name: data.name }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
