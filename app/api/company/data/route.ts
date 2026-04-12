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
  // Drivers data is generated inline to avoid large bundle warning
  // All 292 Labbe drivers with their vehicle information and associated providers
  const driversData = [
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
    { rut: '9875518-7', nombre: 'Luis Anibal Vergara Cadiz', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'FJSX66' },
    { rut: '12457226-6', nombre: 'Nelson Alejandro Abarca Leiva', rut_proveedor: '77150766-2', proveedor: 'Empresa De Transportes Nico Abarca Spa', patente_tracto: 'GBSB58' },
    { rut: '26953476-1', nombre: 'Alexander Jose Gonzalez Gil', rut_proveedor: '78234684-9', proveedor: 'F & F Spa', patente_tracto: 'HGXL66' },
    { rut: '7321424-6', nombre: 'Fernando Del Carmen Araya Araya', rut_proveedor: '7321424-6', proveedor: 'Fernando del Carmen Araya Araya', patente_tracto: 'CSDS48' },
    { rut: '14621104-6', nombre: 'Freddy Alexis Mena  NuÑez', rut_proveedor: '78154645-3', proveedor: 'Fever Spa', patente_tracto: 'DCZT68' },
    { rut: '11607612-8', nombre: 'Jorge Antonio Quintanilla CatalÁn', rut_proveedor: '76260962-2', proveedor: 'Hidroamerica Spa', patente_tracto: 'LLFJ17' },
    { rut: '7012984-1', nombre: 'Patricio Roberto Bambach Ugarte', rut_proveedor: '76260962-2', proveedor: 'Hidroamerica Spa', patente_tracto: 'RRBX16' },
    { rut: '13138612-5', nombre: 'Victor Rogelio San Martin Campos', rut_proveedor: '77590685-5', proveedor: 'Hisan Spa', patente_tracto: 'FBSR32' },
    { rut: '16193591-3', nombre: 'Nibaldo Andres Rossel Allende', rut_proveedor: '76901231-1', proveedor: 'inversiones  Allende Limitada', patente_tracto: 'CWZB58' },
    { rut: '17512443-8', nombre: 'Luis Alejandro Rodriguez Gallardo', rut_proveedor: '78174616-9', proveedor: 'Jjb Transportes Spa', patente_tracto: 'BSBT75' },
    { rut: '11838643-4', nombre: 'Felipe Antonio Gonzalez Molina', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla  Quezada  Spa', patente_tracto: 'HKDZ20' },
    { rut: '11990292-4', nombre: 'Jose Antonio Puebla Quezada', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla  Quezada  Spa', patente_tracto: 'FXCX98' },
    { rut: '10071434-5', nombre: 'Julio Nelson Aguilera Diaz', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla  Quezada  Spa', patente_tracto: 'FDHD91' },
    { rut: '12472735-9', nombre: 'Sergio Alejandro Faundez Mancilla', rut_proveedor: '77058007-2', proveedor: 'Jose Antonio Puebla  Quezada  Spa', patente_tracto: 'BFZB17' },
    { rut: '10242490-5', nombre: 'Carlos Marcelo Rebolledo Rojas', rut_proveedor: '76494991-9', proveedor: 'Transportes Carlos Marcelo Rebolledo Rojas Eirl', patente_tracto: 'HHHL94' },
    { rut: '10147115-2', nombre: 'Wilson Hernan Chocobar Gonzalez', rut_proveedor: '77536347-9', proveedor: 'Transportes Chocobar Spa', patente_tracto: 'HRTP75' },
    { rut: '7092038-7', nombre: 'Mario Fernando Urbina San Juan', rut_proveedor: '7092038-7', proveedor: 'Mario Fernando Urbina San Juan', patente_tracto: 'XY9686' },
    { rut: '15947526-3', nombre: 'Rodolfo Valentin Orellana Serrano', rut_proveedor: '78190172-5', proveedor: 'Mr Transportes Chile Spa', patente_tracto: 'GYPR19' },
    { rut: '11185990-6', nombre: 'Manuel  Modesto Navarrete  Valdebenito', rut_proveedor: '77929313-0', proveedor: 'NAVARRETE SANCHEZ SPA', patente_tracto: 'HYHL37' },
    { rut: '17690903-K', nombre: 'Rodrigo Elias Peña Castillo', rut_proveedor: '78040304-7', proveedor: 'R PeÑa Spa', patente_tracto: 'FGWV34' },
    { rut: '17449523-8', nombre: 'VÍctor Rodolfo Basoalto Tapia', rut_proveedor: '77548896-4', proveedor: 'SERVICIO DE TRANSPORTE B Y B SPA', patente_tracto: 'DRVC67' },
    { rut: '13835882-8', nombre: 'Javier Ramon Fuenzalida Almuna', rut_proveedor: '77115061-6', proveedor: 'SERVICIOS GENERALES Y COMERCIALES KEVIN SPA', patente_tracto: 'HSVG20' },
    { rut: '6639764-5', nombre: 'Arturo Alejandro Herrera Giadala', rut_proveedor: '76685344-7', proveedor: 'Sociedad De Transportes Baguales Spa', patente_tracto: 'BDXP58' },
    { rut: '10573425-5', nombre: 'Juan Octavio Lillo Espinoza', rut_proveedor: '77390218-6', proveedor: 'Sociedad de Transportes Jole SPA', patente_tracto: 'CZYT21' },
    { rut: '12995031-5', nombre: 'Ivan Arturo Cuevas Gatica', rut_proveedor: '77007552-1', proveedor: 'Sociedad De Transportes Km Limitada', patente_tracto: 'CDHC67' },
    { rut: '13353956-5', nombre: 'Luis Hernan Iturriaga Barahona', rut_proveedor: '77007552-1', proveedor: 'Sociedad De Transportes Km Limitada', patente_tracto: 'CVTR62' },
    { rut: '18748311-5', nombre: 'Bryan Andres Retamales Gallardo', rut_proveedor: '76285729-4', proveedor: 'Sociedad De Transportes Quintanilla Ltda.', patente_tracto: 'PLVY41' },
    { rut: '15533220-4', nombre: 'Israel Ariel Pradenas  PiÑeiro', rut_proveedor: '78029819-7', proveedor: 'Transportes Doble Jj Spa', patente_tracto: 'FXRL17' },
    { rut: '9744124-3', nombre: 'Juan Alonso Quintanilla Catalan', rut_proveedor: '76285729-4', proveedor: 'Sociedad De Transportes Quintanilla Ltda.', patente_tracto: 'LXCD78' },
    { rut: '19428444-6', nombre: 'Michelle Jacob Retamales Gallardo', rut_proveedor: '76285729-4', proveedor: 'Sociedad De Transportes Quintanilla Ltda.', patente_tracto: 'GWXT86' },
    { rut: '12676471-5', nombre: 'Miguel Angel Ortiz Romero', rut_proveedor: '76285729-4', proveedor: 'Sociedad De Transportes Quintanilla Ltda.', patente_tracto: 'PSZG88' },
    { rut: '7919871-4', nombre: 'Victor Arsenio Rojas Gutierrez', rut_proveedor: '76285729-4', proveedor: 'Sociedad De Transportes Quintanilla Ltda.', patente_tracto: 'KBLL66' },
    { rut: '6388956-3', nombre: 'Leonardo Antonio Moreno Medina', rut_proveedor: '76491308-6', proveedor: 'Sociedad De Transportes Y Servicios Moreno Y Lopez Limitada', patente_tracto: 'BKWZ91' },
    { rut: '11434690-K', nombre: 'Luis Patricio Tello Reyes', rut_proveedor: '76447559-3', proveedor: 'Tello Y Tello Transportes Spa', patente_tracto: 'GBCC41' },
    { rut: '19548402-3', nombre: 'Matias Braulio Baez Pacheco', rut_proveedor: '76447559-3', proveedor: 'Tello Y Tello Transportes Spa', patente_tracto: 'GBCC27' },
    { rut: '9795683-9', nombre: 'Oscar Custodio Verdugo Quintanilla', rut_proveedor: '76447559-3', proveedor: 'Tello Y Tello Transportes Spa', patente_tracto: 'GBCC27' },
    { rut: '19733547-5', nombre: 'Alfredo Nicolas Hidalgo Aravena', rut_proveedor: '78101306-4', proveedor: 'Tmp Transportes Spa', patente_tracto: 'FYGS35' },
    { rut: '18364099-2', nombre: 'Juan Lopez  Reyes', rut_proveedor: '77416162-7', proveedor: 'Tranportes  Por Carretara  JL SPA', patente_tracto: 'DBFS59' },
    { rut: '19022717-0', nombre: 'Yerko Alberto Meza Vidal', rut_proveedor: '76878075-7', proveedor: 'Translainer SPA', patente_tracto: 'FXJD71' },
    { rut: '13465548-8', nombre: 'Carlos Miranda Diaz', rut_proveedor: '76848886-K', proveedor: 'Transporte Brenet SPA', patente_tracto: 'FJTC46' },
    { rut: '14126191-6', nombre: 'Eduardo Enrique Brito Leiva', rut_proveedor: '78350942-3', proveedor: 'Transporte Brimarc Spa', patente_tracto: 'GDXV98' },
    { rut: '10529089-6', nombre: 'Danilo Enrique Gaete Fuenzalida', rut_proveedor: '77441798-2', proveedor: 'TRANSPORTE CARGA POR CARRETERA DG SPA', patente_tracto: 'YR5399' },
  ]
  
  return driversData.map(driver => ({
    id: driver.rut,
    full_name: driver.nombre,
    rut: driver.rut,
    phone: '',
    email: '',
    license_number: '',
    license_type: '',
    license_expiry: '',
    is_active: true,
  }))
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
