import fs from 'fs'
import path from 'path'

// Files to parse
const transportistasPath = '/vercel/share/v0-project/data/transportistas.txt'
const conductoresPath = '/vercel/share/v0-project/data/conductores.txt'

console.log('[v0] Parsing all transportistas and conductores...')

try {
  // Parse transportistas
  const transportistasContent = fs.readFileSync(transportistasPath, 'utf-8')
  const transportistasLines = transportistasContent.split('\n')
  
  const transportistas = []
  for (let i = 1; i < transportistasLines.length; i++) {
    const line = transportistasLines[i].trim()
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
      representante: parts[3]?.trim() || '',
      ejecutiva: parts[5]?.trim() || '',
      direccion: parts[6]?.trim() || '',
      comuna: parts[7]?.trim() || '',
      telefono: parts[8]?.trim() || '',
      email: parts[9]?.trim() || ''
    })
  }

  // Parse conductores
  const conductoresContent = fs.readFileSync(conductoresPath, 'utf-8')
  const conductoresLines = conductoresContent.split('\n')
  
  const conductores = []
  for (let i = 1; i < conductoresLines.length; i++) {
    const line = conductoresLines[i].trim()
    if (!line) continue
    
    const parts = line.split('\t')
    if (parts.length < 5) continue
    
    const rut = parts[0]?.trim() || ''
    const nombre = parts[1]?.trim() || ''
    
    if (!rut || !nombre) continue
    
    conductores.push({
      id: `drv-${i}`,
      rut,
      nombre,
      rut_proveedor: parts[2]?.trim() || '',
      proveedor: parts[3]?.trim() || '',
      patente_tracto: parts[4]?.trim() || ''
    })
  }

  console.log(`[v0] Parsed ${transportistas.length} transportistas`)
  console.log(`[v0] Parsed ${conductores.length} conductores`)

  // Generate output
  const output = `// AUTO-GENERATED: All real clients from TSV files
// Generated: ${new Date().toISOString()}
// Total: ${transportistas.length} transportistas + ${conductores.length} conductores

export const allTransportistas = ${JSON.stringify(transportistas, null, 2)}

export const allConductores = ${JSON.stringify(conductores, null, 2)}

export const stats = {
  totalTransportistas: ${transportistas.length},
  totalConductores: ${conductores.length}
}
`

  const outputPath = '/vercel/share/v0-project/lib/data/all-data.ts'
  fs.writeFileSync(outputPath, output, 'utf-8')
  
  console.log(`[v0] Generated ${outputPath}`)
  console.log(`[v0] File size: ${(output.length / 1024 / 1024).toFixed(2)} MB`)
  console.log('[v0] SUCCESS!')
  
} catch (error) {
  console.error('[v0] Error:', error.message)
  process.exit(1)
}
