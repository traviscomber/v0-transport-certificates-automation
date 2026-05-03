#!/usr/bin/env python3
import csv
import sys
from pathlib import Path

# Read the CSV file
csv_path = "/vercel/share/v0-project/scripts/subcontratistas.csv"

# Helper function to escape SQL strings
def escape_sql(value):
    if value is None or value == '':
        return 'NULL'
    # Replace single quotes with two single quotes
    value = str(value).replace("'", "''")
    return f"'{value}'"

# Helper function to convert flag values
def convert_flag(value):
    if value and str(value).strip().upper() in ['ARIZTIA', 'LTS', 'RENDIC', 'INTERPOLAR', 'X', 'SI', 'S', '1']:
        return 'true'
    return 'false'

# Read and process CSV
rows = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        # Extract data
        rut = row.get('Rut_Proveedor', '').strip()
        razon_social = row.get('Proveedor', '').strip()
        nombre_contacto = row.get('Representante Legal', '').strip()
        telefono = row.get('Telefono', '').strip() or '0'
        email = row.get('Correo', '').strip()
        direccion = row.get('Direccion', '').strip()
        comuna = row.get('Comuna', '').strip()
        region = 'RM'  # Default region
        nombre_fantasia = ''
        ejecutiva = row.get('Ejecutiva', '').strip()
        
        # Convert boolean flags
        ariztia = convert_flag(row.get('Ariztia', ''))
        lts = convert_flag(row.get('LTS', ''))
        rendic = convert_flag(row.get('Rendic', ''))
        interpolar = convert_flag(row.get('Interpolar', ''))
        
        # Store the row
        rows.append({
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

# Generate SQL INSERT statements in batches
print(f"-- Loading {len(rows)} subcontratistas from CSV")
print("-- Total records to load:", len(rows))
print()

# Split into batches of 30 records
batch_size = 30
for batch_num, i in enumerate(range(0, len(rows), batch_size), 1):
    batch = rows[i:i+batch_size]
    print(f"-- Insert BATCH {batch_num}: Subcontratistas {i+1}-{min(i+batch_size, len(rows))}")
    print("INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES")
    
    for idx, row in enumerate(batch):
        values = [
            escape_sql(row['rut']),
            escape_sql(row['razon_social']),
            escape_sql(row['nombre_contacto']),
            escape_sql(row['telefono']),
            escape_sql(row['email']),
            escape_sql(row['direccion']),
            escape_sql(row['comuna']),
            escape_sql(row['region']),
            escape_sql(row['nombre_fantasia']),
            escape_sql(row['ejecutiva']),
            row['ariztia'].lower(),
            row['lts'].lower(),
            row['rendic'].lower(),
            row['interpolar'].lower(),
            'true'
        ]
        
        comma = ',' if idx < len(batch) - 1 else ';'
        print(f"({', '.join(values)}){comma}")
    
    print()

print(f"SELECT COUNT(*) as total FROM subcontratistas;")
