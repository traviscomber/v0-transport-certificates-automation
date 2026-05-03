#!/usr/bin/env python3
import os
import sys

# Add the project to path for imports
sys.path.insert(0, '/vercel/share/v0-project')

# Parse conductores.txt to extract conductor RUT and Rut_Proveedor
conductores_map = {}  # Maps Rut_Proveedor -> list of conductor RUTs

conductores_file = '/vercel/share/v0-project/data/conductores.txt'
with open(conductores_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Skip header
    for line in lines[1:]:
        parts = line.strip().split('\t')
        if len(parts) >= 4:
            rut_conductor = parts[0]
            rut_proveedor = parts[2]  # Column 3 (0-indexed 2)
            
            if rut_proveedor not in conductores_map:
                conductores_map[rut_proveedor] = []
            conductores_map[rut_proveedor].append(rut_conductor)

print("[v0] Total unique Rut_Proveedor values:", len(conductores_map))
print("\n[v0] Rut_Proveedor mapping:")
for rut_prov, conductores in sorted(conductores_map.items()):
    print(f"  {rut_prov}: {len(conductores)} conductores")

# Save this for reference
with open('/vercel/share/v0-project/scripts/rut_proveedor_mapping.txt', 'w') as f:
    for rut_prov in sorted(conductores_map.keys()):
        f.write(f"{rut_prov}\n")

print("\n[v0] Saved unique Rut_Proveedor values to rut_proveedor_mapping.txt")
print("[v0] Total conductores parsed:", sum(len(v) for v in conductores_map.values()))
