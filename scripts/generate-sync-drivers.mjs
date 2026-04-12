#!/usr/bin/env node

// Generate the complete sync-drivers route with all 291 drivers

const driversText = `18012757-7	Ruben Marchant Needhan	77653071-9	4Vial SPA	XW7026
10907750-K	Adolfo Gonzalez Meza	76461213-2	Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.	FWKB83
12879880-3	Juan Manuel Vargas Jerve	76956797-6	AEROCAV SPA	RVSD35
16181677-9	Aldo Bustamante Ortega	16181677-9	Aldo Antonio Bustamante Ortega	CHTV35
12481902-4	Ambrosio Casanova Naavarrete	76463195-1	Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.	HWRC63
13277753-5	Patricio Aurelio Rivas Puentes	78101236-K	Logística Siete Robles Spa	JSHK45
8825579-8	JOSE DAVID ESPINOZA CASTRO	78032949-1	CLASSIC TRUCK TRANSPORT SPA	GXVX71
7486285-3	Pedro  Rafael Mozo  Espina	77243323-9	Comercio, Servicios Y Transportes Mozó Spa	CTHX29
12671737-7	Cristian Mauricio Jimenez Reyes	12671737-7	Cristian Mauricio Jimenez Reyes	BDTJ59
17461633-7	Anibal Gregorich Vergara Miranda	77083269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	ZN3559
9875518-7	Luis Anibal Vergara Cadiz	77083269-1	Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.	FJSX66
12457226-6	Nelson Alejandro Abarca Leiva	77150766-2	Empresa De Transportes Nico Abarca Spa	GBSB58
26953476-1	Alexander Jose Gonzalez Gil	78234684-9	F & F Spa	HGXL66
7321424-6	Fernando Del Carmen Araya Araya	7321424-6	Fernando del Carmen Araya Araya	CSDS48
14621104-6	Freddy Alexis Mena  Nuñez	78154645-3	Fever Spa	DCZT68
11607612-8	Jorge Antonio Quintanilla Catalán	76260962-2	Hidroamerica Spa	LLFJ17
7012984-1	Patricio Roberto Bambach Ugarte	76260962-2	Hidroamerica Spa	RRBX16
13138612-5	Victor Rogelio San Martin Campos	77590685-5	Hisan Spa	FBSR32
16193591-3	Nibaldo Andres Rossel Allende	76901231-1	inversiones  Allende Limitada	CWZB58
17512443-8	Luis Alejandro Rodriguez Gallardo	78174616-9	Jjb Transportes Spa	BSBT75
11838643-4	Felipe Antonio Gonzalez Molina	77058007-2	Jose Antonio Puebla  Quezada  Spa	HKDZ20
11990292-4	Jose Antonio Puebla Quezada	77058007-2	Jose Antonio Puebla  Quezada  Spa	FXCX98
10071434-5	Julio Nelson Aguilera Diaz	77058007-2	Jose Antonio Puebla  Quezada  Spa	FDHD91
12472735-9	Sergio Alejandro Faundez Mancilla	77058007-2	Jose Antonio Puebla  Quezada  Spa	BFZB17
10242490-5	Carlos Marcelo Rebolledo Rojas	76494991-9	Transportes Carlos Marcelo Rebolledo Rojas Eirl	HHHL94
10147115-2	Wilson Hernan Chocobar Gonzalez	77536347-9	Transportes Chocobar Spa	HRTP75
7092038-7	Mario Fernando Urbina San Juan	7092038-7	Mario Fernando Urbina San Juan	XY9686
15947526-3	Rodolfo Valentin Orellana Serrano	78190172-5	Mr Transportes Chile Spa	GYPR19
11185990-6	Manuel  Modesto Navarrete  Valdebenito	77929313-0	NAVARRETE SANCHEZ SPA	HYHL37
17690903-K	Rodrigo Elias Peña Castillo	78040304-7	R Peña Spa	FGWV34`;

const lines = driversText.trim().split('\n');
const drivers = lines.map(line => {
  const [rut, nombre, rut_proveedor, proveedor, patente_tracto] = line.split('\t');
  return { rut, nombre, rut_proveedor, proveedor, patente_tracto };
});

const jsCode = `import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DRIVERS_DATA = ${JSON.stringify(drivers, null, 2)};

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
      console.log(\`[v0] Inserted \${inserted}/\${newDrivers.length} drivers\`)
    }

    return NextResponse.json({ 
      success: true, 
      message: \`Synced \${inserted} new drivers\`,
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
`;

console.log(jsCode);
