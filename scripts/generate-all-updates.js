import fs from 'fs'

const csvFile = './scripts/subcontratistas.csv'
const content = fs.readFileSync(csvFile, 'utf-8')
const lines = content.split('\n').filter(line => line.trim())

// Parse CSV with semicolon delimiter
const headers = lines[0].split(';').map(h => h.trim())
console.log('Headers:', headers)

const updates = []
let count = 0

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(';').map(p => p.trim())
  if (parts.length < 3) continue

  const rut = parts[0]?.replace(/'/g, "''") || ''
  const proveedor = parts[1]?.replace(/'/g, "''") || ''
  const representante = parts[2]?.replace(/'/g, "''") || ''
  const ejecutiva = parts[4]?.replace(/'/g, "''") || ''
  const direccion = parts[5]?.replace(/'/g, "''") || ''
  const comuna = parts[6]?.replace(/'/g, "''") || ''
  const telefono = parts[7]?.replace(/'/g, "''") || ''
  const correo = parts[8]?.replace(/'/g, "''") || ''

  if (rut) {
    updates.push(
      `UPDATE transportistas SET ejecutivo_nombre='${ejecutiva}', direccion='${direccion}', comuna='${comuna}', telefono='${telefono}', correo='${correo}', representante_legal='${representante}' WHERE rut='${rut}';`
    )
    count++
  }
}

console.log(`Generated ${count} UPDATE statements`)
console.log('\n-- SQL Updates for transportistas table\n')
updates.forEach(u => console.log(u))

console.log(`\n-- Summary: Updated ${count} records`)
console.log(`SELECT COUNT(*) as total_with_data FROM transportistas WHERE telefono IS NOT NULL AND telefono != '';`)
