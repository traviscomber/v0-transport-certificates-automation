#!/usr/bin/env python3
import csv

# Read CSV file
csv_file = '/vercel/share/v0-project/user_read_only_context/text_attachments/44-db1kM.csv'

# Parse CSV
rows = []
with open(csv_file, encoding='utf-8', errors='ignore') as f:
    # Skip header and read
    lines = f.readlines()[1:]  # Skip first line (header)
    for line in lines:
        parts = line.strip().split(';')
        if len(parts) >= 10:
            rows.append(parts)

# Generate SQL
print("-- Clear existing conductores data")
print("DELETE FROM conductores;")
print()
print("-- Insert all conductores from the CSV data")
print("INSERT INTO conductores (rut_proveedor, rut, nombres, apellido_paterno, apellido_materno, direccion, comuna, telefono, correo, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES")
print()

insert_values = []
for i, row in enumerate(rows):
    if len(row) < 10:
        continue
    
    # Extract fields, handling empty values and quotes
    rut_proveedor = row[0].strip() or 'NULL'
    proveedor = row[1].strip() or ''
    representante = row[2].strip() or ''
    rut_rl = row[3].strip() or 'NULL'
    ejecutiva = row[4].strip() or 'Carolina'
    direccion = row[5].strip() or ''
    comuna = row[6].strip() or ''
    telefono = row[7].strip() or ''
    correo = row[8].strip() or ''
    
    # Parse names (split by space)
    name_parts = representante.split()
    nombres = name_parts[0] if name_parts else ''
    apellido_paterno = name_parts[1] if len(name_parts) > 1 else ''
    apellido_materno = ' '.join(name_parts[2:]) if len(name_parts) > 2 else ''
    
    # Parse certifications (ariztia, lts, rendic, interpolar)
    ariztia = 'true' if (len(row) > 9 and row[9].strip().upper() == 'ARIZTIA') else 'false'
    lts = 'true' if (len(row) > 10 and row[10].strip().upper() == 'LTS') else 'false'
    rendic = 'true' if (len(row) > 11 and row[11].strip().upper() == 'RENDIC') else 'false'
    interpolar = 'true' if (len(row) > 12 and row[12].strip().upper() == 'INTERPOLAR') else 'false'
    
    # Escape single quotes in strings
    nombres = nombres.replace("'", "''")
    apellido_paterno = apellido_paterno.replace("'", "''")
    apellido_materno = apellido_materno.replace("'", "''")
    direccion = direccion.replace("'", "''")
    comuna = comuna.replace("'", "''")
    telefono = telefono.replace("'", "''")
    correo = correo.replace("'", "''")
    
    sql_values = f"('{rut_proveedor}', '{rut_rl}', '{nombres}', '{apellido_paterno}', '{apellido_materno}', '{direccion}', '{comuna}', '{telefono}', '{correo}', '{ejecutiva}', {ariztia}, {lts}, {rendic}, {interpolar}, true)"
    insert_values.append(sql_values)

# Print insert statements (batch them to avoid SQL size limits)
batch_size = 50
for i in range(0, len(insert_values), batch_size):
    batch = insert_values[i:i+batch_size]
    print(',\n'.join(batch))
    if i + batch_size < len(insert_values):
        print(',')
        print()

print(';')
