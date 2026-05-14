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

    // ===== Auto-setup for new organization =====
    // Create a default admin conductor portal for the organization
    try {
      // Create default conductor/portal for the organization
      const defaultConductor = {
        rut: `${tax_id}-${Math.random().toString(36).substring(7)}`,
        nombres: `Portal - ${name}`,
        apellido_paterno: 'Admin',
        apellido_materno: '',
        rut_proveedor: tax_id,
        clase_licencia: 'B',
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const { data: conductorData, error: conductorError } = await supabase
        .from('conductores')
        .insert(defaultConductor)
        .select()

      if (conductorError) {
        console.error('[v0] Error creating default conductor:', conductorError)
      } else {
        console.log('[v0] Default conductor created:', conductorData?.[0]?.id)

        const conductorId = conductorData?.[0]?.id

        // Enable conductor by creating auth record
        if (conductorId) {
          const { error: authError } = await supabase
            .from('conductor_auth')
            .insert({
              rut: defaultConductor.rut_proveedor,
              conductor_id: conductorId,
              password_hash: await generateDefaultPassword(), // Default enabled password
              is_active: true,
              created_at: new Date().toISOString(),
            })

          if (authError) {
            console.error('[v0] Error enabling conductor auth:', authError)
          } else {
            console.log('[v0] Conductor auth enabled for:', conductorId)
          }

          // Create license classes
          const licenseClasses = ['A2', 'A5', 'B', 'C']
          const { error: licenseError } = await supabase
            .from('conductor_licenses')
            .insert(
              licenseClasses.map((clase) => ({
                conductor_id: conductorId,
                clase_licencia: clase,
                is_active: true,
                created_at: new Date().toISOString(),
              }))
            )

          if (licenseError) {
            console.error('[v0] Error creating conductor licenses:', licenseError)
          } else {
            console.log('[v0] Conductor licenses created for:', conductorId)
          }

          // Enable document uploads by creating a flag or permission record if needed
          const { error: uploadError } = await supabase
            .from('conductor_settings')
            .insert({
              conductor_id: conductorId,
              can_upload_documents: true,
              documents_enabled_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (uploadError && uploadError.code !== 'PGRST116') {
            console.error('[v0] Error enabling document uploads:', uploadError)
          } else {
            console.log('[v0] Document uploads enabled for conductor:', conductorId)
          }
        }
      }
    } catch (setupError) {
      console.warn('[v0] Organization created but auto-setup failed:', setupError)
      // Don't fail the organization creation if setup fails
    }
    
    return NextResponse.json({ id: data.id, name: data.name }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

// Helper function to generate a default password hash
async function generateDefaultPassword(): Promise<string> {
  // In production, this should use the same hashPassword function from auth-conductor
  // For now, return a basic hash - the actual implementation depends on your hashing setup
  try {
    const { hashPassword } = await import('@/lib/supabase/auth-conductor')
    return await hashPassword('labbe_default_portal')
  } catch {
    // Fallback if import fails
    console.warn('[v0] Using fallback password generation')
    return 'labbe_default_portal'
  }
}
