#!/usr/bin/env python3
"""
Script to fix conductor transportista assignments by matching RUT_Proveedor
"""

import csv
import re

# Read conductores.txt to get conductor RUT to provider RUT mapping
conductor_to_provider = {}

with open('/vercel/share/v0-project/data/conductores.txt', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # Skip header
    for row in reader:
        if len(row) >= 4:
            conductor_rut = row[0].strip()
            provider_rut = row[3].strip().lower()  # Normalize to lowercase
            conductor_to_provider[conductor_rut] = provider_rut

print(f"Found {len(conductor_to_provider)} conductor-to-provider mappings")
print("\nSample mappings:")
for i, (c_rut, p_rut) in enumerate(list(conductor_to_provider.items())[:5]):
    print(f"  {c_rut} -> {p_rut}")

# Create mapping from provider RUT to transportista info
# Based on the database query results, we have these transportistas:
transportista_mapping = {
    '77653071-9': 'a519ec4f-db0e-4f15-b07f-d63d44ba8758',  # 4Vial SPA
    '76461213-2': '59f904ea-ada3-4520-969a-84e7637c4fe5',  # Adolfo Gonzalez
    '76956797-6': '3106301d-08ff-4e38-bf6c-2022565daf93',  # AEROCAV SPA
    '16181677-9': '9307bfc5-26fa-4355-9d2b-1bde5ddcb7ec',  # Aldo Bustamante
    '76463195-1': '3ad7d6e8-2196-4b5d-9403-3280a7671f58',  # Ambrosio Casanova
}

# Generate SQL UPDATE statements
print("\nGenerate SQL UPDATE statements:")
print("=" * 80)

# Group conductores by provider RUT for batch updates
provider_to_conductors = {}
for conductor_rut, provider_rut in conductor_to_provider.items():
    if provider_rut not in provider_to_conductors:
        provider_to_conductors[provider_rut] = []
    provider_to_conductors[provider_rut].append(conductor_rut)

print(f"\nFound {len(provider_to_conductors)} unique provider RUTs")

# Count how many can be matched
matched_count = 0
unmatched_providers = set()

for provider_rut, conductor_ruts in sorted(provider_to_conductors.items()):
    if provider_rut in transportista_mapping:
        matched_count += len(conductor_ruts)
    else:
        unmatched_providers.add(provider_rut)

print(f"Matched conductores: {matched_count}")
print(f"Unmatched provider RUTs: {len(unmatched_providers)}")
if unmatched_providers:
    print("\nUnmatched provider RUTs (first 10):")
    for i, p_rut in enumerate(sorted(list(unmatched_providers))[:10]):
        conductors = provider_to_conductors[p_rut]
        print(f"  {p_rut}: {len(conductors)} conductores")
        print(f"    Example: {conductors[0]}")
