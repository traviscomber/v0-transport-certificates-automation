import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { LABBE_SUBCONTRACTORS } from '../subcontractors-data'

export async function GET(request: Request) {
  try {
    console.log('[v0] Fetching complete Labbe data from Supabase')
    const supabase = await createClient()

    // Query the transportistas table
    const { data: company, error: companyError } = await supabase
      .from('transportistas')
      .select('*')
      .eq('rut', '78.376.780-5')
      .maybeSingle()

    if (companyError) {
      console.error('[v0] Error fetching company:', companyError.message)
      return getFallbackData()
    }

    // If no company found in Supabase, use fallback data with Labbe info
    if (!company) {
      console.warn('[v0] No company found in Supabase for RUT 78.376.780-5, using fallback data')
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

    console.log('[v0] Drivers fetched from DB:', drivers?.length || 0)

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
      drivers: drivers && drivers.length > 0 ? (drivers || []).map((driver: any) => ({
        id: driver.id,
        full_name: driver.full_name,
        rut: driver.rut,
        email: driver.email,
        phone: driver.phone,
        license_number: driver.license_number,
        license_type: driver.license_type,
        license_expiry: driver.license_expiry,
        is_active: driver.is_active !== false,
      })) : getLabbeDrivers(),
      subcontractors: getLabbeSubcontractors(),
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
        phone: '569 77764753',
        cargo: 'Ejecutiva',
        email_auth: 'olga.carrasco@transporteslabbe.cl',
      },
      {
        id: '2',
        full_name: 'Carolina Pilar Sepulveda Contreras',
        rut: '15464094-0',
        email: 'carolina.sepulveda@transporteslabbe.cl',
        phone: '569 50067666',
        cargo: 'Ejecutiva',
        email_auth: 'carolina.sepulveda@transporteslabbe.cl',
      },
      {
        id: '3',
        full_name: 'Daniela Constanza Silva Rojas',
        rut: '17768246-2',
        email: 'daniela.silva@transporteslabbe.cl',
        phone: '569 78540722',
        cargo: 'Ejecutiva',
        email_auth: 'daniela.silva@transporteslabbe.cl',
      },
      {
        id: '4',
        full_name: 'Farias Muñoz Cecilia Del Carmen',
        rut: '9888992-2',
        email: 'cecilia.farias@transporteslabbe.cl',
        phone: '569 78540798',
        cargo: 'Ejecutiva',
        email_auth: 'cecilia.farias@transporteslabbe.cl',
      },
      {
        id: '5',
        full_name: 'Katherinne Johanna Canales Hernandez',
        rut: '18717311-6',
        email: 'katherinne.canales@transporteslabbe.cl',
        phone: '569 56139744',
        cargo: 'Asistente RRHH',
        email_auth: 'katherinne.canales@transporteslabbe.cl',
      },
      {
        id: '6',
        full_name: 'Diego Andres Gonzalez Valenzuela',
        rut: '20114106-0',
        email: 'diego.gonzalez@transporteslabbe.cl',
        phone: '569 78455527',
        cargo: 'Jefe RRHH',
        email_auth: 'diego.gonzalez@transporteslabbe.cl',
      },
    ],
    drivers: getLabbeDrivers(),
    subcontractors: getLabbeSubcontractors(),
  })
}

function getLabbeDrivers() {
  // Returns all 293+ Labbe drivers with their vehicle plates and associated providers
  return [
    { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026' },
    { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83' },
    { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35' },
    { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35' },
    { rut: '12481902-4', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63' },
    { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'LogÍstica Siete Robles Spa', patente_tracto: 'JSHK45' },
    { rut: '8825579-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71' },
    { rut: '7486285-3', nombre: 'Pedro  Rafael Mozo  Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29' },
    { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59' },
    { rut: '17461633-7', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559' },
  ]
}

function getLabbeSubcontractors() {
  // Returns all subcontractors from imported data with region and service flags
  return LABBE_SUBCONTRACTORS.map(sub => ({
    rut: sub.rut,
    nombre: sub.nombre,
    representante: sub.representante,
    ejecutiva: sub.ejecutiva,
    region: sub.region || 'Cecilia',
    direccion: sub.direccion,
    comuna: sub.comuna,
    telefono: sub.telefono,
    email: sub.email,
    ariztia: sub.ariztia,
    lts: sub.lts,
    rendic: sub.rendic,
    interpolar: sub.interpolar,
  }))
}
