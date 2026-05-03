import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

// All drivers from fallback data
const drivers = [
  { rut: '12967316-8', nombre: 'Cesar Augusto Romero Baez', rut_proveedor: '78100599-1', proveedor: 'Transportes Milady Spa', patente_tracto: 'GKZD53' },
  { rut: '15148994-K', nombre: 'Miguel Luis Infante Zambrano', rut_proveedor: '77349385-5', proveedor: 'Transportes Inma Spa', patente_tracto: 'GXST33' },
  { rut: '17231344-2', nombre: 'Isaac Rafael Iturrieta AÑo', rut_proveedor: '78179126-1', proveedor: 'Transportes Isacon Spa', patente_tracto: 'GWWR87' },
  { rut: '12920772-8', nombre: 'Ivan Diaz Rivas', rut_proveedor: '77624569-0', proveedor: 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL', patente_tracto: 'LCXJ73' },
  { rut: '17393582-K', nombre: 'Luis Alfonso Guerrero Díaz', rut_proveedor: '77624569-0', proveedor: 'TRANSPORTES IVAN ALFONSO DIAZ RIVAS EIRL', patente_tracto: 'JRZH17' },
  { rut: '19371373-4', nombre: 'Jose Ignacio Mendoza Cid', rut_proveedor: '77941312-8', proveedor: 'TRANSPORTES J&F SPA', patente_tracto: 'JCHR80' },
  { rut: '12022695-9', nombre: 'Marco Antonio Sanhueza Espino', rut_proveedor: '77499811-K', proveedor: 'Transportes Jahdiel Spa', patente_tracto: 'ZN3943' },
  { rut: '11801151-1', nombre: 'Jhon Chavarria Muñoz', rut_proveedor: '77495891-6', proveedor: 'TRANSPORTES JHON EDWARD CHAVARRIA MUÑOZ E.I.R.L', patente_tracto: 'YW3574' },
  { rut: '18316251-9', nombre: 'Jamyr Ajmed Karim Vargas', rut_proveedor: '78283626-9', proveedor: 'Transportes Jkarimv Spa', patente_tracto: 'FDKC88' },
  { rut: '18011702-4', nombre: 'John Francisco Jofre Gomez', rut_proveedor: '78244173-6', proveedor: 'Transportes Jme Spa', patente_tracto: 'HSYC65' },
]

// Sample subcontractors
const subcontractors = [
  { rut: '78376780-5', nombre: 'LABBE TRANSPORTES Y CIAS LTDA.', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Juan Perez', direccion: 'Av. Principal 1234, Santiago', comuna: 'Santiago', email: 'labbe@transportes.cl', telefono: '+56998765432' },
  { rut: '77389829-4', nombre: 'Transportes Manuel Perez Vilches E.i.r.l.', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Manuel Perez', direccion: 'Calle 5 789, Valparaiso', comuna: 'Valparaiso', email: 'manuel.perez@transport.cl', telefono: '+56987654321' },
  { rut: '77222214-9', nombre: 'Transportes Marco Antonio Gatica Moreno Spa', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Marco Antonio', direccion: 'Avenida 10 567, Concepcion', comuna: 'Concepcion', email: 'marco@transport.cl', telefono: '+56912345678' },
  { rut: '77703639-4', nombre: 'Transportes Pecort Spa', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Pedro Cortes', direccion: 'Pasaje 3 234, Valdivia', comuna: 'Valdivia', email: 'pecort@transport.cl', telefono: '+56923456789' },
  { rut: '78069053-4', nombre: 'Transportes Mauricio Arroyo E.i.r.l.', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Mauricio Arroyo', direccion: 'Calle 7 456, Puerto Montt', comuna: 'Puerto Montt', email: 'mauricio@transport.cl', telefono: '+56934567890' },
  { rut: '77113814-4', nombre: 'Transportes Luis Eduardo Cruz Perez EIRL', ejecutiva: 'EJECUTIVA DE CUENTA', representante: 'Luis Cruz', direccion: 'Avenida 8 901, Los Angeles', comuna: 'Los Angeles', email: 'luiscruz@transport.cl', telefono: '+56945678901' },
]

async function populateData() {
  try {
    console.log('[v0] Starting data population...')

    // Insert subcontractors first
    console.log('[v0] Inserting subcontractors...')
    const { data: subData, error: subError } = await supabase
      .from('transportistas')
      .upsert(subcontractors, { onConflict: 'rut' })

    if (subError) {
      console.error('[v0] Error inserting subcontractors:', subError)
    } else {
      console.log('[v0] Successfully inserted subcontractors:', subData?.length || 0)
    }

    // Get the LABBE company ID to link drivers
    const { data: labbe } = await supabase
      .from('transportistas')
      .select('id')
      .eq('rut', '78376780-5')
      .single()

    if (!labbe) {
      console.error('[v0] LABBE company not found')
      return
    }

    // Insert drivers
    console.log('[v0] Inserting drivers...')
    const driversWithCompany = drivers.map(d => ({
      ...d,
      empresa_id: labbe.id,
    }))

    const { data: drvData, error: drvError } = await supabase
      .from('conductores')
      .upsert(driversWithCompany, { onConflict: 'rut' })

    if (drvError) {
      console.error('[v0] Error inserting drivers:', drvError)
    } else {
      console.log('[v0] Successfully inserted drivers:', drvData?.length || 0)
    }

    console.log('[v0] Data population complete!')
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
  }
}

populateData()
