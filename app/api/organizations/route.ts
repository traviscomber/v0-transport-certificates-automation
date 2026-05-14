import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import * as bcrypt from 'bcrypt'

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

    // Auto-setup: Create transportista auth for subcontractor portal access
    try {
      // Generate password: labbe + last 4 digits of RUT (without guion)
      const rutDigits = tax_id.replace(/[.-]/g, '')
      const last4Digits = rutDigits.slice(-4)
      const plainPassword = `labbe${last4Digits}`
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(plainPassword, 10)
      
      // Create transportista_auth record
      const { error: authError } = await supabase
        .from('transportista_auth')
        .upsert(
          {
            rut: tax_id,
            password_hash: hashedPassword,
            is_active: true,
          },
          { onConflict: 'rut' }
        )

      if (authError) {
        console.error('[v0] Error creating transportista auth:', authError)
      } else {
        console.log('[v0] Transportista auth created for:', tax_id, 'Password:', plainPassword)
      }
    } catch (setupError) {
      console.warn('[v0] Organization created but auto-auth setup failed:', setupError)
      // Don't fail the organization creation if setup fails
    }
    
    return NextResponse.json({ id: data.id, name: data.name }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}
