import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load subcontractors and drivers from real TSV files
    const subcontractors = getLabbeSubcontractors()
    const drivers = getLabbeDrivers()

    return NextResponse.json({
      subcontractors: subcontractors || [],
      drivers: drivers || [],
      company: {
        rut: '78376780-5',
        nombre: 'LABBE TRANSPORTES Y CIAS LTDA.',
        razon_social: 'LABBE TRANSPORTES Y CIAS LTDA.'
      }
    })
  } catch (error) {
    console.error('[v0] Error in company data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
}

function getLabbeSubcontractors() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'transportistas.txt')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n').slice(1) // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t')
        return {
          rut: parts[0]?.trim() || '',
          nombre: parts[1]?.trim() || '',
          representante: parts[3]?.trim() || '',
          ejecutiva: parts[5]?.trim() || '',
          direccion: parts[6]?.trim() || '',
          comuna: parts[7]?.trim() || '',
          telefono: parts[8]?.trim() || '',
          email: parts[9]?.trim() || '',
          proveedor: parts[10]?.trim() || parts[11]?.trim() || ''
        }
      })
      .filter(sub => sub.rut && sub.nombre)
  } catch (error) {
    console.log('[v0] Error loading subcontractors from file, returning empty array')
    return []
  }
}

function getLabbeDrivers() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'conductores.txt')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n').slice(1) // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t')
        return {
          rut: parts[0]?.trim() || '',
          nombre: parts[1]?.trim() || '',
          rut_proveedor: parts[2]?.trim() || '',
          proveedor: parts[3]?.trim() || '',
          patente_tracto: parts[4]?.trim() || ''
        }
      })
      .filter(driver => driver.rut && driver.nombre)
  } catch (error) {
    console.log('[v0] Error loading drivers from file, returning empty array')
    return []
  }
}
