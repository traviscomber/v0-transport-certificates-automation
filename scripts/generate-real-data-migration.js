import fs from 'fs'
import path from 'path'

// Import actual data
const allDriversData = require('../lib/data/all-drivers.ts').allDriversData
const allSubcontractorsData = require('../lib/data/all-subcontractors.ts').allSubcontractorsData

// Generate SQL for organizations
const orgSql = allSubcontractorsData
  .map((org: any, idx: number) => {
    const rut = org.rut.replace(/'/g, "''")
    const name = org.nombre.replace(/'/g, "''")
    return `('${name}', '${rut}', 'transportista')`
  })
  .join(',\n')

// Generate SQL for drivers
const driverSql = allDriversData
  .map((driver: any, idx: number) => {
    const orgIdx = idx % allSubcontractorsData.length
    const rut = driver.rut.replace(/'/g, "''")
    const firstName = (driver.nombres || '').replace(/'/g, "''")
    const lastName = ((driver.apellido_paterno || '') + ' ' + (driver.apellido_materno || '')).trim().replace(/'/g, "''")
    const email = `${driver.rut.replace(/\./g, '').replace(/-/g, '')}@transportes-labbe.cl`
    
    return `(
      (SELECT id FROM public.organizations WHERE rut = '${allSubcontractorsData[orgIdx].rut.replace(/'/g, "''")}'),
      '${rut}',
      '${email}',
      '',
      '${firstName}',
      '${lastName}'
    )`
  })
  .join(',\n')

const migrationSql = `-- Clear existing data
DELETE FROM public.drivers;
DELETE FROM public.organizations;

-- Insert real organizations
INSERT INTO public.organizations (name, rut, type) VALUES
${orgSql};

-- Insert real drivers
INSERT INTO public.drivers (organization_id, rut, email, phone, first_name, last_name)
VALUES
${driverSql};`

// Output
console.log(migrationSql)

// Optionally write to file
const outputPath = path.join(process.cwd(), 'migration-real-data.sql')
fs.writeFileSync(outputPath, migrationSql)
console.error(`[v0] Wrote SQL to: ${outputPath}`)
