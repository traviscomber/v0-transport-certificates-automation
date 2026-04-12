import fs from 'fs'
import path from 'path'

// Parse transportistas (subcontractors) from TSV
function parseTransportistas() {
  const filePath = path.join(process.cwd(), 'data', 'transportistas.txt')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  const transportistas = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split('\t')
    if (parts.length < 10) continue
    
    const rut = parts[0]?.trim() || ''
    const nombre = parts[2]?.trim() || ''
    
    if (!rut || !nombre) continue
    
    transportistas.push({
      id: `sub-${i}`,
      rut,
      nombre,
      razon_social: nombre,
      nombre_fantista: nombre.substring(0, 30),
      representante: parts[3]?.trim() || '',
      representante_legal: parts[3]?.trim() || '',
      ejecutiva: parts[5]?.trim() || '',
      region: 'RM',
      direccion: parts[6]?.trim() || '',
      comuna: parts[7]?.trim() || '',
      ciudad: parts[7]?.trim() || '',
      telefono: parts[8]?.trim() || '',
      email: parts[9]?.trim() || '',
      ariztia: parts[10]?.includes('Ariztia'),
      lts: parts[11]?.includes('LTS'),
      rendic: parts[12]?.includes('Rendic'),
      interpolar: parts[13]?.includes('Interpolar'),
      is_active: true
    })
  }
  
  return transportistas
}

// Parse conductores (drivers) from TSV
function parseConductores() {
  const filePath = path.join(process.cwd(), 'data', 'conductores.txt')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  const conductores = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split('\t')
    if (parts.length < 5) continue
    
    const rut = parts[0]?.trim() || ''
    const nombre = parts[1]?.trim() || ''
    
    if (!rut || !nombre) continue
    
    conductores.push({
      id: `driver-${i}`,
      rut,
      nombres: nombre.split(' ')[0] || '',
      apellido_paterno: nombre.split(' ')[1] || '',
      apellido_materno: nombre.split(' ')[2] || '',
      nombre,
      rut_proveedor: parts[2]?.trim() || '',
      proveedor: parts[3]?.trim() || '',
      patente_tracto: parts[4]?.trim() || '',
      clase_licencia: 'A-4',
      is_active: true,
      expiryDates: {
        'Licencia de Conducir': '2025-06-30',
        'Certificado PSI': '2025-08-15'
      }
    })
  }
  
  return conductores
}

// Generate JavaScript export file
async function generateDataFile() {
  console.log('[v0] Parsing transportistas...')
  const transportistas = parseTransportistas()
  
  console.log('[v0] Parsing conductores...')
  const conductores = parseConductores()
  
  console.log(`[v0] Found ${transportistas.length} transportistas`)
  console.log(`[v0] Found ${conductores.length} conductores`)
  
  const output = `// Auto-generated from TSV data files
export const TRANSPORTISTAS_DATA = ${JSON.stringify(transportistas, null, 2)};

export const CONDUCTORES_DATA = ${JSON.stringify(conductores, null, 2)};

export const TOTAL_STATS = {
  totalTransportistas: ${transportistas.length},
  totalConductores: ${conductores.length},
  activeTransportistas: ${transportistas.filter(t => t.is_active).length},
  activeConductores: ${conductores.filter(c => c.is_active).length},
  generatedAt: new Date().toISOString()
};
`
  
  const outputPath = path.join(process.cwd(), 'lib', 'operations', 'all-data.ts')
  fs.writeFileSync(outputPath, output)
  
  console.log(`[v0] Generated ${outputPath}`)
  console.log(`[v0] Total records: ${transportistas.length + conductores.length}`)
}

generateDataFile().catch(console.error)
