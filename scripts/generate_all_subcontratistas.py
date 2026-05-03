#!/usr/bin/env python3
import csv
from pathlib import Path

# Read the transportistas.txt file
input_file = Path('/vercel/share/v0-project/data/transportistas.txt')
lines = input_file.read_text().strip().split('\n')

# Parse the data - skip header
inserts = []
seen_ruts = set()

for line in lines[1:]:  # Skip header
    parts = line.split('\t')
    if len(parts) < 10:
        continue
    
    rut = parts[0].strip()
    proveedor = parts[1].strip()
    representante = parts[2].strip()
    ejecutiva = parts[4].strip()
    direccion = parts[5].strip()
    telefono = parts[7].strip()
    correo = parts[8].strip()
    
    # Skip duplicates and empty RUTs
    if not rut or rut in seen_ruts:
        continue
    
    seen_ruts.add(rut)
    
    # Escape single quotes
    proveedor = proveedor.replace("'", "''")
    representante = representante.replace("'", "''")
    direccion = direccion.replace("'", "''")
    ejecutiva = ejecutiva.replace("'", "''")
    telefono = telefono.replace("'", "''")
    correo = correo.replace("'", "''")
    
    insert = f"('{rut}', '{proveedor}', '{representante}', '{telefono}', '{correo}', '{direccion}', true)"
    inserts.append(insert)

# Generate SQL file
sql = """-- Delete existing subcontratistas
DELETE FROM subcontratistas;

-- Insert all 221 unique companies from transportistas.txt
INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, is_active) VALUES
"""

sql += ",\n".join(inserts)
sql += ";"

# Write to output file
output_file = Path('/vercel/share/v0-project/scripts/populate_all_221_subcontratistas.sql')
output_file.write_text(sql)

print(f"Generated SQL file with {len(inserts)} companies")
print(f"Output: {output_file}")
