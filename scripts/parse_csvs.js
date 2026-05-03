import fs from 'fs'
import path from 'path'

// Read both CSV files
const csv44Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/44-OEuzp.csv')
const csv45Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/45-wJS8A.csv')

const csv44Content = fs.readFileSync(csv44Path, 'utf-8')
const csv45Content = fs.readFileSync(csv45Path, 'utf-8')

const lines44 = csv44Content.trim().split('\n')
const lines45 = csv45Content.trim().split('\n')

console.log(`[v0] CSV 44 lines: ${lines44.length}`)
console.log(`[v0] CSV 45 lines: ${lines45.length}`)

// Parse CSV 45 (subcontratistas)
const subcontratistas = []
for (let i = 1; i < lines45.length; i++) {
  const fields = lines45[i].split(';')
  if (fields[0]) {
    subcontratistas.push({
      rut: fields[0].trim(),
      nombre: fields[1].trim(),
      representante: fields[2].trim(),
    })
  }
}

console.log(`[v0] Found ${subcontratistas.length} subcontratistas`)

// Generate SQL for subcontratistas
let sqlSubcontratistas = 'INSERT INTO subcontratistas (rut, razon_social, nombre, is_active) VALUES\n'
subcontratistas.forEach((s, idx) => {
  const rut = s.rut.replace(/'/g, "''")
  const nombre = s.nombre.replace(/'/g, "''")
  const coma = idx < subcontratistas.length - 1 ? ',' : ';'
  sqlSubcontratistas += `('${rut}', '${nombre}', '${nombre}', true)${coma}\n`
})

// Parse CSV 44 (conductores) - these are the same subcontratistas, so no additional conductores
// If CSV 44 is really the same as 45, we don't have individual driver data
// This means each company representative IS the conductor

let sqlConductores = 'INSERT INTO conductores (rut, nombres, rut_proveedor, transportista_id, is_active) VALUES\n'
// Use subcontratistas as both companies and their conductores
subcontratistas.forEach((s, idx) => {
  const rutProveedor = s.rut.replace(/'/g, "''")
  const nombre = s.representante.replace(/'/g, "''")
  const coma = idx < subcontratistas.length - 1 ? ',' : ';'
  sqlConductores += `('${rutProveedor}', '${nombre}', '${rutProveedor}', (SELECT id FROM subcontratistas WHERE rut = '${rutProveedor}' LIMIT 1), true)${coma}\n`
})

console.log('\n=== SUBCONTRATISTAS INSERT ===')
console.log(sqlSubcontratistas.substring(0, 500))
console.log('\n=== CONDUCTORES INSERT ===')
console.log(sqlConductores.substring(0, 500))

// Save to files
fs.writeFileSync('/vercel/share/v0-project/scripts/insert_subcontratistas.sql', sqlSubcontratistas)
fs.writeFileSync('/vercel/share/v0-project/scripts/insert_conductores_from_csv.sql', sqlConductores)

console.log('\n[v0] SQL scripts generated successfully')
