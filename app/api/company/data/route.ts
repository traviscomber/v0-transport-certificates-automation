import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'
import { allDriversData } from '@/lib/data/all-drivers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('[v0] API company/data called')
    console.log('[v0] Using static driver/subcontractor data')

    // Use static data for drivers and subcontractors
    const driversData = allDriversData
    const subcontractorsData = allSubcontractorsData

    console.log('[v0] Loaded drivers:', driversData.length, 'subcontractors:', subcontractorsData.length)

    const executivesData = [
      { id: '1', full_name: 'Olga Carrasco', rut: '10574005-0', email: 'ocarrasco@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Carolina Sepúlveda', rut: '15464094-0', email: 'csepulveda@labbe.cl', phone: '+56913456789', cargo: 'Ejecutiva de Cuenta' },
      { id: '3', full_name: 'Daniela Silva', rut: '17768246-2', email: 'dsilva@labbe.cl', phone: '+56914567890', cargo: 'Ejecutiva de Cuenta' },
      { id: '4', full_name: 'Cecilia Farias', rut: '9888992-2', email: 'cfarias@labbe.cl', phone: '+56914567891', cargo: 'Ejecutiva de Cuenta' },
      { id: '5', full_name: 'Diego González', rut: '20114106-0', email: 'dgonzalez@labbe.cl', phone: '+56915678901', cargo: 'Ejecutivo de Cuenta' },
      { id: '6', full_name: 'Katherinne Canales', rut: '18717311-6', email: 'kcanales@labbe.cl', phone: '+56916789012', cargo: 'Ejecutiva de Cuenta' },
    ]

    const response = {
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@transporteslabbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'José Patricio Armando Labbé Cereceda',
        is_active: true
      },
      executives: executivesData,
      drivers: driversData,
      subcontractors: subcontractorsData,
      stats: {
        totalSubcontractors: subcontractorsData.length,
        totalDrivers: driversData.length
      }
    }

    console.log('[v0] Returning response with', driversData.length, 'drivers')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Error details:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: errorMessage },
      { status: 500 }
    )
  }
}
