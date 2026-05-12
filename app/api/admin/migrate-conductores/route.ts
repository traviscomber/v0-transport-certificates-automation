import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Read conductores.txt file with all 293 real conductores
    const filePath = path.join(process.cwd(), 'data', 'conductores.txt')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.trim().split('\n')
    
    // Skip header line and parse data
    // Format: Rut_Conductor	Conductor	Rut_Proveedor	Proveedor	Patente Tracto
    const conductores = lines.slice(1).map(line => {
      const [rut, nombre, rut_proveedor, proveedor, patente] = line.split('\t')
      const nameParts = nombre.trim().split(' ')
      const nombres = nameParts.slice(0, 2).join(' ')
      const apellidoPaterno = nameParts[2] || ''
      const apellidoMaterno = nameParts.slice(3).join(' ') || ''
      
      return {
        rut: rut.trim(),
        nombres: nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        rut_proveedor: rut_proveedor.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
      }
    })

    console.log('[v0] Parsed', conductores.length, 'conductores from conductores.txt')

    // Delete ALL existing conductores (clean migration)
    console.log('[v0] Cleaning existing conductores...')
    const { error: deleteError } = await supabase
      .from('conductores')
      .delete()
      .neq('rut', 'PLACEHOLDER')

    if (deleteError) {
      console.error('[v0] Error deleting conductores:', deleteError)
    }

    // Insert in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < conductores.length; i += batchSize) {
      const batch = conductores.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('conductores')
        .upsert(batch, { onConflict: 'rut' })
        .select()

      if (error) {
        console.error('[v0] Error inserting batch', Math.floor(i / batchSize), ':', error)
        throw error
      }

      insertedCount += data?.length || 0
      console.log('[v0] Batch', Math.floor(i / batchSize) + 1, '/', Math.ceil(conductores.length / batchSize), 'completed')
    }

    console.log('[v0] Successfully migrated', insertedCount, 'conductores to Supabase')

    return NextResponse.json({
      success: true,
      message: `Migrated ${insertedCount} conductores from conductores.txt to Supabase`,
      count: insertedCount,
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
