import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    console.log('[v0] Starting user insertion')

    const adminClient = createAdminClient()

    console.log('[v0] Fetching all organizations to find Labbe')
    
    // Get ALL organizations first to debug
    const { data: allOrgs } = await adminClient.from('organizations').select('id, name')
    console.log('[v0] All organizations:', allOrgs)

    let organizationId: string | null = null
    
    // Try different search patterns
    if (allOrgs && allOrgs.length > 0) {
      const labbeOrg = allOrgs.find(o => o.name?.toLowerCase().includes('labbe') || o.name?.toLowerCase().includes('transportes'))
      if (labbeOrg) {
        organizationId = labbeOrg.id
        console.log('[v0] Found organization:', labbeOrg.name, 'ID:', organizationId)
      } else {
        // Use first organization as fallback
        organizationId = allOrgs[0].id
        console.log('[v0] Using first organization:', allOrgs[0].name, 'ID:', organizationId)
      }
    } else {
      console.warn('[v0] No organizations found')
    }

    // 6 usuarios
    const usuarios = [
      {
        full_name: 'Olga Lydia Carrasco Olivares',
        rut: '10574005-0',
        email: 'olga.carrasco@transporteslabbe.cl',
        phone: '+56977764753',
      },
      {
        full_name: 'Carolina Pilar Sepulveda Contreras',
        rut: '15464094-0',
        email: 'carolina.sepulveda@transporteslabbe.cl',
        phone: '+56950067666',
      },
      {
        full_name: 'Daniela Constanza Silva Rojas',
        rut: '17768246-2',
        email: 'daniela.silva@transporteslabbe.cl',
        phone: '+56978540722',
      },
      {
        full_name: 'Cecilia Del Carmen Farias Muñoz',
        rut: '9888992-2',
        email: 'cecilia.farias@transporteslabbe.cl',
        phone: '+56978540798',
      },
      {
        full_name: 'Diego Andres Gonzalez Valenzuela',
        rut: '20114106-0',
        email: 'diego.gonzalez@transporteslabbe.cl',
        phone: '+56978455527',
      },
      {
        full_name: 'Katherinne Johanna Canales Hernandez',
        rut: '18717311-6',
        email: 'katherinne.canales@transporteslabbe.cl',
        phone: '+56956139744',
      },
    ]

    const created = []
    const errors = []

    for (const usuario of usuarios) {
      try {
        const id = randomUUID()

        console.log('[v0] Creating user:', usuario.rut)

        const { data, error } = await adminClient
          .from('profiles')
          .insert({
            id: id,
            email: usuario.email,
            full_name: usuario.full_name,
            role: 'admin',
            rut: usuario.rut,
            phone: usuario.phone,
            is_active: true,
            ...(organizationId && { organization_id: organizationId }),
          })
          .select()
          .single()

        if (error) {
          console.error('[v0] Error for', usuario.rut, ':', error.message)
          errors.push({ rut: usuario.rut, error: error.message })
        } else {
          console.log('[v0] Created:', usuario.rut)
          created.push(usuario.rut)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Error:', msg)
        errors.push({ rut: usuario.rut, error: msg })
      }
    }

    console.log('[v0] Insertion complete:', { created: created.length, errors: errors.length })

    return NextResponse.json({
      success: true,
      created: created,
      errors: errors,
      message: `Created ${created.length} users${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
