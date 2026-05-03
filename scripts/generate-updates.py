#!/usr/bin/env python3
import csv
import sys

# Read the subcontratistas.csv and generate SQL UPDATE statements
csv_file = '/vercel/share/v0-project/scripts/subcontratistas.csv'

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        print("-- Auto-generated SQL to update transportistas table with complete data")
        print("-- This updates 229 records with teléfono, correo, ejecutiva, dirección, comuna, representante_legal")
        print()
        
        count = 0
        for row in reader:
            rut = row.get('Rut_Proveedor', '').strip()
            nombre = row.get('Proveedor', '').replace("'", "''").strip()
            representante = row.get('Representante Legal', '').replace("'", "''").strip()
            ejecutiva = row.get('Ejecutiva', '').replace("'", "''").strip()
            direccion = row.get('Direccion', '').replace("'", "''").strip()
            comuna = row.get('Comuna', '').replace("'", "''").strip()
            telefono = row.get('Telefono', '').replace("'", "''").strip()
            correo = row.get('Correo', '').replace("'", "''").strip()
            
            if not rut:
                continue
                
            print(f"UPDATE transportistas SET ")
            print(f"  razon_social = '{nombre}',")
            print(f"  representante_legal = '{representante}',")
            print(f"  ejecutivo_nombre = '{ejecutiva}',")
            print(f"  direccion = '{direccion}',")
            print(f"  comuna = '{comuna}',")
            print(f"  telefono = '{telefono}',")
            print(f"  correo = '{correo}'")
            print(f"WHERE rut = '{rut}';")
            print()
            
            count += 1
        
        print(f"-- Total updates: {count}")
        
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
