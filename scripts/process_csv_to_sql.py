import csv
import sys

# Read CSV and generate SQL INSERT statements
csv_file = '/vercel/share/v0-project/scripts/subcontratistas.csv'

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        batch_num = 1
        batch_count = 0
        batch_size = 30
        
        print(f"-- Batch {batch_num}: Subcontratistas")
        print("INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES")
        
        rows = list(reader)
        values_list = []
        
        for idx, row in enumerate(rows):
            rut = row['Rut_Proveedor'].strip() if row['Rut_Proveedor'] else 'NULL'
            razon_social = row['Proveedor'].replace("'", "''").strip() if row['Proveedor'] else ''
            nombre_contacto = row['Representante Legal'].replace("'", "''").strip() if row['Representante Legal'] else ''
            telefono = row['Telefono'].strip() if row['Telefono'] else ''
            email = row['Correo'].strip() if row['Correo'] else ''
            direccion = row['Direccion'].replace("'", "''").strip() if row['Direccion'] else ''
            comuna = row['Comuna'].strip() if row['Comuna'] else ''
            region = 'RM'  # Default region
            nombre_fantasia = ''
            ejecutiva = row['Ejecutiva'].strip() if row['Ejecutiva'] and row['Ejecutiva'].strip() else ''
            ariztia = 'true' if row['Ariztia'] and row['Ariztia'].strip() else 'false'
            lts = 'true' if row['LTS'] and row['LTS'].strip() else 'false'
            rendic = 'true' if row['Rendic'] and row['Rendic'].strip() else 'false'
            interpolar = 'true' if row['Interpolar'] and row['Interpolar'].strip() else 'false'
            
            value = f"('{rut}', '{razon_social}', '{nombre_contacto}', '{telefono}', '{email}', '{direccion}', '{comuna}', '{region}', '{nombre_fantasia}', '{ejecutiva}', {ariztia}, {lts}, {rendic}, {interpolar}, true)"
            values_list.append(value)
            batch_count += 1
            
            # Print batch when size is reached or at the end
            if batch_count == batch_size or idx == len(rows) - 1:
                print(",\n".join(values_list) + ";")
                values_list = []
                
                if idx < len(rows) - 1:
                    batch_num += 1
                    print(f"\n-- Batch {batch_num}: Subcontratistas")
                    print("INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, comuna, region, nombre_fantasia, ejecutiva, ariztia, lts, rendic, interpolar, is_active) VALUES")
                    batch_count = 0
        
        print(f"\nSELECT COUNT(*) as total FROM subcontratistas;")
        
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
