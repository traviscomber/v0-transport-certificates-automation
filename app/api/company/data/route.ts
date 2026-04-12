import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function parseAllTransportistas() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'transportistas.txt')
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const transportistas = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim()
      if (!line) continue
      
      const parts = line.split('\t')
      if (parts.length < 10) continue
      
      const rut = parts[0]?.trim() || ''
      const nombre = parts[2]?.trim() || ''
      
      if (!rut || !nombre) continue
      
      transportistas.push({
        id: `sub-${transportistas.length + 1}`,
        rut,
        nombre,
        razon_social: nombre,
        nombre_fantasia: nombre.substring(0, 30),
        representante: parts[3]?.trim() || '',
        representante_legal: parts[3]?.trim() || '',
        ejecutiva: parts[5]?.trim() || '',
        region: 'RM',
        direccion: parts[6]?.trim() || '',
        comuna: parts[7]?.trim() || '',
        ciudad: parts[7]?.trim() || '',
        telefono: parts[8]?.trim() || '',
        email: parts[9]?.trim() || '',
        ariztia: parts[10]?.trim() === 'Ariztia',
        lts: parts[11]?.trim() === 'LTS',
        rendic: parts[12]?.trim() === 'Rendic',
        interpolar: parts[13]?.trim() === 'Interpolar',
        is_active: true
      })
    }
    return transportistas
  } catch (error) {
    console.error('[v0] Error parsing transportistas:', error)
    return []
  }
}

function parseAllConductores() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'conductores.txt')
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    const conductores = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim()
      if (!line) continue
      
      const parts = line.split('\t')
      if (parts.length < 5) continue
      
      const rut = parts[0]?.trim() || ''
      const nombre = parts[1]?.trim() || ''
      
      if (!rut || !nombre) continue
      
      conductores.push({
        id: `drv-${conductores.length + 1}`,
        rut,
        nombre,
        nombres: nombre.split(' ')[0] || '',
        apellido_paterno: nombre.split(' ').slice(1, -1).join(' ') || '',
        apellido_materno: nombre.split(' ').pop() || '',
        rut_proveedor: parts[2]?.trim() || '',
        proveedor: parts[3]?.trim() || '',
        patente_tracto: parts[4]?.trim() || '',
        clase_licencia: 'A-4',
        is_active: true
      })
    }
    return conductores
  } catch (error) {
    console.error('[v0] Error parsing conductores:', error)
    return []
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('[v0] API company/data called - Parsing all TSV files')

    // Parse all real data from TSV files
    const subcontractorsData = parseAllTransportistas()
    const driversData = parseAllConductores()

    console.log(`[v0] Loaded ${subcontractorsData.length} subcontractors and ${driversData.length} drivers`)

    const executivesData = [
      { id: '1', full_name: 'Carolina Martinez', rut: '12345678-9', email: 'carolina@labbe.cl', phone: '+56912345678', cargo: 'Ejecutiva de Cuenta' },
      { id: '2', full_name: 'Roberto Silva', rut: '13456789-K', email: 'roberto@labbe.cl', phone: '+56913456789', cargo: 'Gerente Operaciones' },
      { id: '3', full_name: 'Ana Garcia', rut: '14567890-2', email: 'ana@labbe.cl', phone: '+56914567890', cargo: 'Coordinadora' },
      { id: '4', full_name: 'Cecilia Herrera', rut: '14567890-3', email: 'cecilia@labbe.cl', phone: '+56914567891', cargo: 'Ejecutiva de Cuenta' },
    ]

    // Enrich response with all data
    return NextResponse.json({
      company: {
        id: '1',
        rut: '78376780-5',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.',
        nombre_fantasia: 'LABBE TRANSPORTES',
        email: 'contacto@labbe.cl',
        telefono: '+56912345678',
        region: 'RM',
        ciudad: 'Santiago',
        representante_legal: 'Juan Perez',
        is_active: true
      },
      executives: executivesData,
      drivers: driversData,
      subcontractors: subcontractorsData,
      stats: {
        totalSubcontractors: subcontractorsData.length,
        totalDrivers: driversData.length
      }
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: error.message },
      { status: 500 }
    )
  }
}
