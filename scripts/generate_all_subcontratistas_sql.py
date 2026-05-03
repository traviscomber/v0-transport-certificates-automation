#!/usr/bin/env python3
"""
Parse transportistas file and generate SQL for all 234 subcontratistas
"""
import re

# Read the complete file
file_path = '/vercel/share/v0-project/user_read_only_context/text_attachments/pasted-text-lOnE6.txt'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except:
    # Try alternative path
    file_path = 'user_read_only_context/text_attachments/pasted-text-lOnE6.txt'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

# Parse data - skip header (line 0)
subcontratistas = []

for line in lines[1:]:  # Skip header
    if not line.strip():
        continue
    
    # Split by tab to get fields
    fields = line.strip().split('\t')
    
    if len(fields) < 10:
        continue
    
    # Extract fields (based on the header)
    rut = fields[0].strip() if len(fields) > 0 else ''
    razon_social = fields[1].strip() if len(fields) > 1 else ''
    nombre_contacto = fields[2].strip() if len(fields) > 2 else ''
    telefono = fields[3].strip() if len(fields) > 3 else ''
    email = fields[4].strip() if len(fields) > 4 else ''
    direccion = fields[5].strip() if len(fields) > 5 else ''
    comuna = fields[6].strip() if len(fields) > 6 else ''
    region = fields[7].strip() if len(fields) > 7 else ''
    nombre_fantasia = fields[8].strip() if len(fields) > 8 else ''
    ejecutiva = fields[9].strip() if len(fields) > 9 else ''
    
    # Extract boolean flags (look for Ariztia, LTS, Rendic, Interpolar in remaining fields)
    ariztia = 'true' if any('ariztia' in f.lower() for f in fields) else 'false'
    lts = 'true' if any('lts' in f.lower() for f in fields) else 'false'
    rendic = 'true' if any('rendic' in f.lower() for f in fields) else 'false'
    interpolar = 'true' if any('interpolar' in f.lower() for f in fields) else 'false'
    
    # Escape single quotes in strings
    razon_social = razon_social.replace("'", "''")
    nombre_contacto = nombre_contacto.replace("'", "''")
    email = email.replace("'", "''")
    direccion = direccion.replace("'", "''")
    comuna = comuna.replace("'", "''")
    nombre_fantasia = nombre_fantasia.replace("'", "''")
    ejecutiva = ejecutiva.replace("'", "''")
    
    subcontratistas.append({
        'rut': rut,
        'razon_social': razon_social,
        'nombre_contacto': nombre_contacto,
        'telefono': telefono,
        'email': email,
        'direccion': direccion,
        'comuna': comuna,
        'region': region,
        'nombre_fantasia': nombre_fantasia,
        'ejecutiva': ejecutiva,
        'ariztia': ariztia,
        'lts': lts,
        'rendic': rendic,
        'interpolar': interpolar
    })

print(f"[v0] Total subcontratistas parsed: {len(subcontratistas)}")

# Generate SQL in batches
batch_size = 50
batches = []

for i in range(0, len(subcontratistas), batch_size):
    batch_num = (i // batch_size) + 1
    batch = subcontratistas[i:i+batch_size]
    
    sql_values = []
    for sub in batch:
        sql_values.append(f"""('{sub['rut']}', '{sub['razon_social']}', '{sub['nombre_contacto']}', '{sub['telefono']}', '{sub['email']}', '{sub['direccion']}', '{sub['comuna']}', '{sub['region']}', '{sub['nombre_fantasia']}', '{sub['ejecutiva']}', {sub['ariztia']}, {sub['lts']}, {sub['rendic']}, {sub['interpolar']}, true)""")
    
    sql = f"""-- BATCH {batch_num} ({len(batch)} records, total so far: {min((i+batch_size), len(subcontratistas))})
INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES
{','.join(sql_values)};
"""
    batches.append(sql)
    print(f"[v0] Batch {batch_num}: {len(batch)} records generated")

# Write batches to files
for i, batch_sql in enumerate(batches, 1):
    output_file = f'/vercel/share/v0-project/scripts/load_subcontratistas_batch_{i}.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(batch_sql)
    print(f"[v0] Written: {output_file}")

print(f"\n[v0] Total batches: {len(batches)}")
print(f"[v0] Total subcontratistas: {len(subcontratistas)}")
print(f"[v0] SQL files ready to execute")
