#!/usr/bin/env python3
import re

# Read the transportistas.txt file
with open('/vercel/share/v0-project/data/transportistas.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Skip header, process all lines
companies = []
seen_ruts = set()

for line in lines[1:]:  # Skip header
    parts = line.strip().split('\t')
    if len(parts) < 10:
        continue
    
    rut = parts[0].strip()
    razon_social = parts[1].strip()
    representante = parts[2].strip() if len(parts) > 2 else ''
    telefono = parts[7].strip() if len(parts) > 7 else ''
    email = parts[8].strip() if len(parts) > 8 else ''
    direccion = parts[5].strip() if len(parts) > 5 else ''
    
    # Skip if no RUT or already seen
    if not rut or rut in seen_ruts:
        continue
    
    seen_ruts.add(rut)
    
    # Escape SQL strings
    razon_social = razon_social.replace("'", "''")
    representante = representante.replace("'", "''")
    telefono = telefono.replace("'", "''")
    email = email.replace("'", "''")
    direccion = direccion.replace("'", "''")
    
    companies.append(f"('{rut}', '{razon_social}', '{representante}', '{telefono}', '{email}', '{direccion}', true)")

# Generate SQL
sql = "-- Delete existing subcontratistas\nDELETE FROM subcontratistas;\n\n"
sql += "-- Insert all companies from transportistas.txt\n"
sql += "INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, telefono, email, direccion, is_active) VALUES\n"
sql += ",\n".join(companies)
sql += ";\n\n"
sql += f"-- Total companies: {len(companies)}\n"
sql += "SELECT COUNT(*) as total_subcontratistas FROM subcontratistas;\n"

# Save to file
with open('/vercel/share/v0-project/scripts/bulk_insert_all_subcontratistas.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Generated SQL with {len(companies)} unique companies")
print("Saved to: /vercel/share/v0-project/scripts/bulk_insert_all_subcontratistas.sql")
