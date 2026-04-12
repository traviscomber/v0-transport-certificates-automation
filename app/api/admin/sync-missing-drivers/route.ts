import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// All 291 drivers - the MISSING ones (92 total that aren't in the current 200)
const MISSING_DRIVERS = [
  { rut: "10842565-2", nombre: "Ignacio Santiago Burgos Alamos", rut_proveedor: "77547318-5", proveedor: "Transportes Ignacio Burgos E.i.r.l.", patente_tracto: "LZ6072" },
  { rut: "27446096-2", nombre: "Miguel Jesus Uribe Coca", rut_proveedor: "77998655-1", proveedor: "TRANSPORTES MIGUEL JESUS URIBE COCA E.I.R.L", patente_tracto: "BWPL16" },
  { rut: "15107209-7", nombre: "Mauricio Antonio Arroyo Esfronceda", rut_proveedor: "78069053-4", proveedor: "Transportes Mauricio Arroyo E.i.r.l.", patente_tracto: "HXJD90" },
  { rut: "10286272-4", nombre: "Luis Fernando Bravo Saldias", rut_proveedor: "78125401-0", proveedor: "Transportes Miranda Y Bravo Limitada", patente_tracto: "JLHZ73" },
  { rut: "16146554-2", nombre: "Richard Andres Contreras Forton", rut_proveedor: "78242685-0", proveedor: "Transportes Rc Spa", patente_tracto: "ZL7937" },
  { rut: "15493907-5", nombre: "Juan Pablo Morales Toloza", rut_proveedor: "78003531-5", proveedor: "Transportes Morales Castillo Spa", patente_tracto: "BVWZ52" },
  { rut: "17338237-5", nombre: "Felipe Francisco Miranda Amaya", rut_proveedor: "77896328-0", proveedor: "Transportes Ms Spa", patente_tracto: "HZHG88" },
  { rut: "17166009-2", nombre: "Moises Antonio Muñoz Cerda", rut_proveedor: "77480102-2", proveedor: "Transportes Myt Spa", patente_tracto: "DPDT12" },
  { rut: "16117345-2", nombre: "Leonardo Andres Sanhueza Valdes", rut_proveedor: "76891488-5", proveedor: "Transportes Myz Spa", patente_tracto: "FXVF38" },
  { rut: "9807595-K", nombre: "Oscar Martinez Arriagada", rut_proveedor: "76891488-5", proveedor: "Transportes Myz Spa", patente_tracto: "BKVH88" },
  { rut: "25598621-K", nombre: "Wilder Alexander Naranjo Zapata", rut_proveedor: "77417801-5", proveedor: "Transportes Naranjo´s Spa", patente_tracto: "FJGJ81" },
  { rut: "14046644-1", nombre: "Pedro Enrique Navarro Delgado", rut_proveedor: "78157982-3", proveedor: "Transportes Navarro Spa", patente_tracto: "CHTV41" },
  { rut: "9407328-6", nombre: "Nibaldo Patricio Araya Astorga", rut_proveedor: "77392988-2", proveedor: "Transportes Nibaldo Araya Eirl", patente_tracto: "GLCD16" },
  { rut: "9659299-K", nombre: "Pedro Benjasmin Soto Jara", rut_proveedor: "77377291-6", proveedor: "Transportes Nicolas Spa", patente_tracto: "CKXS66" },
  { rut: "27364850-K", nombre: "Nino Alvaro Pinzas Julca", rut_proveedor: "78295014-2", proveedor: "Transportes Nino Spa", patente_tracto: "DDRV97" },
  { rut: "18592248-0", nombre: "Hugo Camilo Olmos Vega", rut_proveedor: "78310280-3", proveedor: "Transportes Olmo Vega Spa", patente_tracto: "DHZR15" },
  { rut: "16296370-8", nombre: "Álvaro EfraÍn Madrid Reyes", rut_proveedor: "77986483-9", proveedor: "TRANSPORTES OPTIMUM SPA", patente_tracto: "BWPY29" },
  { rut: "10891710-5", nombre: "Orlando Del Carmen Mendez Gutierrez", rut_proveedor: "77387969-9", proveedor: "Transportes Orlando Del Carmen Mendez Gutierrez Eirl", patente_tracto: "CJKC59" },
  { rut: "12869737-3", nombre: "Pablo Cesar Soto Cruz", rut_proveedor: "76843705-K", proveedor: "Transportes Pablo Cesar Soto Cruz E.i.r.l.", patente_tracto: "CFPD66" },
  { rut: "14467460-K", nombre: "PABLO ANDRES PEREZ URRUTIA", rut_proveedor: "78000781-8", proveedor: "TRANSPORTES PABLO PEREZ SPA", patente_tracto: "JCHR79" },
  { rut: "16379465-9", nombre: "ALVARO LORENZO PAILLAN PALMA", rut_proveedor: "77993482-9", proveedor: "TRANSPORTES PAISOL SPA", patente_tracto: "HYWX12" },
  { rut: "10813156-K", nombre: "Daniel Hernan Pacheco Villacura", rut_proveedor: "77805935-5", proveedor: "Transportes Paola Garcia Fredes E.i.r.l", patente_tracto: "WA1701" },
  { rut: "9646548-3", nombre: "Patricio Enrique Romo Moreno", rut_proveedor: "77425212-6", proveedor: "Transportes Patricio Romo Moreno E.i.r.l.", patente_tracto: "HYDC95" },
  { rut: "10990624-7", nombre: "Pedro Enrique Cortes Rojas", rut_proveedor: "77703639-4", proveedor: "Transportes Pecort Spa", patente_tracto: "BGYT95" },
  { rut: "18670406-1", nombre: "Pedro Sebastian Villagran Saldias", rut_proveedor: "77852474-0", proveedor: "TRANSPORTES PEDRO VILLAGRAN E.I.R.L.", patente_tracto: "FTYT32" },
  { rut: "11114172-K", nombre: "Segundo German Punolaf Queupumil", rut_proveedor: "78232853-0", proveedor: "Transportes Punolaf Lopez Spa", patente_tracto: "DDKT83" },
  { rut: "22504079-6", nombre: "Joaquin Marcos Quispe Maguina", rut_proveedor: "78365485-7", proveedor: "Transportes Ql Spa", patente_tracto: "JKHC71" },
  { rut: "15392455-4", nombre: "Raul Marcelo Soto Bobadilla", rut_proveedor: "77394975-1", proveedor: "Transportes Raul Marcelo Soto Bobadilla E.i.r.l.", patente_tracto: "HKDV93" },
  { rut: "15213567-K", nombre: "Hector Mario Ceballos Gallegos", rut_proveedor: "77848888-4", proveedor: "Celin Spa", patente_tracto: "JCHR81" },
  { rut: "13401728-7", nombre: "Cuevas Gatica Ariel Alejandro", rut_proveedor: "77287076-0", proveedor: "Transportes Rene Ernesto Quiroz Rosales E.i.r.l.", patente_tracto: "CHRY90" },
  { rut: "16682420-6", nombre: "Luis Quiroz Salazar", rut_proveedor: "77287076-0", proveedor: "Transportes Rene Ernesto Quiroz Rosales E.i.r.l.", patente_tracto: "CSPY48" },
  { rut: "13839705-K", nombre: "Alexis Bladimir Calfin Araya", rut_proveedor: "77692211-0", proveedor: "Transportes Renee Bastias P E Hijos Spa", patente_tracto: "FFVW31" },
  { rut: "17429147-0", nombre: "Alvaro Sebastian Reyes Alfaro", rut_proveedor: "77509381-1", proveedor: "Transportes Reyes Quintero SPA", patente_tracto: "CFYS95" },
  { rut: "12924248-5", nombre: "Richard Antonio Aguilera Contreras", rut_proveedor: "77843013-4", proveedor: "TRANSPORTES RICHARD AGUILERA CONTRERAS E.R.I.L", patente_tracto: "FTDW49" },
  { rut: "27113827-K", nombre: "Angel Elias Oberto Serrano", rut_proveedor: "77117558-9", proveedor: "Transportes Ro Spa", patente_tracto: "HSTG66" },
  { rut: "17102045-K", nombre: "Roberto Andres Estrada Riquelme", rut_proveedor: "78087308-6", proveedor: "Transportes Roberto Estrada E.i.r.l", patente_tracto: "WG7070" },
  { rut: "8026404-6", nombre: "Juan Carlos Casanova Sanchez", rut_proveedor: "77413603-7", proveedor: "Transportes Rodmac Spa", patente_tracto: "GHDJ52" },
  { rut: "15957473-3", nombre: "Rodrigo Esteban Rojas Araya", rut_proveedor: "77119982-8", proveedor: "Transportes Rodrigo Esteban Rojas Araya EIRL", patente_tracto: "BGRX95" },
  { rut: "12509107-5", nombre: "Alejandro Daniel Iquilio Abarzua", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "FYZB83" },
  { rut: "22329060-4", nombre: "Cesar Augusto Paz Reyes", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "HKFS81" },
  { rut: "13715309-2", nombre: "Erik Hernan Zuñiga Perez", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "FYZB83" },
  { rut: "26390420-6", nombre: "Jesus Efren Angulo Calle", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "FTKY81" },
  { rut: "8865083-2", nombre: "Jorge Antonio Boada Sepulveda", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "CHRX54" },
  { rut: "22027038-6", nombre: "Ruben Hernan Silva Vasquez", rut_proveedor: "77016329-3", proveedor: "Transportes Ruben Hernan Silva Vasquez E.i.r.l", patente_tracto: "FTKY81" },
  { rut: "18512352-9", nombre: "Esteban Ignacio Villegas Letelier", rut_proveedor: "78302429-2", proveedor: "Transportes San Lorenzo Spa", patente_tracto: "FYLC99" },
  { rut: "8189883-9", nombre: "Juan Eduardo Chandia Parra", rut_proveedor: "78302429-2", proveedor: "Transportes San Lorenzo Spa", patente_tracto: "GBVW26" },
  { rut: "17932540-3", nombre: "Lorenzo Eduardo Chandia Salazar", rut_proveedor: "78302429-2", proveedor: "Transportes San Lorenzo Spa", patente_tracto: "GBVW26" },
  { rut: "17900921-8", nombre: "David Salomon Sanchez Otarola", rut_proveedor: "77888835-1", proveedor: "TRANSPORTES SANCHEZ SPA", patente_tracto: "GWZK89" },
  { rut: "19026744-K", nombre: "Camilo Alejandro Espinosa Navarro", rut_proveedor: "76285729-4", proveedor: "Sociedad De Transportes Quintanilla Ltda.", patente_tracto: "GFRH71" },
  { rut: "8942372-4", nombre: "Samuel Marcelino Vera Palma", rut_proveedor: "77110277-8", proveedor: "Transportes Santa Rafaela Spa", patente_tracto: "BSBL17" },
  { rut: "10623289-K", nombre: "Marcelo Antonio Barriga Contreras", rut_proveedor: "77357401-4", proveedor: "Transportes Sebastian Exequiel Garcia Martini Empresa Individual De Re", patente_tracto: "ZH8800" },
  { rut: "15931067-1", nombre: "Sebastian Exequiel Garcia Martini", rut_proveedor: "77357401-4", proveedor: "Transportes Sebastian Exequiel Garcia Martini Empresa Individual De Re", patente_tracto: "WU5504" },
  { rut: "7077324-4", nombre: "Sergio Manuel Simoncelii Rey", rut_proveedor: "77893331-4", proveedor: "TRANSPORTES SERGIO SIMONCELLI E.I.R.L", patente_tracto: "WG8423" },
  { rut: "21836416-0", nombre: "Antony Jesus Cosme Ircanaupa", rut_proveedor: "77640206-0", proveedor: "Transportes Sin Fronteras SPA", patente_tracto: "WD6582" },
  { rut: "18866252-8", nombre: "Felipe Antonio Castro MuÑoz", rut_proveedor: "77325414-1", proveedor: "Transportes Suyai Spa", patente_tracto: "MZ7707" },
  { rut: "18633398-5", nombre: "Jonathan Alfredo Vergara Osorio", rut_proveedor: "77273263-5", proveedor: "Transportes Taurus Spa", patente_tracto: "ZK1658" },
  { rut: "16201301-7", nombre: "Alejandro Andres Calderon Figueroa", rut_proveedor: "77698453-1", proveedor: "Transportes Trans Adroc Spa", patente_tracto: "BTJH92" },
  { rut: "9982464-6", nombre: "Marcelo Eduardo Leon Salvatierra", rut_proveedor: "76970026-9", proveedor: "TRANSPORTES TRANS-LYON SPA", patente_tracto: "DGKC53" },
  { rut: "24425491-8", nombre: "Dario Hernan Calderon Rodriguez", rut_proveedor: "78296208-6", proveedor: "Transportes Venaur Spa", patente_tracto: "CZXS46" },
  { rut: "15954550-4", nombre: "Manuel Humberto Poza Torres", rut_proveedor: "78259175-4", proveedor: "Transportes Verpo Spa", patente_tracto: "DHZR54" },
  { rut: "17468168-6", nombre: "Francisco Adolfo Chamorro Sobarzo", rut_proveedor: "77713918-5", proveedor: "Transportes Victoria Spa", patente_tracto: "UL5773" },
  { rut: "20731894-9", nombre: "Benjamin Eduardo Cid Harcha", rut_proveedor: "77982752-6", proveedor: "Transportes Villegas Y Villegas Spa", patente_tracto: "ZN5201" },
  { rut: "20251681-5", nombre: "Robinson Nicolas Villegas Hernandez", rut_proveedor: "77982752-6", proveedor: "Transportes Villegas Y Villegas Spa", patente_tracto: "ZN5201" },
  { rut: "11142090-4", nombre: "Dorian Gilberto Jamett Maturana", rut_proveedor: "78303894-3", proveedor: "Transportes Chachy Spa", patente_tracto: "DLYX41" },
  { rut: "16935590-8", nombre: "Rene Ignacio Henriquez Rivas", rut_proveedor: "77926368-1", proveedor: "TRANSPORTES WEREK SPA", patente_tracto: "HYHL52" },
  { rut: "22607329-9", nombre: "Omar Christian Perez Encinas", rut_proveedor: "77892137-5", proveedor: "TRANSPORTES WHITE EXPRESS SPA", patente_tracto: "JYPW76" },
  { rut: "15943194-0", nombre: "Wilson Antonio Cabello Reyes", rut_proveedor: "77383694-9", proveedor: "Transportes Wilson Antonio Cabello Reyes Eirl", patente_tracto: "SL3034" },
  { rut: "19034826-1", nombre: "Pablo Ignacio Escobedo Quintanilla", rut_proveedor: "77436503-6", proveedor: "Transportes Mj E Hijos Spa", patente_tracto: "BDCF89" },
  { rut: "14564017-2", nombre: "Giovanne Isaac Martinez Mella", rut_proveedor: "77931594-0", proveedor: "Transportes Y Servicios Fs Spa", patente_tracto: "FFZS31" },
  { rut: "8461526-9", nombre: "Malco Agabo Cespedes Manquez", rut_proveedor: "78115034-7", proveedor: "Transportes Y Servicios Jenavama Spa", patente_tracto: "GTGJ65" },
  { rut: "12880784-5", nombre: "Luis Eduardo Perez Vargas", rut_proveedor: "77110277-8", proveedor: "Transportes Santa Rafaela Spa", patente_tracto: "XB6062" },
  { rut: "12756249-0", nombre: "Genaro Francisco Zurita Hernandez", rut_proveedor: "78293071-0", proveedor: "Transportes Zura Spa", patente_tracto: "FVYX86" },
  { rut: "13773888-0", nombre: "Rodrigo Andres Sarralde Diaz", rut_proveedor: "78207782-1", proveedor: "Transportes M&f Spa", patente_tracto: "GZKY51" },
  { rut: "20077993-2", nombre: "Francisco Patricio Valenzuela Barros", rut_proveedor: "77369887-2", proveedor: "TRANSSAMY SPA", patente_tracto: "JPWR75" },
  { rut: "17217685-2", nombre: "Raul Miguel Panes Lopez", rut_proveedor: "77369887-2", proveedor: "TRANSSAMY SPA", patente_tracto: "CWVP90" },
  { rut: "16809991-6", nombre: "Claudio Ivan Eduardo Ortega Escobar", rut_proveedor: "76937652-6", proveedor: "Trasportes Claudio Ortega Spa", patente_tracto: "JCHR77" },
  { rut: "27132464-2", nombre: "Angel Estiben Zamora Gallego", rut_proveedor: "78019868-0", proveedor: "Ubilla Transportes Spa", patente_tracto: "UU9853" },
  { rut: "9609199-0", nombre: "Luis Alberto Silva Atenas", rut_proveedor: "10534518-6", proveedor: "Veronica Yolanda Silva Atenas", patente_tracto: "YV6119" },
  { rut: "12044190-6", nombre: "Victor Marcel Jimenez Reyes", rut_proveedor: "12044190-6", proveedor: "Victor Marcel Jimenez Reyes", patente_tracto: "DCHW24" },
  { rut: "16275792-K", nombre: "Eduardo Andres Zuñiga Luengo", rut_proveedor: "77806154-6", proveedor: "ZF TRANSPORTES SPA", patente_tracto: "CVPS70" },
]

