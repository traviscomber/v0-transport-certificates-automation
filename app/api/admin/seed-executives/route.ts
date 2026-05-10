import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"

export const dynamic = 'force-dynamic'

const EXECUTIVES_DATA = [
  {
    full_name: 'Olga Lydia Carrasco Olivares',
    rut: '10574005-0',
    email_auth: 'olga.carrasco@labbe.cl',
    password_hash: '$2a$10$h7vYOdLXJ5v8L9K2Q3R8C.K5X2p0M9N5B8C1D2E3F4G5H6I7J8K9L0',
    phone: '+56977764753',
    email: 'olga.carrasco@labbe.cl',
    cargo: 'Ejecutiva'
  },
  {
    full_name: 'Carolina Pilar Sepulveda Contreras',
    rut: '15464094-0',
    email_auth: 'carolina.sepulveda@labbe.cl',
    password_hash: '$2a$10$K8M1N2O3P4Q5R6S7T8U9V.W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5',
    phone: '+56950067666',
    email: 'carolina.sepulveda@labbe.cl',
    cargo: 'Ejecutiva'
  },
  {
    full_name: 'Daniela Constanza Silva Rojas',
    rut: '17768246-2',
    email_auth: 'daniela.silva@labbe.cl',
    password_hash: '$2a$10$L6M7N8O9P0Q1R2S3T4U5V.W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1',
    phone: '+56978540722',
    email: 'daniela.silva@labbe.cl',
    cargo: 'Ejecutiva'
  },
  {
    full_name: 'Cecilia Del Carmen Farias Muñoz',
    rut: '9888992-2',
    email_auth: 'cecilia.farias@labbe.cl',
    password_hash: '$2a$10$M7N8O9P0Q1R2S3T4U5V6W.X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2',
    phone: '+56978540798',
    email: 'cecilia.farias@labbe.cl',
    cargo: 'Ejecutiva'
  },
  {
    full_name: 'Diego Andres Gonzalez Valenzuela',
    rut: '20114106-0',
    email_auth: 'diego.gonzalez@labbe.cl',
    password_hash: '$2a$10$N8O9P0Q1R2S3T4U5V6W7X.Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3',
    phone: '+56978455527',
    email: 'diego.gonzalez@labbe.cl',
    cargo: 'Jefe RRHH'
  },
  {
    full_name: 'Katherinne Johanna Canales Hernandez',
    rut: '18717311-6',
    email_auth: 'katherinne.canales@labbe.cl',
    password_hash: '$2a$10$O9P0Q1R2S3T4U5V6W7X8Y.Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4',
    phone: '+56956139744',
    email: 'katherinne.canales@labbe.cl',
    cargo: 'Asistente RRHH'
  }
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // First, get or create Transportes Labbe company
    const { data: labbe, error: labbeError } = await supabase
      .from('transportistas')
      .select('id')
      .eq('rut', '78.376.780-5')
      .single()

    let labbe_id: string
    
    if (!labbe) {
      // Create Transportes Labbe if it doesn't exist
      const { data: newLabbe, error: createError } = await supabase
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
      
      if (createError) throw createError
      labbe_id = newLabbe.id
    } else {
      labbe_id = labbe.id
    }

    // Now upsert all executives with unique passwords
    const results = []
    
    for (const exec of EXECUTIVES_DATA) {
      const { data, error } = await supabase
        .from('executive_staff')
        .upsert({
          transportista_id: labbe_id,
          full_name: exec.full_name,
          rut: exec.rut,
          email_auth: exec.email_auth,
          password_hash: exec.password_hash,
          phone: exec.phone,
          email: exec.email,
          cargo: exec.cargo,
          login_enabled: true
        }, {
          onConflict: 'rut'
        })
        .select()

      if (error) {
        results.push({
          name: exec.full_name,
          status: 'error',
          message: error.message
        })
      } else {
        results.push({
          name: exec.full_name,
          status: 'success',
          rut: exec.rut,
          email: exec.email_auth
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transportes Labbe executives loaded successfully',
      labbe_id,
      results
    })

  } catch (error) {
    console.error('[v0] Error seeding executives:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
