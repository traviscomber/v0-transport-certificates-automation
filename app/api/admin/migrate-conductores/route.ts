import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allConductores } from '@/lib/data/all-data'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting migration of', allConductores.length, 'REAL conductores to Supabase...')

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

    // Format real conductores for insertion
    const conductoresForInsert = allConductores.map(c => {
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