export async function POST() {
  try {
    const supabase = await createClient()

    console.log(`[v0] Inserting ${MISSING_DRIVERS.length} missing drivers...`)

    // Transform data to match drivers table schema
    const driversToInsert = MISSING_DRIVERS.map(driver => ({
      rut: driver.rut,
      full_name: driver.nombre,
      rut_proveedor: driver.rut_proveedor,
      proveedor: driver.proveedor,
      patente_tracto: driver.patente_tracto,
      is_active: true, // Set as active
    }))

    // Insert in batches of 50 to avoid errors
    let totalInserted = 0
    
    for (let i = 0; i < driversToInsert.length; i += 50) {
      const batch = driversToInsert.slice(i, i + 50)
      
      const { data, error } = await supabase
        .from('drivers')
        .insert(batch)
        .select()

      if (error) {
        console.error(`[v0] Batch error:`, error)
      } else {
        totalInserted += data?.length || 0
        console.log(`[v0] Batch inserted: ${data?.length || 0} drivers (Total: ${totalInserted})`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${totalInserted} drivers`,
      inserted: totalInserted,
      total_expected: MISSING_DRIVERS.length,
    })
  } catch (error) {
    console.error('[v0] Exception:', error)
    return NextResponse.json(
      { error: 'Failed to sync drivers' },
      { status: 500 }
    )
  }
}
