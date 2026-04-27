#!/usr/bin/env python3

import re

# Read conductores.txt
with open('/vercel/share/v0-project/data/conductores.txt', 'r') as f:
    lines = f.readlines()

# Parse the file - skip header row
conductores = []
provider_ruts = set()

for line in lines[1:]:  # Skip header
    if not line.strip():
        continue
    
    parts = line.strip().split('\t')
    if len(parts) < 5:
        continue
    
    rut_conductor = parts[0]
    conductor_name = parts[1]
    rut_proveedor = parts[2]
    proveedor = parts[3]
    patente = parts[4] if len(parts) > 4 else ''
    
    # Extract first name and last name
    name_parts = conductor_name.split()
    if len(name_parts) >= 2:
        nombres = ' '.join(name_parts[:-1])
        apellido_paterno = name_parts[-1]
    else:
        nombres = conductor_name
        apellido_paterno = ''
    
    conductores.append({
        'rut': rut_conductor,
        'nombres': nombres,
        'apellido_paterno': apellido_paterno,
        'rut_proveedor': rut_proveedor,
        'proveedor': proveedor,
        'numero_licencia': patente
    })
    
    provider_ruts.add(rut_proveedor)

print(f"[v0] Total conductores parsed: {len(conductores)}")
print(f"[v0] Unique provider RUTs: {len(provider_ruts)}")
print(f"[v0] Provider RUTs found:")
for rut in sorted(provider_ruts):
    print(f"     {rut}")

# Create mapping of unique provider RUTs to examples
provider_examples = {}
for c in conductores:
    if c['rut_proveedor'] not in provider_examples:
        provider_examples[c['rut_proveedor']] = c['proveedor']

print(f"\n[v0] Provider RUT to Name mapping:")
for rut, name in sorted(provider_examples.items()):
    print(f"     {rut} -> {name}")

# Generate SQL
sql_delete = "DELETE FROM conductores;\n\n"

sql_insert_lines = []
sql_insert_lines.append("-- Inserting all conductores with correct transportista mapping")
sql_insert_lines.append("INSERT INTO conductores (rut, nombres, apellido_paterno, numero_licencia, clase_licencia, vencimiento_licencia, transportista_id, is_active)")
sql_insert_lines.append("SELECT c.rut, c.nombres, c.apellido_paterno, c.numero_licencia, 'A-4', '2025-12-31', t.id, true")
sql_insert_lines.append("FROM (VALUES")

values = []
for i, c in enumerate(conductores):
    rut = c['rut'].replace("'", "''")
    nombres = c['nombres'].replace("'", "''")
    apellido = c['apellido_paterno'].replace("'", "''")
    patente = c['numero_licencia'].replace("'", "''")
    rut_prov = c['rut_proveedor'].replace("'", "''")
    
    values.append(f"    ('{rut}', '{nombres}', '{apellido}', '{patente}', '{rut_prov}')")

values_str = ",\n".join(values)
sql_insert_lines.append(values_str)
sql_insert_lines.append(") AS c(rut, nombres, apellido_paterno, numero_licencia, rut_proveedor)")
sql_insert_lines.append("JOIN transportistas t ON t.rut = c.rut_proveedor;")

sql_insert = "\n".join(sql_insert_lines)

# Verify query
sql_verify = "\nSELECT t.rut, t.razon_social, COUNT(c.id) as conductor_count\nFROM conductores c\nLEFT JOIN transportistas t ON c.transportista_id = t.id\nGROUP BY t.id, t.rut, t.razon_social\nORDER BY conductor_count DESC;"

full_sql = sql_delete + sql_insert + sql_verify

# Write to file
with open('/vercel/share/v0-project/scripts/fix_conductores_final.sql', 'w') as f:
    f.write(full_sql)

print(f"\n[v0] SQL script generated: /vercel/share/v0-project/scripts/fix_conductores_final.sql")
print(f"[v0] Script contains {len(conductores)} INSERT statements")
