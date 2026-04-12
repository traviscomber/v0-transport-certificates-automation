import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('[v0] API company/data called - Loading all subcontractors from TypeScript data')

    // Use all 221 subcontractors from TypeScript data file
    const subcontractorsData = allSubcontractorsData

    console.log(`[v0] Loaded ${subcontractorsData.length} subcontractors from all-subcontractors.ts`)

    // Conductores data (sample)
    const driversData = [
      { id: '1', rut: '18012757-7', nombres: 'Ruben', apellido_paterno: 'Marchant', apellido_materno: 'Needhan', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026', clase_licencia: 'A-4', is_active: true },
      { id: '2', rut: '10907750-K', nombres: 'Adolfo', apellido_paterno: 'Gonzalez', apellido_materno: 'Meza', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83', clase_licencia: 'A-4', is_active: true },
      { id: '3', rut: '12879880-3', nombres: 'Juan', apellido_paterno: 'Vargas', apellido_materno: 'Jerve', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35', clase_licencia: 'A-4', is_active: true },
      { id: '4', rut: '16181677-9', nombres: 'Aldo', apellido_paterno: 'Bustamante', apellido_materno: 'Ortega', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35', clase_licencia: 'A-4', is_active: true },
      { id: '5', rut: '12481902-4', nombres: 'Ambrosio', apellido_paterno: 'Casanova', apellido_materno: 'Naavarrete', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63', clase_licencia: 'A-4', is_active: true },
    ]

    const executivesData = [
      { id: '1', full_name: 'Carolina Martinez', rut: '12345678-9', email: 'carolina@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Roberto Silva', rut: '13456789-K', email: 'roberto@labbe.cl', phone: '+56913456789', cargo: 'Gerente Operaciones' },
      { id: '3', full_name: 'Ana Garcia', rut: '14567890-2', email: 'ana@labbe.cl', phone: '+56914567890', cargo: 'Coordinadora' },
      { id: '4', full_name: 'Cecilia Herrera', rut: '14567890-3', email: 'cecilia@labbe.cl', phone: '+56914567891', cargo: 'Ejecutiva de Cuenta' },
    ]

    // Enrich response with all data
    return NextResponse.json({
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@labbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'Juan Perez',
        is_active: true
      },
      executives: executivesData,
      drivers: driversData,
      subcontractors: subcontractorsData,
      stats: {
        totalSubcontractors: subcontractorsData.length,
        totalDrivers: driversData.length
      }
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: errorMessage },
      { status: 500 }
    )
  }
}
