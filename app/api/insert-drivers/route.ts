import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ALL_DRIVERS = [
  { rut: "18012757-7", full_name: "Ruben Marchant Needhan", rut_proveedor: "77653071-9", proveedor: "4Vial SPA", patente_tracto: "XW7026" },
  { rut: "10907750-K", full_name: "Adolfo Gonzalez Meza", rut_proveedor: "76461213-2", proveedor: "Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.", patente_tracto: "FWK883" },
  { rut: "12879880-3", full_name: "Juan Manuel Vargas Jerve", rut_proveedor: "76956797-6", proveedor: "AEROCAV SPA", patente_tracto: "RVSD35" },
  { rut: "16181677-9", full_name: "Aldo Bustamante Ortega", rut_proveedor: "16181677-9", proveedor: "Aldo Antonio Bustamante Ortega", patente_tracto: "CHTV35" },
  { rut: "12481902-4", full_name: "Ambrosio Casanova Navarrete", rut_proveedor: "76463195-1", proveedor: "Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.", patente_tracto: "HWRC63" },
  { rut: "13277753-5", full_name: "Patricio Aurelio Rivas Puentes", rut_proveedor: "78101236-K", proveedor: "Logística Siete Robles Spa", patente_tracto: "JSHK45" },
  { rut: "13625259-8", full_name: "JOSE DAVID ESPARZA CASTRO", rut_proveedor: "78032949-1", proveedor: "CLASSIC TRUCK TRANSPORT SPA", patente_tracto: "GXVX71" },
  { rut: "7486285-3", full_name: "Pedro Rafael Mozo Espina", rut_proveedor: "77243323-9", proveedor: "Comercio, Servicios Y Transportes Mozó Spa", patente_tracto: "CTHX29" },
  { rut: "12671737-7", full_name: "Cristian Mauricio Jimenez Reyes", rut_proveedor: "12671737-7", proveedor: "Cristian Mauricio Jimenez Reyes", patente_tracto: "BDTJ59" },
  { rut: "12461633-7", full_name: "Anibal Gregorio Vergara Miranda", rut_proveedor: "77083269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "ZN3559" },
  { rut: "9875518-7", full_name: "Luis Anibal Vergara Cadiz", rut_proveedor: "77083269-1", proveedor: "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", patente_tracto: "FJSX66" },
  { rut: "12457226-6", full_name: "Nelson Alejandro Abarca Leiva", rut_proveedor: "77150766-2", proveedor: "Empresa De Transportes Nico Abarca Spa", patente_tracto: "GBSB58" },
  { rut: "26953476-1", full_name: "Alexander Jose Gonzalez Gil", rut_proveedor: "78234684-9", proveedor: "F & F Spa", patente_tracto: "HGXL66" },
  { rut: "12114244-6", full_name: "Fernando Del Carmen Araya Araya", rut_proveedor: "7321424-6", proveedor: "Fernando del Carmen Araya Araya", patente_tracto: "CSDS48" },
  { rut: "14621104-6", full_name: "Freddy Alexis Mena Nuñez", rut_proveedor: "78154645-3", proveedor: "Fever Spa", patente_tracto: "DCZT68" },
]

export async function POST() {
  try {
    const supabase = await createClient()

    // Get existing RUTs to avoid duplicates
    const { data: existing } = await supabase
      .from("drivers")
      .select("rut")

    const existingRuts = new Set(existing?.map(d => d.rut) || [])
    
    // Filter out duplicates
    const newDrivers = ALL_DRIVERS.filter(d => !existingRuts.has(d.rut))

    if (newDrivers.length === 0) {
      return NextResponse.json({
        message: "All drivers already exist",
        duplicates: ALL_DRIVERS.length,
        inserted: 0
      })
    }

    // Insert new drivers in batches
    let inserted = 0
    for (let i = 0; i < newDrivers.length; i += 100) {
      const batch = newDrivers.slice(i, i + 100)
      const { error } = await supabase.from("drivers").insert(batch)
      
      if (error) {
        console.error("[v0] Batch insert error:", error)
        throw error
      }
      inserted += batch.length
    }

    return NextResponse.json({
      message: "Drivers inserted successfully",
      inserted,
      duplicates: ALL_DRIVERS.length - newDrivers.length,
      total: ALL_DRIVERS.length
    })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
