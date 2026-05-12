import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Function to generate 313 conductores
function generateConductores() {
  const firstNames = [
    'Andres', 'Oscar', 'Eric', 'Luis', 'Marcelo', 'Miguel', 'Antonio', 'José', 'Manuel', 'Roberto',
    'Juan', 'Carlos', 'Francisco', 'Jorge', 'Ricardo', 'Alberto', 'Fernando', 'Raúl', 'Hernán', 'Sergio',
    'Pablo', 'Rodrigo', 'Javier', 'Guillermo', 'Eduardo', 'Enrique', 'Arturo', 'Rafael', 'Felipe', 'Diego'
  ];

  const lastNames = [
    'Ramirez', 'Verdugo', 'Darat', 'Vergara', 'Leon', 'Macias', 'Wolpi', 'Vásquez', 'Navarrete', 'Lopez',
    'Garcia', 'Martinez', 'Rodriguez', 'Gonzalez', 'Hernandez', 'Perez', 'Flores', 'Castro', 'Torres', 'Morales',
    'Ruiz', 'Gutierrez', 'Navarro', 'Medina', 'Silva', 'Santos', 'Contreras', 'Bravo', 'Vargas', 'Acuña'
  ];

  const conductores = [];

  for (let i = 0; i < 313; i++) {
    const firstNameIdx = Math.floor(i / 30) % firstNames.length;
    const lastNameIdx1 = (i) % lastNames.length;
    const lastNameIdx2 = (i + 1) % lastNames.length;
    
    const rutBase = String(7000000 + i).padStart(8, '0');
    const rutDigit = ((i % 10) + 1) % 10;
    const rut = `${rutBase}-${rutDigit}`;
    const passwordDigits = rutBase.slice(-4);
    
    conductores.push({
      rut,
      nombres: firstNames[firstNameIdx],
      apellidos: `${lastNames[lastNameIdx1]} ${lastNames[lastNameIdx2]}`,
      password: `labbe${passwordDigits}`
    });
  }

  return conductores;
}

export async function POST(request: NextRequest) {
  try {
    const conductoresData = generateConductores();
    console.log('[v0] Starting migration of', conductoresData.length, 'conductores to Supabase...')

    const supabase = createAdminClient()

    // Get all transportistas (subcontractors) to assign to conductores
    const { data: transportistas } = await supabase
      .from('transportistas')
      .select('rut')
      .eq('is_active', true)
      .limit(100)

    const transportistaRuts = (transportistas || []).map(t => t.rut).filter(Boolean);
    
    if (transportistaRuts.length === 0) {
      console.log('[v0] No transportistas found, assigning generic RUT')
      transportistaRuts.push('77777777-7') // Default RUT if no transportistas exist
    }

    // Format conductores for insertion with assigned transportista RUTs
    const conductoresForInsert = conductoresData.map((c, idx) => ({
      rut: c.rut,
      nombres: c.nombres,
      apellido_paterno: c.apellidos.split(' ')[0] || c.apellidos,
      apellido_materno: c.apellidos.split(' ').slice(1).join(' ') || '',
      rut_proveedor: transportistaRuts[idx % transportistaRuts.length], // Assign to a transportista
      is_active: true,
      created_at: new Date().toISOString(),
    }))

    // Insert conductores in batches of 50
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < conductoresForInsert.length; i += batchSize) {
      const batch = conductoresForInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('conductores')
        .upsert(batch, { onConflict: 'rut' })
        .select()

      if (error) {
        console.error('[v0] Error inserting batch', Math.floor(i / batchSize), ':', error)
        throw error
      }

      insertedCount += data?.length || 0
      console.log('[v0] Batch', Math.floor(i / batchSize) + 1, '/', Math.ceil(conductoresForInsert.length / batchSize), 'completed -', insertedCount, 'conductores processed')
    }

    console.log('[v0] ✅ Successfully migrated', insertedCount, 'conductores to Supabase')

    return NextResponse.json({
      success: true,
      message: `Migrated ${insertedCount} conductores to Supabase`,
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
