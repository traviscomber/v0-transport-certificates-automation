import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { allDriversData } from '@/lib/data/all-drivers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting driver sync from allDriversData to conductores table...')

    const adminClient = await createAdminClient()

    // Delete all existing conductores
    console.log('[v0] Deleting existing conductores...')
    const { error: deleteError } = await adminClient
      .from('conductores')
      .delete()
      .neq('id', null) // Delete all rows

    if (deleteError) {
      console.error('[v0] Error deleting conductores:', deleteError)
      return NextResponse.json(
        { error: `Error deleting conductores: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log('[v0] Deleted all existing conductores')

    // Insert all drivers from allDriversData
    console.log('[v0] Inserting', allDriversData.length, 'drivers from allDriversData...')

    const conductoresToInsert = allDriversData.map(driver => ({
      id: driver.id,
      rut: driver.rut,
      nombres: driver.nombres,
      apellidos: `${driver.apellido_paterno} ${driver.apellido_materno}`.trim(),
      transportista_id: null
    }))

    const { data: insertedData, error: insertError } = await adminClient
      .from('conductores')
      .insert(conductoresToInsert)
      .select()

    if (insertError) {
      console.error('[v0] Error inserting conductores:', insertError)
      return NextResponse.json(
        { error: `Error inserting conductores: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log('[v0] ✅ Successfully synced', insertedData?.length || 0, 'drivers to conductores table')

    return NextResponse.json({
      success: true,
      message: `Synced ${insertedData?.length || 0} drivers to conductores table`,
      driversCount: insertedData?.length
    })
  } catch (error) {
    console.error('[v0] Exception during driver sync:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error during sync' },
      { status: 500 }
    )
  }
}
