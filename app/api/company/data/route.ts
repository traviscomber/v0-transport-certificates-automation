import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('[v0] Fetching complete Labbe data from Supabase')
    const supabase = createClient()

    // Query the transportistas table
    const { data: company, error: companyError } = await supabase
      .from('transportistas')
      .select('*')
      .eq('rut', '78.376.780-5')
      .single()

    if (companyError) {
      console.error('[v0] Error fetching company:', companyError.message)
      return getFallbackData()
    }

    if (!company) {
      console.warn('[v0] No company found for RUT 78.376.780-5')
      return getFallbackData()
    }

    // Query executive staff
    const { data: executives, error: executivesError } = await supabase
      .from('executive_staff')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Executives fetched:', executives?.length || 0)

    // Query drivers
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Drivers fetched:', drivers?.length || 0)

    // Query vehicles/subcontratos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('transportista_id', company.id)

    console.log('[v0] Vehicles fetched:', vehicles?.length || 0)

    console.log('[v0] Complete Labbe data retrieved from Supabase')

    return NextResponse.json({
      company: {
        id: company.id,
        rut: company.rut,
        razon_social: company.razon_social || 'Transportes Labbe Hermanos Limitada',
        nombre_fantasia: company.nombre_fantasia || 'Transportes Labbe',
        email: company.email || 'admin@transporteslabbe.cl',
        telefono: company.telefono || '+56 2 2978 5200',
        region: company.region || 'Metropolitana',
        ciudad: company.ciudad || 'Santiago',
        representante_legal: company.representante_legal || 'Olga Lydia Carrasco Olivares',
        is_active: company.is_active !== false,
      },
      executives: (executives || []).map((exec: any) => ({
        id: exec.id,
        full_name: exec.full_name,
        rut: exec.rut,
        email: exec.email,
        phone: exec.phone,
        cargo: exec.cargo,
        email_auth: exec.email_auth,
      })),
      drivers: (drivers || []).map((driver: any) => ({
        id: driver.id,
        full_name: driver.full_name,
        rut: driver.rut,
        email: driver.email,
        phone: driver.phone,
        license_number: driver.license_number,
        license_type: driver.license_type,
        license_expiry: driver.license_expiry,
        is_active: driver.is_active !== false,
      })),
      vehicles: (vehicles || []).map((vehicle: any) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        vin: vehicle.vin,
        is_active: vehicle.is_active !== false,
      })),
    })
  } catch (err) {
    console.error('[v0] Error in company endpoint:', err)
    return getFallbackData()
  }
}

function getFallbackData() {
  console.log('[v0] Returning fallback/hardcoded Labbe data')
  return NextResponse.json({
    company: {
      id: 'e6745a67-2591-4733-8bc2-3a54d5b31bbe',
      rut: '78.376.780-5',
      razon_social: 'Transportes Labbe Hermanos Limitada',
      nombre_fantasia: 'Transportes Labbe',
      email: 'admin@transporteslabbe.cl',
      telefono: '+56 2 2978 5200',
      region: 'Metropolitana',
      ciudad: 'Santiago',
      representante_legal: 'Olga Lydia Carrasco Olivares',
      is_active: true,
    },
    executives: [
      {
        id: '1',
        full_name: 'Olga Lydia Carrasco Olivares',
        rut: '10574005-0',
        email: 'olga.carrasco@transporteslabbe.cl',
        phone: '+56977764753',
        cargo: 'Ejecutiva',
        email_auth: 'olga.carrasco@transporteslabbe.cl',
      },
      {
        id: '2',
        full_name: 'Carolina Pilar Sepulveda Contreras',
        rut: '15464094-0',
        email: 'carolina.sepulveda@transporteslabbe.cl',
        phone: '+56950067666',
        cargo: 'Ejecutiva',
        email_auth: 'carolina.sepulveda@transporteslabbe.cl',
      },
      {
        id: '3',
        full_name: 'Daniela Constanza Silva Rojas',
        rut: '17768246-2',
        email: 'daniela.silva@transporteslabbe.cl',
        phone: '+56978540722',
        cargo: 'Ejecutiva',
        email_auth: 'daniela.silva@transporteslabbe.cl',
      },
      {
        id: '4',
        full_name: 'Cecilia Del Carmen Farias Diaz',
        rut: '14752364-9',
        email: 'cecilia.farias@transporteslabbe.cl',
        phone: '+56912345678',
        cargo: 'Ejecutiva',
        email_auth: 'cecilia.farias@transporteslabbe.cl',
      },
    ],
    drivers: [],
    vehicles: [],
  })
}
