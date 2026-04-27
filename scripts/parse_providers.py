#!/usr/bin/env python3
import re

# Read the conductores file
with open('/vercel/share/v0-project/data/conductores.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Parse unique providers
providers = {}

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Split by tab
    parts = line.split('\t')
    if len(parts) >= 4:
        rut_proveedor = parts[2].strip()
        proveedor = parts[3].strip()
        
        # Store unique providers
        if rut_proveedor and proveedor and rut_proveedor not in providers:
            providers[rut_proveedor] = proveedor

# Print results
print(f"Found {len(providers)} unique providers:")
print()

# Generate SQL INSERT statements
print("-- SQL to insert unique providers into subcontratistas")
print("INSERT INTO subcontratistas (rut, razon_social, is_active) VALUES")

insert_values = []
for rut, nombre in sorted(providers.items()):
    # Escape single quotes in names
    nombre_escaped = nombre.replace("'", "''")
    insert_values.append(f"  ('{rut}', '{nombre_escaped}', true)")

print(",\n".join(insert_values))
print("ON CONFLICT (rut) DO UPDATE SET razon_social = EXCLUDED.razon_social, is_active = true;")
print()

# Also output the providers for reference
print("-- Providers found:")
for rut, nombre in sorted(providers.items()):
    print(f"-- {rut}: {nombre}")
