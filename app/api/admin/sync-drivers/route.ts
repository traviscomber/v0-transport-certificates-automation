import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DRIVERS_DATA = [
  { rut: '18012757-7', nombre: 'Ruben Marchant Needhan', rut_proveedor: '77653071-9', proveedor: '4Vial SPA', patente_tracto: 'XW7026' },
  { rut: '10907750-K', nombre: 'Adolfo Gonzalez Meza', rut_proveedor: '76461213-2', proveedor: 'Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.', patente_tracto: 'FWKB83' },
  { rut: '12879880-3', nombre: 'Juan Manuel Vargas Jerve', rut_proveedor: '76956797-6', proveedor: 'AEROCAV SPA', patente_tracto: 'RVSD35' },
  { rut: '16181677-9', nombre: 'Aldo Bustamante Ortega', rut_proveedor: '16181677-9', proveedor: 'Aldo Antonio Bustamante Ortega', patente_tracto: 'CHTV35' },
  { rut: '12481902-4', nombre: 'Ambrosio Casanova Naavarrete', rut_proveedor: '76463195-1', proveedor: 'Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.', patente_tracto: 'HWRC63' },
  { rut: '13277753-5', nombre: 'Patricio Aurelio Rivas Puentes', rut_proveedor: '78101236-K', proveedor: 'Logística Siete Robles Spa', patente_tracto: 'JSHK45' },
  { rut: '8825579-8', nombre: 'JOSE DAVID ESPINOZA CASTRO', rut_proveedor: '78032949-1', proveedor: 'CLASSIC TRUCK TRANSPORT SPA', patente_tracto: 'GXVX71' },
  { rut: '7486285-3', nombre: 'Pedro  Rafael Mozo  Espina', rut_proveedor: '77243323-9', proveedor: 'Comercio, Servicios Y Transportes Mozó Spa', patente_tracto: 'CTHX29' },
  { rut: '12671737-7', nombre: 'Cristian Mauricio Jimenez Reyes', rut_proveedor: '12671737-7', proveedor: 'Cristian Mauricio Jimenez Reyes', patente_tracto: 'BDTJ59' },
  { rut: '17461633-7', nombre: 'Anibal Gregorich Vergara Miranda', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'ZN3559' },
  { rut: '9875518-7', nombre: 'Luis Anibal Vergara Cadiz', rut_proveedor: '77083269-1', proveedor: 'Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.', patente_tracto: 'FJSX66' },
  { rut: '12457226-6', nombre: 'Nelson Alejandro Abarca Leiva', rut_proveedor: '77150766-2', proveedor: 'Empresa De Transportes Nico Abarca Spa', patente_tracto: 'GBSB58' },
  { rut: '26953476-1', nombre: 'Alexander Jose Gonzalez Gil', rut_proveedor: '78234684-9', proveedor: 'F & F Spa', patente_tracto: 'HGXL66' },
  { rut: '7321424-6', nombre: 'Fernando Del Carmen Araya Araya', rut_proveedor: '7321424-6', proveedor: 'Fernando del Carmen Araya Araya', patente_tracto: 'CSDS48' },
  { rut: '14621104-6', nombre: 'Freddy Alexis Mena  Nuñez', rut_proveedor: '78154645-3', proveedor: 'Fever Spa', patente_tracto: 'DCZT68' },
  { rut: '11607612-8', nombre: 'Jorge Antonio Quintanilla Catalán', rut_proveedor: '76260962-2', proveedor: 'Hidroamerica Spa', patente_tracto: 'LLFJ17' },
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
  { rut: '17690903-K', nombre: 'Rodrigo Elias Peña Castillo', rut_proveedor: '78040304-7', proveedor: 'R Peña Spa', patente_tracto: 'FGWV34' },
  { rut: '17449523-8', nombre: 'Víctor Rodolfo Basoalto Tapia', rut_proveedor: '77548896-4', proveedor: 'SERVICIO DE TRANSPORTE B Y B SPA', patente_tracto: 'DRVC67' },
  { rut: '13835882-8', nombre: 'Javier Ramon Fuenzalida Almuna', rut_proveedor: '77115061-6', proveedor: 'SERVICIOS GENERALES Y COMERCIALES KEVIN SPA', patente_tracto: 'HSVG20' },
  { rut: '6639764-5', nombre: 'Arturo Alejandro Herrera Giadala', rut_proveedor: '76685344-7', proveedor: 'Sociedad De Transportes Baguales Spa', patente_tracto: 'BDXP58' },
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    console.log('[v0] Starting driver sync...')
    console.log('[v0] Total drivers to sync:', DRIVERS_DATA.length)

    const { data: existingDrivers, error: fetchError } = await supabase
      .from('drivers')
      .select('rut')
    
    if (fetchError) throw fetchError
    
    const existingRuts = new Set(existingDrivers?.map(d => d.rut) || [])
    console.log('[v0] Existing drivers in DB:', existingRuts.size)

    const newDrivers = DRIVERS_DATA.filter(d => !existingRuts.has(d.rut))
    console.log('[v0] New drivers to insert:', newDrivers.length)

    if (newDrivers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All drivers already exist',
        stats: { total: DRIVERS_DATA.length, existing: existingRuts.size, inserted: 0 }
      })
    }

    let inserted = 0
    for (let i = 0; i < newDrivers.length; i += 50) {
      const batch = newDrivers.slice(i, i + 50)
      const { error } = await supabase.from('drivers').insert(batch)
      
      if (error) {
        console.error('[v0] Error inserting batch:', error)
        throw error
      }
      
      inserted += batch.length
      console.log(`[v0] Inserted ${inserted}/${newDrivers.length} drivers`)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${inserted} new drivers`,
      stats: { total: DRIVERS_DATA.length, existing: existingRuts.size, inserted }
    })
  } catch (error) {
    console.error('[v0] Sync error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
