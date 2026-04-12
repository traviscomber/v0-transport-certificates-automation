#!/usr/bin/env python3
import os
from supabase import create_client, Client

# Initialize Supabase
url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase: Client = create_client(url, key)

def parse_tsv(filename):
    """Parse TSV file and return list of dictionaries"""
    data = []
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        if not lines:
            return data
        
        # Parse header
        headers = lines[0].strip().split('\t')
        
        # Parse rows
        for line in lines[1:]:
            if line.strip():
                values = line.strip().split('\t')
                row = {}
                for i, header in enumerate(headers):
                    row[header] = values[i] if i < len(values) else ''
                data.append(row)
    
    return data

def populate_transportistas():
    """Insert transportistas data"""
    data = parse_tsv('/vercel/share/v0-project/data/transportistas.txt')
    
    print(f"[v0] Loading {len(data)} transportistas...")
    
    batch_size = 100
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        
        records = []
        for row in batch:
            records.append({
                'rut': row['Rut_Proveedor'],
                'razon_social': row['Proveedor'],
                'representante_legal': row['Representante Legal'],
                'telefono': row['Telefono'],
                'email': row['Correo'],
                'direccion': row['Direccion'],
                'comuna': row['Comuna'],
            })
        
        response = supabase.table('transportistas').insert(records).execute()
        print(f"[v0] Inserted batch {i // batch_size + 1}: {len(response.data)} records")

def populate_conductores():
    """Insert conductores data"""
    data = parse_tsv('/vercel/share/v0-project/data/conductores.txt')
    
    print(f"[v0] Loading {len(data)} conductores...")
    
    batch_size = 100
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        
        records = []
        for row in batch:
            # Parse the name
            nombres = row['Conductor'].split()
            first_name = nombres[0] if len(nombres) > 0 else ''
            last_name = nombres[-1] if len(nombres) > 1 else ''
            
            # Get transportista_id by RUT
            transportista = supabase.table('transportistas').select('id').eq('rut', row['Rut_Proveedor']).execute()
            transportista_id = transportista.data[0]['id'] if transportista.data else None
            
            records.append({
                'transportista_id': transportista_id,
                'rut': row['Rut_Conductor'],
                'nombres': first_name,
                'apellido_paterno': last_name,
                'telefono': row.get('Telefono', ''),
                'email': row.get('Email', ''),
            })
        
        response = supabase.table('conductores').insert(records).execute()
        print(f"[v0] Inserted batch {i // batch_size + 1}: {len(response.data)} records")

if __name__ == '__main__':
    try:
        populate_transportistas()
        populate_conductores()
        print("[v0] Data population completed successfully!")
    except Exception as e:
        print(f"[v0] Error: {str(e)}")
