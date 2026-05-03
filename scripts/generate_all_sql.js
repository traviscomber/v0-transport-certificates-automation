import fs from 'fs'
import path from 'path'

// Read CSV 45 (subcontratistas)
const csv45Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/45-wJS8A.csv')
const csv45Content = fs.readFileSync(csv45Path, 'utf-8')

// Read CSV 44 (conductores)  
const csv44Path = path.join(process.cwd(), 'user_read_only_context/text_attachments/44-OEuzp.csv')
const csv44Content = fs.readFileSync(csv44Path, 'utf-8')

const lines45 = csv45Content.trim().split('\n')
const lines44 = csv44Content.trim().split('\n')

// Parse subcontratistas (skip header row 1)
const subcontratistas = []
for (let i = 1; i < lines45.length; i++) {
  const parts = lines45[i].split(';')
  if (parts.length >= 9) {
    subcontratistas.push({
      rut: parts[0]?.trim() || '',
      razon_social: parts[1]?.trim() || '',
      nombre_contacto: parts[2]?.trim() || '',
      rut_contacto: parts[3]?.trim() || '',
      ejecutiva: parts[4]?.trim() || '',
      direccion: parts[5]?.trim() || '',
      comuna: parts[6]?.trim() || '',
      telefono: parts[7]?.trim() || '',
      email: parts[8]?.trim() || ''
    })
  }
}

// Parse conductores (skip header row 1)
const conductores = []
for (let i = 1; i < lines44.length; i++) {
  const parts = lines44[i].split(';')
  if (parts.length >= 3) {
    conductores.push({
      rut: parts[0]?.trim() || '',
      nombres: parts[1]?.trim() || '',
      rut_proveedor: parts[2]?.trim() || ''
    })
  }
}

console.log(`Parsed ${subcontratistas.length} subcontratistas`)
console.log(`Parsed ${conductores.length} conductores`)

// Generate SQL for subcontratistas in batches
console.log('\n-- SUBCONTRATISTAS SQL --\n')
for (let batch = 0; batch < Math.ceil(subcontratistas.length / 30); batch++) {
  const start = batch * 30
  const end = Math.min(start + 30, subcontratistas.length)
  const batchRecords = subcontratistas.slice(start, end)
  
  const values = batchRecords.map(s => {
    const rut = s.rut.replace(/'/g, "''")
    const razon = s.razon_social.replace(/'/g, "''")
    const contacto = s.nombre_contacto.replace(/'/g, "''")
    const dir = s.direccion.replace(/'/g, "''")
    const comuna = s.comuna.replace(/'/g, "''")
    const tel = s.telefono.replace(/'/g, "''")
    const email = s.email.replace(/'/g, "''")
    const exec = s.ejecutiva.replace(/'/g, "''")
    
    return `('${rut}', '${razon}', '${contacto}', '${dir}', '${comuna}', '${tel}', '${email}', '${exec}', false, false, false, false, true)`
  }).join(',\n')
  
  console.log(`-- Batch ${batch + 1} of ${Math.ceil(subcontratistas.length / 30)}`)
  console.log(`INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, direccion, comuna, telefono, email, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES\n${values}\nON CONFLICT (rut) DO NOTHING;\n`)
}

// Generate SQL for conductores in batches
console.log('\n-- CONDUCTORES SQL --\n')
for (let batch = 0; batch < Math.ceil(conductores.length / 50); batch++) {
  const start = batch * 50
  const end = Math.min(start + 50, conductores.length)
  const batchRecords = conductores.slice(start, end)
  
  const values = batchRecords.map(c => {
    const rut = c.rut.replace(/'/g, "''")
    const nombres = c.nombres.replace(/'/g, "''")
    const rut_prov = c.rut_proveedor.replace(/'/g, "''")
    
    return `('${rut}', '${nombres}', '${rut_prov}', (SELECT id FROM subcontratistas WHERE rut = '${rut_prov}' LIMIT 1), true)`
  }).join(',\n')
  
  console.log(`-- Batch ${batch + 1} of ${Math.ceil(conductores.length / 50)}`)
  console.log(`INSERT INTO conductores (rut, nombres, rut_proveedor, transportista_id, is_active) VALUES\n${values};\n`)
}

console.log(`\n-- Final verification --`)
console.log(`SELECT COUNT(*) as total_subcontratistas FROM subcontratistas;`)
console.log(`SELECT COUNT(*) as total_conductores FROM conductores;`)
