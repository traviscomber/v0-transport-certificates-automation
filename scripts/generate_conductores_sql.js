#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Read CSV file
const csvPath = '/vercel/share/v0-project/user_read_only_context/text_attachments/44-db1kM.csv'
const csvContent = fs.readFileSync(csvPath, 'utf-8')
const lines = csvContent.trim().split('\n')

// Parse header
const header = lines[0].split(';')
console.log('-- Generated SQL to load conductores from CSV')
console.log('-- Clear existing conductores')
console.log('DELETE FROM conductores;')
console.log()
console.log('-- Insert conductores with correct data')
console.log('INSERT INTO conductores (rut_proveedor, rut, nombres, apellido_paterno, apellido_materno, direccion, comuna, telefono, correo, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES')
console.log()

const values = []

// Parse data rows (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  
  const parts = line.split(';')
  if (parts.length < 10) continue
  
  const rut_proveedor = escapeSql(parts[0]?.trim() || '')
  const proveedor = escapeSql(parts[1]?.trim() || '')
  const representante = escapeSql(parts[2]?.trim() || '')
  const rut_rl = escapeSql(parts[3]?.trim() || '')
  const ejecutiva = escapeSql(parts[4]?.trim() || 'Carolina')
  const direccion = escapeSql(parts[5]?.trim() || '')
  const comuna = escapeSql(parts[6]?.trim() || '')
  const telefono = escapeSql(parts[7]?.trim() || '')
  const correo = escapeSql(parts[8]?.trim() || '')
  
  // Parse certifications from remaining columns
  const certifications = parts.slice(9).map(s => s.trim().toUpperCase())
  const ariztia = certifications.includes('ARIZTIA') ? 'true' : 'false'
  const lts = certifications.includes('LTS') ? 'true' : 'false'
  const rendic = certifications.includes('RENDIC') ? 'true' : 'false'
  const interpolar = certifications.includes('INTERPOLAR') ? 'true' : 'false'
  
  // Parse names from representante
  const nameParts = representante.split(' ').filter(p => p)
  const nombres = nameParts[0] || ''
  const apellido_paterno = nameParts[1] || ''
  const apellido_materno = nameParts.slice(2).join(' ') || ''
  
  const sqlValue = `('${rut_proveedor}', '${rut_rl}', '${nombres}', '${apellido_paterno}', '${apellido_materno}', '${direccion}', '${comuna}', '${telefono}', '${correo}', '${ejecutiva}', ${ariztia}, ${lts}, ${rendic}, ${interpolar}, true)`
  values.push(sqlValue)
}

// Output in batches
for (let i = 0; i < values.length; i++) {
  if (i > 0) console.log(',')
  console.log(values[i])
}
console.log(';')

function escapeSql(str) {
  return str.replace(/'/g, "''")
}
