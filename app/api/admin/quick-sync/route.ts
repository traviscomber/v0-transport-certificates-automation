import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const DRIVERS_DATA = [
  { rut: "18012757-7", nombre: "Ruben Marchant Needhan", rut_proveedor: "77653071-9", proveedor: "4Vial SPA", patente_tracto: "XW7026" },
  { rut: "10907750-K", nombre: "Adolfo Gonzalez Meza", rut_proveedor: "76461213-2", proveedor: "Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.", patente_tracto: "FWK883" },
  { rut: "12879880-3", nombre: "Juan Manuel Vargas Jerve", rut_proveedor: "76956797-6", proveedor: "AEROCAV SPA", patente_tracto: "RVSD35" },
  { rut: "16181677-9", nombre: "Aldo Bustamante Ortega", rut_proveedor: "16181677-9", proveedor: "Aldo Antonio Bustamante Ortega", patente_tracto: "CHTV35" },
  { rut: "12481902-4", nombre: "Ambrosio Casanova Navarrete", rut_proveedor: "76463195-1", proveedor: "Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.", patente_tracto: "HWRC63" },
  { rut: "13277753-5", nombre: "Patricio Aurelio Rivas Puentes", rut_proveedor: "78101236-K", proveedor: "Logística Siete Robles Spa", patente_tracto: "JSHK45" },
  { rut: "12535259-8", nombre: "JOSE DAVID ESPARZA CASTRO", rut_proveedor: "78032949-1", proveedor: "CLASSIC TRUCK TRANSPORT SPA", patente_tacto: "GXVX71" },
  { rut: "7486285-3", nombre: "Pedro  Rafael Mozo  Espina", rut_proveedor: "77243323-9", proveedor: "Comercio, Servicios Y Transportes Mozó Spa", patente_tracto: "CTHX29" },
  { rut: "12671737-7", nombre: "Cristian Mauricio Jimenez Reyes", rut_proveedor: "12671737-7", proveedor: "Cristian Mauricio Jimenez Reyes", patente_tracto: "BDTJ59" },
  { rut: "12461633-7", nombre: "Anibal Gregorio Vergara Miranda", rut_proveedor: "77083269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "2NJ359" },
  { rut: "9875518-7", nombre: "Luis Anibal Vergara Cadiz", rut_proveedor: "77083269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "FJSX66" },
  { rut: "12457226-6", nombre: "Nelson Alejandro Abarca Leiva", rut_proveedor: "77150766-2", proveedor: "Empresa de Transportes Nico Abarca Spa", patente_tracto: "GBSB58" },
  { rut: "26953476-1", nombre: "Alexander Jose Gonzalez Gil", rut_proveedor: "78234684-9", proveedor: "F & F Spa", patente_tracto: "HGXL66" },
  { rut: "12114224-6", nombre: "Fernando Del Carmen Araya Araya", rut_proveedor: "7321424-6", proveedor: "Fernando del Carmen Araya Araya", patente_tracto: "CSDS48" },
  { rut: "14621104-6", nombre: "Freddy Alexis Mena  Nuñez", rut_proveedor: "78154645-3", proveedor: "Fever Spa", patente_tracto: "DCZT68" },
  { rut: "11607612-8", nombre: "Jorge Antonio Quintanilla Catalán", rut_proveedor: "76260962-2", proveedor: "Hidroamerica Spa", patente_tracto: "LLFJ17" },
  { rut: "7012984-1", nombre: "Patricio Roberto Bambach Uparte", rut_proveedor: "76260962-2", proveedor: "Hidroamerica Spa", patente_tracto: "RRBX16" },
  { rut: "13138612-5", nombre: "Victor Rogelio San Martin Campos", rut_proveedor: "77590685-5", proveedor: "Hisan Spa", patente_tracto: "FBSR32" },
  { rut: "16193591-3", nombre: "Nibaldo Andres Rossell Allende", rut_proveedor: "76901231-1", proveedor: "inversiones  Allende Limitada", patente_tracto: "CWZB58" },
  { rut: "17512443-8", nombre: "Luis Alejandro Rodriguez Gallardo", rut_proveedor: "78174616-9", proveedor: "Jjb Transportes Spa", patente_tracto: "BSBT75" },
];

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Insert all drivers in batches
    const batchSize = 50
    let inserted = 0
    let failed = 0
    
    for (let i = 0; i < DRIVERS_DATA.length; i += batchSize) {
      const batch = DRIVERS_DATA.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('drivers')
        .upsert(
          batch.map(d => ({
            rut: d.rut,
            nombre: d.nombre,
            rut_proveedor: d.rut_proveedor,
            proveedor: d.proveedor,
            patente_tracto: d.patente_tracto,
            clase_licencia: 'A-4',
            is_active: true,
          })),
          { onConflict: 'rut' }
        )
      
      if (error) {
        console.error('[v0] Batch error:', error)
        failed += batch.length
      } else {
        inserted += batch.length
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Sync complete. Inserted: ${inserted}, Failed: ${failed}`,
      total: DRIVERS_DATA.length,
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
