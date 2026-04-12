import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Complete drivers data from attachment
const driversData = [
  { rut: "18012757-7", nombre: "Ruben Marchant Needhan", rut_proveedor: "77653071-9", proveedor: "4Vial SPA", patente_tracto: "XW7026" },
  { rut: "10907750-K", nombre: "Adolfo Gonzalez Meza", rut_proveedor: "76461213-2", proveedor: "Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.", patente_tracto: "FWK883" },
  { rut: "12879880-3", nombre: "Juan Manuel Vargas Jerve", rut_proveedor: "76956797-6", proveedor: "AEROCAV SPA", patente_tracto: "RVSD35" },
  { rut: "16181677-9", nombre: "Aldo Bustamante Ortega", rut_proveedor: "16181677-9", proveedor: "Aldo Antonio Bustamante Ortega", patente_tracto: "CHTV35" },
  { rut: "12481902-4", nombre: "Ambrosio Casanova Navarrete", rut_proveedor: "76463195-1", proveedor: "Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.", patente_tracto: "HWRC63" },
  { rut: "13277753-5", nombre: "Patricio Aurelio Rivas Puentes", rut_proveedor: "78101236-K", proveedor: "Logistica Siete Robles Spa", patente_tracto: "JSHK45" },
  { rut: "12855259-8", nombre: "JOSE DAVID ESPARZA CASTRO", rut_proveedor: "78032949-1", proveedor: "CLASSIC TRUCK TRANSPORT SPA", patente_tracto: "GXVX71" },
  { rut: "7486285-3", nombre: "Pedro  Rafael Mozo  Espina", rut_proveedor: "77243323-9", proveedor: "Comercio, Servicios Y Transportes Mozó Spa", patente_tracto: "CTHX29" },
  { rut: "12671737-7", nombre: "Cristian Mauricio Jimenez Reyes", rut_proveedor: "12671737-7", proveedor: "Cristian Mauricio Jimenez Reyes", patente_tracto: "BDTJ59" },
  { rut: "12461633-7", nombre: "Anibal Gregorio Vergara Miranda", rut_proveedor: "7708269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "ZNJ3559" },
  { rut: "9875518-7", nombre: "Luis Anibal Vergara Cadiz", rut_proveedor: "7708269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "FJSX66" },
  { rut: "12457226-6", nombre: "Nelson Alejandro Abarca Leiva", rut_proveedor: "77150766-2", proveedor: "Empresa De Transportes Nico Abarca Spa", patente_tracto: "GBSB58" },
  { rut: "26953476-1", nombre: "Alexander Jose Gonzalez Gil", rut_proveedor: "78234684-9", proveedor: "F & F Spa", patente_tracto: "HGXL66" },
  { rut: "12414224-6", nombre: "Fernando Del Carmen Araya Araya", rut_proveedor: "7321424-6", proveedor: "Fernando del Carmen Araya Araya", patente_tracto: "CSDS48" },
  { rut: "14621104-6", nombre: "Freddy Alexis Mena  Nuñez", rut_proveedor: "78154645-3", proveedor: "Fever Spa", patente_tracto: "DCZT68" },
  { rut: "11607612-8", nombre: "Jorge Antonio Quintanilla Catalán", rut_proveedor: "76260962-2", proveedor: "Hidroamerica Spa", patente_tracto: "LLFJ17" },
  { rut: "7012984-1", nombre: "Patricio Roberto Bambach Ugarte", rut_proveedor: "76260962-2", proveedor: "Hidroamerica Spa", patente_tracto: "RRBX16" },
  { rut: "13138612-5", nombre: "Victor Rogelio San Martin Campos", rut_proveedor: "77590685-5", proveedor: "Hisan Spa", patente_tracto: "FBSR32" },
  { rut: "16193591-3", nombre: "Nibaldo Andres Rossell Allende", rut_proveedor: "76901231-1", proveedor: "inversiones  Allende Limitada", patente_tracto: "CWZB58" },
  { rut: "17512443-8", nombre: "Luis Alejandro Rodriguez Gallardo", rut_proveedor: "78174616-9", proveedor: "Jjb Transportes Spa", patente_tracto: "BSBT75" },
  { rut: "11388633-4", nombre: "Felipe Antonio González Molina", rut_proveedor: "77058007-2", proveedor: "Jose Antonio Puebla Quezada  Spa", patente_tracto: "HKDZ20" },
  { rut: "11990292-4", nombre: "Jose Antonio Puebla Quezada", rut_proveedor: "77058007-2", proveedor: "Jose Antonio Puebla Quezada  Spa", patente_tracto: "FXCX98" },
  { rut: "10071434-5", nombre: "Julio Nelson Aguilera Diaz", rut_proveedor: "77058007-2", proveedor: "Jose Antonio Puebla Quezada  Spa", patente_tracto: "FDHD91" },
  { rut: "12472735-9", nombre: "Sergio Alejandro Mansilla Mansilla", rut_proveedor: "77058007-2", proveedor: "Jose Antonio Puebla Quezada  Spa", patente_tracto: "BFZB17" },
  { rut: "10242490-5", nombre: "Carlos Marcelo Rebolledo Rojas", rut_proveedor: "76494991-9", proveedor: "Transportes Carlos Marcelo Rebolledo Rojas Eirl", patente_tracto: "HHHL94" },
  { rut: "10147115-2", nombre: "Wilson Hernan Chocobar Gonzalez", rut_proveedor: "77536347-9", proveedor: "Transportes Chocobar Spa", patente_tracto: "HRTP75" },
  { rut: "7092038-7", nombre: "Mario Fernando Urbina San Juan", rut_proveedor: "7092038-7", proveedor: "Mario Fernando Urbina San Juan", patente_tracto: "XY9686" },
  { rut: "11349236-3", nombre: "Rodolfo Valentin Orell Serrano", rut_proveedor: "78190172-5", proveedor: "Mk Transportes Chile Spa", patente_tracto: "GYPR19" },
  { rut: "11185990-6", nombre: "Manuel  Modesto Navarrete  Valdebenito", rut_proveedor: "77929313-0", proveedor: "NAVARRETE SANCHEZ SPA", patente_tracto: "HYHL37" },
  { rut: "17690903-K", nombre: "Rodrigo Elias Peña Castillo", rut_proveedor: "78040304-7", proveedor: "R PeÑa Spa", patente_tracto: "FGWV34" },
];

// Create driver records with proper structure
function prepareDriverRecords() {
  return driversData.map(driver => ({
    rut: driver.rut,
    full_name: driver.nombre,
    rut_proveedor: driver.rut_proveedor,
    proveedor: driver.proveedor,
    patente_tracto: driver.patente_tracto,
    clase_licencia: 'A-4',
    is_active: true,
    organization_id: 'c58a9f77-d2f8-448a-b8e8-1234567890ab' // LABBE organization ID - adjust as needed
  }))
}

export async function POST() {
  try {
    const drivers = prepareDriverRecords()
    console.log(`[v0] Syncing ${drivers.length} drivers...`)

    // Get existing drivers to find what's missing
    const { data: existingDrivers, error: fetchError } = await supabase
      .from('drivers')
      .select('rut')

    if (fetchError) {
      console.error('[v0] Error fetching existing drivers:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch existing drivers', details: fetchError }, { status: 400 })
    }

    const existingRuts = new Set(existingDrivers?.map(d => d.rut) || [])
    const missingDrivers = drivers.filter(d => !existingRuts.has(d.rut))

    console.log(`[v0] Found ${missingDrivers.length} missing drivers to insert`)

    if (missingDrivers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All drivers already exist in database',
        total: drivers.length,
        inserted: 0,
        existing: existingRuts.size
      })
    }

    // Insert missing drivers in batches
    const batchSize = 50
    let inserted = 0

    for (let i = 0; i < missingDrivers.length; i += batchSize) {
      const batch = missingDrivers.slice(i, i + batchSize)
      const { error } = await supabase
        .from('drivers')
        .insert(batch)

      if (error) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, error)
        return NextResponse.json(
          { error: 'Failed to insert drivers', details: error },
          { status: 400 }
        )
      }

      inserted += batch.length
      console.log(`[v0] Inserted ${inserted}/${missingDrivers.length} drivers`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced drivers to database`,
      total: drivers.length,
      inserted,
      existing: existingRuts.size
    })
  } catch (error) {
    console.error('[v0] Error in sync:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
