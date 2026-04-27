#!/usr/bin/env python3
import os

# Read the text file
with open('/vercel/share/v0-project/data/transportistas.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Skip header line
lines = lines[1:]

# Parse data and generate INSERT SQL
insert_values = []

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Split by tab
    parts = line.split('\t')
    if len(parts) < 10:
        continue
    
    rut = parts[0].strip() if parts[0] else ''
    razon_social = parts[1].strip() if parts[1] else ''
    representante = parts[2].strip() if parts[2] else ''
    ejecutiva = parts[4].strip() if parts[4] else ''
    direccion = parts[5].strip() if parts[5] else ''
    comuna = parts[6].strip() if parts[6] else ''
    telefono = parts[7].strip() if parts[7] else ''
    correo = parts[8].strip() if parts[8] else ''
    
    # Parse tags (columns 9-11 are Ariztia, LTS, Rendic)
    ariztia = 'true' if (len(parts) > 9 and 'Ariztia' in parts[9]) else 'false'
    lts = 'true' if (len(parts) > 10 and 'LTS' in parts[10]) else 'false'
    rendic = 'true' if (len(parts) > 11 and 'Rendic' in parts[11]) else 'false'
    
    # Extract region from comuna (simple heuristic)
    region_map = {
        'Iquique': 'I',
        'Antofagasta': 'II',
        'Copiapó': 'III',
        'La Serena': 'IV',
        'Valparaiso': 'V',
        'Santiago': 'RM',
        'Rancagua': 'VI',
        'Talca': 'VII',
        'Concepción': 'VIII',
        'Los Ángeles': 'IX',
        'Puerto Montt': 'X',
        'Valdivia': 'X',
    }
    region = region_map.get(comuna, 'RM')
    
    # Escape single quotes
    razon_social_esc = razon_social.replace("'", "''")
    representante_esc = representante.replace("'", "''")
    direccion_esc = direccion.replace("'", "''")
    comuna_esc = comuna.replace("'", "''")
    correo_esc = correo.replace("'", "''")
    ejecutiva_esc = ejecutiva.replace("'", "''")
    
    value = f"('{rut}', '{razon_social_esc}', '{representante_esc}', '{telefono}', '{correo_esc}', '{direccion_esc}', '{comuna_esc}', '{region}', '', '{ejecutiva_esc}', {ariztia}, {lts}, {rendic}, false, true)"
    insert_values.append(value)

# Generate full INSERT statement
if insert_values:
    sql = """-- Delete existing data
DELETE FROM subcontratistas;

-- Insert all 234 subcontratistas
INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES
"""
    
    sql += ",\n".join(insert_values)
    sql += ";"
    
    # Output the SQL
    print(sql)
    print(f"\n-- Total subcontratistas: {len(insert_values)}")
