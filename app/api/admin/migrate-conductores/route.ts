import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allConductores, allTransportistas } from '@/lib/data/all-data'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // First, delete all fake conductores (RUTs starting with 0700)
    console.log('[v0] Deleting fake conductores with RUTs starting with 0700...')
    const { error: deleteError } = await supabase
      .from('conductores')
      .delete()
      .like('rut', '0700%')

    if (deleteError) {
      console.error('[v0] Error deleting fake conductores:', deleteError)
    } else {
      console.log('[v0] Fake conductores deleted successfully')
    }

    // Create conductores from allConductores (explicit list)
    const conductoresFromList = allConductores.map(c => {
      const nameParts = c.nombre.split(' ')
      const nombres = nameParts.slice(0, 2).join(' ') || c.nombre
      const apellidoPaterno = nameParts[2] || ''
      const apellidoMaterno = nameParts.slice(3).join(' ') || ''
      
      return {
        rut: c.rut,
        nombres: nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        rut_proveedor: c.rut_proveedor,
        is_active: true,
        created_at: new Date().toISOString(),
      }
    })

    // Create conductores from transportistas representatives (each transportista has 1 conductor = representante)
    const existingRuts = new Set(conductoresFromList.map(c => c.rut))
    const conductoresFromTransportistas = allTransportistas
      .filter(t => !existingRuts.has(t.rut)) // Don't duplicate if already in allConductores
      .map(t => {
        const nameParts = t.representante.split(' ')
        const nombres = nameParts.slice(0, 2).join(' ') || t.representante
        const apellidoPaterno = nameParts[2] || ''
        const apellidoMaterno = nameParts.slice(3).join(' ') || ''
        
        return {
          rut: t.rut, // Use transportista RUT as conductor RUT (representante is the driver)
          nombres: nombres,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          rut_proveedor: t.rut, // Link back to the transportista
          is_active: true,
          created_at: new Date().toISOString(),
        }
      })

    const conductoresForInsert = [...conductoresFromList, ...conductoresFromTransportistas]
    console.log('[v0] Starting migration of', conductoresForInsert.length, 'conductores (', allConductores.length, 'explicit +', conductoresFromTransportistas.length, 'from transportistas)')

    // Insert real conductores
    const { data, error } = await supabase
      .from('conductores')
      .upsert(conductoresForInsert, { onConflict: 'rut' })
      .select()

    if (error) {
      console.error('[v0] Error inserting conductores:', error)
      throw error
    }

    const insertedCount = data?.length || 0
    console.log('[v0] ✅ Successfully migrated', insertedCount, 'REAL conductores to Supabase')

    return NextResponse.json({
      success: true,
      message: `Migrated ${insertedCount} REAL conductores to Supabase (deleted fake 0700* RUTs)`,
      count: insertedCount,
      conductores: data?.map(c => ({ rut: c.rut, nombres: c.nombres, rut_proveedor: c.rut_proveedor })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
