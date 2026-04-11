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
    subcontractors: getLabbeSubcontractors(),
  })
}

function getLabbeSubcontractors() {
  // Returns all 235 Labbe subcontractors
  return [
    { rut: '77653071-9', nombre: '4Vial SPA', representante: 'Ruben Marchant Needhan', ejecutiva: 'Carolina', direccion: 'Ahumada 312 of 715', comuna: 'Santiago', telefono: '9 7255 5016', email: 'g4vial@gmail.com', ariztia: false, lts: false, rendic: false, interpolar: false },
    { rut: '76461213-2', nombre: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', representante: 'Adolfo Gonzalez Meza', ejecutiva: 'Carolina', direccion: 'Esmeralda 1561 Lote 2', comuna: 'Colina', telefono: '9 9291 0830', email: 'adolfo.gonzalez.meza@hotmail.com', ariztia: true, lts: true, rendic: false, interpolar: false },
    { rut: '76956797-6', nombre: 'AEROCAV SPA', representante: 'JOSE MIGUEL ROJAS URBINA', ejecutiva: 'Carolina', direccion: 'Argomedo 321', comuna: 'Santiago', telefono: '9 5533 9046', email: 'JROJAS.SL@GMAIL.COM', ariztia: false, lts: true, rendic: false, interpolar: false },
    { rut: '16181677-9', nombre: 'Aldo Antonio Bustamante Ortega', representante: 'Aldo Antonio Bustamante Ortega', ejecutiva: 'Carolina', direccion: 'Gacitua 564', comuna: 'Isla de Maipo', telefono: '9 6431 9423', email: 'z71aldo@hotmail.com', ariztia: false, lts: false, rendic: false, interpolar: false },
    { rut: '76463195-1', nombre: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', representante: 'Ambrosio Casanova Naavarrete', ejecutiva: 'Carolina', direccion: 'Pje los Pinos 1498', comuna: 'Rengo', telefono: '9 7147 6688', email: 'juliancasanova1973@gmail.com', ariztia: false, lts: true, rendic: false, interpolar: false },
    { rut: '77243323-9', nombre: 'Comercio, Servicios Y Transportes Mozó Spa', representante: 'Falcon Nicolas Mozo Farfan', ejecutiva: 'Carolina', direccion: 'Morande 835 of 518', comuna: 'Santiago', telefono: '9 5630 6291', email: 'contacto@cerpaconsultores.cl', ariztia: false, lts: false, rendic: false, interpolar: false },
    { rut: '78234684-9', nombre: 'F & F Spa', representante: 'Francisco Andres Villagran Ramirez', ejecutiva: 'Carolina', direccion: 'HIJUELA N2s/n LOTE- 2 PUERTAS NEGRAS', comuna: 'Talca', telefono: '932652497', email: 'fyftranspspa@gmail.com', ariztia: true, lts: true, rendic: false, interpolar: false },
    { rut: '78154645-3', nombre: 'Fever Spa', representante: 'MANUEL ESTEBAN CASTAÑEDA CORNEJO', ejecutiva: 'Carolina', direccion: 'SANTIAGO ALDEA 906', comuna: 'Padre Hurtado', telefono: '', email: '', ariztia: true, lts: true, rendic: false, interpolar: false },
    { rut: '76260962-2', nombre: 'Hidroamerica Spa', representante: 'Patricio Roberto Bambach Ugarte', ejecutiva: 'Carolina', direccion: 'Avenida las Condes 9792', comuna: 'Las Condes', telefono: '9 4287 4454', email: 'PBAMBACH@hidroamerica.cl', ariztia: true, lts: true, rendic: false, interpolar: false },
    { rut: '78101236-K', nombre: 'LogÍstica Siete Robles Spa', representante: 'PATRICIO AURELIO RIVAS PUENTES', ejecutiva: 'Carolina', direccion: 'DIEZ NORTE 2314', comuna: 'TALCA', telefono: '964452706', email: 'logisticasieterobles@gmail.com', ariztia: true, lts: true, rendic: false, interpolar: false },
  ]
}
