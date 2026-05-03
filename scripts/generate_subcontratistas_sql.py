#!/usr/bin/env python3
import os
from pathlib import Path

# Read transportistas.txt
transportistas_file = Path('/vercel/share/v0-project/data/transportistas.txt')
lines = transportistas_file.read_text(encoding='utf-8').strip().split('\n')

# Skip header
subcontratistas = []
for line in lines[1:]:
    parts = line.split('\t')
    if len(parts) >= 11:
        rut = parts[0].strip()
        razon_social = parts[1].strip()
        representante = parts[2].strip()
        ejecutiva = parts[4].strip()
        direccion = parts[5].strip()
        comuna = parts[6].strip()
        telefono = parts[7].strip()
        email = parts[8].strip()
        ariztia = parts[9].strip() == 'Ariztia'
        lts = parts[10].strip() == 'LTS'
        rendic = len(parts) > 11 and parts[11].strip() == 'Rendic'
        interpolar = len(parts) > 12 and parts[12].strip() == 'Interpolar'
        
        subcontratistas.append({
            'rut': rut,
            'razon_social': razon_social,
            'representante': representante,
            'ejecutiva': ejecutiva,
            'direccion': direccion,
            'comuna': comuna,
            'telefono': telefono,
            'email': email,
            'ariztia': ariztia,
            'lts': lts,
            'rendic': rendic,
            'interpolar': interpolar,
        })

# Generate SQL
sql = """-- Clear existing subcontratistas
DELETE FROM subcontratistas;

-- Insert all subcontratistas from transportistas.txt
"""

for sub in subcontratistas:
    sql += f"""INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, ejecutiva, direccion, comuna, telefono, email, ariztia, lts, rendic, interpolar, is_active)
VALUES ('{sub['rut']}', '{sub['razon_social'].replace("'", "''")}', '{sub['representante'].replace("'", "''")}', '{sub['ejecutiva']}', '{sub['direccion'].replace("'", "''")}', '{sub['comuna']}', '{sub['telefono']}', '{sub['email']}', {str(sub['ariztia']).lower()}, {str(sub['lts']).lower()}, {str(sub['rendic']).lower()}, {str(sub['interpolar']).lower()}, true);
"""

# Write to file
output_file = Path('/vercel/share/v0-project/scripts/populate_subcontratistas_from_transportistas.sql')
output_file.write_text(sql)

print(f"[v0] Generated SQL for {len(subcontratistas)} subcontratistas")
print(f"[v0] SQL file: {output_file}")
print(f"[v0] First subcontratista: {subcontratistas[0] if subcontratistas else 'None'}")
