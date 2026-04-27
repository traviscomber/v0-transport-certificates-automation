#!/usr/bin/env python3
"""
Script para cargar todos los datos de CSV 45 (subcontratistas) y CSV 44 (conductores)
a la base de datos Supabase de forma masiva y correctamente mapeada.
"""

import csv
from supabase import create_client
import os

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("[ERROR] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

print("[v0] Iniciando carga de datos...")

# 1. Load CSV 45 - Subcontratistas
print("[v0] Cargando CSV 45 (Subcontratistas)...")
csv45_data = []
with open('user_read_only_context/text_attachments/45-wJS8A.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        csv45_data.append(row)

print(f"[v0] CSV 45 leído: {len(csv45_data)} registros")

# 2. Load CSV 44 - Conductores
print("[v0] Cargando CSV 44 (Conductores)...")
csv44_data = []
with open('user_read_only_context/text_attachments/44-OEuzp.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        csv44_data.append(row)

print(f"[v0] CSV 44 leído: {len(csv44_data)} registros")

# 3. Insert all subcontratistas into database
print("[v0] Insertando subcontratistas...")
for i, row in enumerate(csv45_data):
    try:
        subcontratista = {
            "rut": row.get('Rut_Proveedor', '').strip(),
            "razon_social": row.get('Proveedor', '').strip(),
            "nombre_contacto": row.get('Representante Legal', '').strip(),
            "direccion": row.get('Dirección', '').strip(),
            "comuna": row.get('Comuna', '').strip(),
            "telefono": row.get('Teléfono', '').strip()[:20],  # Limitar a 20 caracteres
            "email": row.get('Correo', '').strip(),
            "ejecutiva": row.get('Ejecutiva', '').strip(),
            "ariztia": row.get('Ariztia', '').lower() == 'si' if row.get('Ariztia') else False,
            "lts": row.get('LTS', '').lower() == 'si' if row.get('LTS') else False,
            "rendic": row.get('Rendic', '').lower() == 'si' if row.get('Rendic') else False,
            "interpolar": row.get('Interpolar', '').lower() == 'si' if row.get('Interpolar') else False,
            "is_active": True
        }
        
        # Upsert to subcontratistas table
        supabase.table('subcontratistas').upsert(subcontratista).execute()
        
        if (i + 1) % 50 == 0:
            print(f"[v0] {i + 1}/{len(csv45_data)} subcontratistas insertadas")
    except Exception as e:
        print(f"[ERROR] Error insertando subcontratista {i}: {str(e)}")

print(f"[v0] ✓ {len(csv45_data)} subcontratistas cargadas")

# 4. Sync all subcontratistas to transportistas table
print("[v0] Sincronizando a transportistas...")
subcontratistas = supabase.table('subcontratistas').select('id, rut, razon_social, nombre_contacto, direccion').execute()
for sub in subcontratistas.data:
    try:
        transportista = {
            "rut": sub['rut'],
            "razon_social": sub['razon_social'],
            "nombre_fantasia": sub['nombre_contacto'],
            "direccion": sub['direccion'],
            "is_active": True
        }
        supabase.table('transportistas').upsert(transportista).execute()
    except Exception as e:
        print(f"[ERROR] Error sincronizando transportista {sub['rut']}: {str(e)}")

print(f"[v0] ✓ Transportistas sincronizadas")

# 5. Create RUT to transportista_id mapping
print("[v0] Creando mapeo de RUT a transportista_id...")
transportistas = supabase.table('transportistas').select('id, rut').execute()
rut_to_id = {t['rut']: t['id'] for t in transportistas.data}
print(f"[v0] Mapeo creado con {len(rut_to_id)} transportistas")

# 6. Insert all conductores
print("[v0] Insertando conductores...")
for i, row in enumerate(csv44_data):
    try:
        rut_proveedor = row.get('Rut_Proveedor', '').strip()
        transportista_id = rut_to_id.get(rut_proveedor)
        
        if not transportista_id:
            print(f"[WARN] Conductor {i}: rut_proveedor '{rut_proveedor}' no encontrado en transportistas")
            continue
        
        # Split nombre into nombres and apellido_paterno
        full_name = row.get('Representante Legal', '').strip()
        parts = full_name.rsplit(' ', 1)
        if len(parts) == 2:
            nombres, apellido_paterno = parts
        else:
            nombres = full_name
            apellido_paterno = ''
        
        conductor = {
            "rut": row.get('Rut R.L.', '').strip(),
            "nombres": nombres.strip(),
            "apellido_paterno": apellido_paterno.strip(),
            "rut_proveedor": rut_proveedor,
            "transportista_id": transportista_id,
            "is_active": True
        }
        
        supabase.table('conductores').upsert(conductor).execute()
        
        if (i + 1) % 50 == 0:
            print(f"[v0] {i + 1}/{len(csv44_data)} conductores insertados")
    except Exception as e:
        print(f"[ERROR] Error insertando conductor {i}: {str(e)}")

print(f"[v0] ✓ {len(csv44_data)} conductores cargados")

# 7. Verify final counts
print("[v0] Verificando conteos finales...")
try:
    sub_count = supabase.table('subcontratistas').select('count', count='exact').execute()
    trans_count = supabase.table('transportistas').select('count', count='exact').execute()
    cond_count = supabase.table('conductores').select('count', count='exact').execute()
    
    print(f"[v0] ✓ Subcontratistas: {sub_count.count}")
    print(f"[v0] ✓ Transportistas: {trans_count.count}")
    print(f"[v0] ✓ Conductores: {cond_count.count}")
except Exception as e:
    print(f"[ERROR] Error verificando conteos: {str(e)}")

print("[v0] ✓ Carga completada!")
