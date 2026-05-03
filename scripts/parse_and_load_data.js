import fs from 'fs'
import path from 'path'

const csvPath = path.join(process.cwd(), 'user_read_only_context/text_attachments/44-db1kM.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')
const lines = csvContent.trim().split('\n')

// Parse header
const headers = lines[0].split(',').map(h => h.trim())
const rutProveedorIdx = headers.indexOf('Rut_Proveedor')
const proveedorIdx = headers.indexOf('Proveedor')
const represLegalIdx = headers.indexOf('Representante Legal')
const rutRLIdx = headers.indexOf('Rut R.L.')
const ejecutivaIdx = headers.indexOf('Ejecutiva')

console.log('Header indices:', { rutProveedorIdx, proveedorIdx, represLegalIdx, rutRLIdx, ejecutivaIdx })

// Extract unique subcontratistas and conductores
const subcontratistasMap = new Map()
const conductores = []

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  
  const parts = line.split(',')
  if (parts.length < rutRLIdx + 1) continue
  
  const rutProveedor = parts[rutProveedorIdx]?.trim()
  const proveedor = parts[proveedorIdx]?.trim()
  const represLegal = parts[represLegalIdx]?.trim()
  const rutRL = parts[rutRLIdx]?.trim()
  const ejecutiva = parts[ejecutivaIdx]?.trim()
  
  if (rutProveedor && proveedor) {
    // Store unique subcontratista
    if (!subcontratistasMap.has(rutProveedor)) {
      subcontratistasMap.set(rutProveedor, {
        rut: rutProveedor,
        nombre: proveedor,
        ejecutiva: ejecutiva || 'N/A'
      })
    }
    
    // Store conductor
    if (represLegal && rutRL) {
      conductores.push({
        rut: rutRL,
        nombres: represLegal,
        rut_proveedor: rutProveedor
      })
    }
  }
}

console.log(`Found ${subcontratistasMap.size} unique subcontratistas`)
console.log(`Found ${conductores.length} conductores`)

// Generate INSERT statements for subcontratistas
console.log('\n-- SUBCONTRATISTAS INSERT')
console.log('INSERT INTO subcontratistas (rut, razon_social, nombre, is_active) VALUES')
const subInserts = Array.from(subcontratistasMap.values()).map((s, idx) => {
  const isLast = idx === subcontratistasMap.size - 1
  const comma = isLast ? ';' : ','
  const nombre = s.nombre.replace(/'/g, "''")
  return `('${s.rut}', '${nombre}', '${nombre}', true)${comma}`
})
console.log(subInserts.join('\n'))

// Generate INSERT statements for conductores
console.log('\n-- CONDUCTORES INSERT')
console.log('INSERT INTO conductores (rut, nombres, rut_proveedor, transportista_id, is_active) VALUES')
const conducInserts = conductores.map((c, idx) => {
  const isLast = idx === conductores.length - 1
  const comma = isLast ? ';' : ','
  const nombres = c.nombres.replace(/'/g, "''")
  return `('${c.rut}', '${nombres}', '${c.rut_proveedor}', (SELECT id FROM subcontratistas WHERE rut = '${c.rut_proveedor}' LIMIT 1), true)${comma}`
})
console.log(conducInserts.join('\n'))
