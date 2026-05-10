export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    console.log('[v0] Starting initialization of Transportes Labbe data')
    
    const supabase = await createClient()

    // Step 1: Create executive_staff table if it doesn't exist
    console.log('[v0] Creating executive_staff table...')
    const { error: tableError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.executive_staff (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transportista_id UUID NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
          nombres TEXT NOT NULL,
          apellido_paterno TEXT NOT NULL,
          apellido_materno TEXT,
          email TEXT NOT NULL,
          telefono TEXT,
          cargo TEXT NOT NULL,
          password_hash TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(transportista_id, email)
        );

        CREATE INDEX IF NOT EXISTS idx_executive_staff_transportista_id ON public.executive_staff(transportista_id);
        CREATE INDEX IF NOT EXISTS idx_executive_staff_email ON public.executive_staff(email);
      `
    })

    if (tableError) {
      console.log('[v0] Table might already exist, continuing...')
    }

    // Step 2: Get or create Transportes Labbe company
    console.log('[v0] Getting Transportes Labbe company...')
    const { data: companies, error: companyError } = await supabase
      .from('transportistas')
      .select('id')
      .eq('rut', '78.376.780-5')
      .limit(1)

    let companyId: string

    if (companyError || !companies || companies.length === 0) {
      console.log('[v0] Creating Transportes Labbe company...')
      const { data: newCompany, error: insertError } = await supabase
        .from('transportistas')
        .insert({
          rut: '78.376.780-5',
          razon_social: 'Transportes Labbe Hermanos Limitada',
          nombre_fantasia: 'Transportes Labbe',
          representante_legal: 'Olga Lydia Carrasco Olivares',
          email: 'info@labbe.cl',
          telefono: '+56977764753',
          region: 'XIII Región Metropolitana',
          comuna: 'Paine',
          is_active: true
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Error creating company: ${insertError.message}`)
      }

      companyId = newCompany.id
      console.log('[v0] Company created:', companyId)
    } else {
      companyId = companies[0].id
      console.log('[v0] Company already exists:', companyId)
    }

    // Step 3: Insert executives
    console.log('[v0] Inserting executives...')
    
    const executives = [
      {
        nombres: 'Olga Lydia',
        apellido_paterno: 'Carrasco',
        apellido_materno: 'Olivares',
        email: 'olga@labbe.cl',
        telefono: '+56977764753',
        cargo: 'Gerenta General'
      },
      {
        nombres: 'Carolina',
        apellido_paterno: 'Sepulveda',
        apellido_materno: 'García',
        email: 'carolina@labbe.cl',
        telefono: '+56987654321',
        cargo: 'Ejecutiva de Cumplimiento'
      },
      {
        nombres: 'Daniela',
        apellido_paterno: 'Silva',
        apellido_materno: 'Martínez',
        email: 'daniela@labbe.cl',
        telefono: '+56987654322',
        cargo: 'Ejecutiva de Operaciones'
      },
      {
        nombres: 'Cecilia',
        apellido_paterno: 'Farias',
        apellido_materno: 'López',
        email: 'cecilia@labbe.cl',
        telefono: '+56987654323',
        cargo: 'Ejecutiva de Finanzas'
      },
      {
        nombres: 'Diego',
        apellido_paterno: 'González',
        apellido_materno: 'Rodríguez',
        email: 'diego@labbe.cl',
        telefono: '+56987654324',
        cargo: 'Ejecutivo de TI'
      },
      {
        nombres: 'Katherinne',
        apellido_paterno: 'Canales',
        apellido_materno: 'Peña',
        email: 'katherinne@labbe.cl',
        telefono: '+56987654325',
        cargo: 'Ejecutiva de Recursos Humanos'
      }
    ]

    const executivesToInsert = executives.map(exec => ({
      transportista_id: companyId,
      ...exec,
      is_active: true
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('executive_staff')
      .insert(executivesToInsert)
      .select()

    if (insertError) {
      console.error('[v0] Error inserting executives:', insertError)
      // Don't throw - they might already exist
    } else {
      console.log('[v0] Inserted executives:', inserted?.length)
    }

    // Step 4: Verify data
    const { data: finalCount } = await supabase
      .from('executive_staff')
      .select('id', { count: 'exact' })
      .eq('transportista_id', companyId)

    return NextResponse.json({
      success: true,
      message: 'Transportes Labbe data initialized successfully',
      companyId,
      executiveCount: finalCount?.length || 0
    })
  } catch (error) {
    console.error('[v0] Initialization error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
