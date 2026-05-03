import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Parse CSV line
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

async function updateTransportistas() {
  try {
    const csvPath = path.join(process.cwd(), 'scripts', 'subcontratistas.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    // Skip header
    const dataLines = lines.slice(1)
    
    console.log(`[v0] Processing ${dataLines.length} records from CSV`)
    
    let successCount = 0
    let errorCount = 0
    const errors = []
    
    // Process in batches of 10
    for (let i = 0; i < dataLines.length; i += 10) {
      const batch = dataLines.slice(i, i + 10)
      
      const updates = batch.map(line => {
        try {
          const fields = parseCSVLine(line)
          // Expected columns: RUT, Nombre, Representante, Ejecutiva, Dirección, Comuna, Teléfono, Correo, Ariztia, LTS, Rendic, Interpolar
          const rut = fields[0]?.trim()
          const nombre = fields[1]?.trim()
          const representante = fields[2]?.trim()
          const ejecutiva = fields[3]?.trim()
          const direccion = fields[4]?.trim()
          const comuna = fields[5]?.trim()
          const telefono = fields[6]?.trim()
          const correo = fields[7]?.trim()
          
          if (!rut) return null
          
          return {
            rut,
            nombre,
            representante,
            ejecutiva,
            direccion,
            comuna,
            telefono,
            correo
          }
        } catch (e) {
          console.error(`Error parsing line ${i}: ${line}`, e.message)
          return null
        }
      }).filter(Boolean)
      
      // Execute updates
      for (const update of updates) {
        try {
          const { error } = await supabase
            .from('transportistas')
            .update({
              razon_social: update.nombre || null,
              representante_legal: update.representante || null,
              ejecutivo_nombre: update.ejecutiva || 'Sin asignar',
              direccion: update.direccion || null,
              comuna: update.comuna || null,
              telefono: update.telefono || null,
              correo: update.correo || null,
            })
            .eq('rut', update.rut)
          
          if (error) {
            console.error(`[v0] Error updating RUT ${update.rut}:`, error.message)
            errorCount++
            errors.push({ rut: update.rut, error: error.message })
          } else {
            successCount++
            console.log(`[v0] Updated RUT ${update.rut}`)
          }
        } catch (e) {
          console.error(`[v0] Exception updating RUT ${update.rut}:`, e.message)
          errorCount++
          errors.push({ rut: update.rut, error: e.message })
        }
      }
      
      console.log(`[v0] Batch ${Math.floor(i / 10) + 1} complete: ${successCount} updated, ${errorCount} errors`)
    }
    
    console.log(`\n[v0] SUMMARY:`)
    console.log(`[v0] Total Processed: ${dataLines.length}`)
    console.log(`[v0] Successful Updates: ${successCount}`)
    console.log(`[v0] Failed Updates: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log(`\n[v0] Errors:`)
      errors.slice(0, 10).forEach(e => {
        console.log(`  - ${e.rut}: ${e.error}`)
      })
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`)
      }
    }
    
    // Verify completeness after update
    console.log(`\n[v0] Verifying data completeness...`)
    const { data: completenessData, error: completenessError } = await supabase
      .from('transportistas')
      .select('*')
      .filter('correo', 'is', null)
      .limit(5)
    
    if (completenessError) {
      console.error(`[v0] Error checking completeness:`, completenessError.message)
    } else {
      const incompleteCount = completenessData?.length || 0
      console.log(`[v0] Records still missing correo: ${incompleteCount}`)
    }
    
  } catch (error) {
    console.error('[v0] Script error:', error.message)
    process.exit(1)
  }
}

updateTransportistas()
