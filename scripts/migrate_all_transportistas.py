import csv

# Read the transportistas.txt file and generate SQL INSERT statement
with open('/vercel/share/v0-project/data/transportistas.txt', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    companies = []
    for row in reader:
        # Parse each row
        rut = row.get('Rut_Proveedor', '').strip()
        razon_social = row.get('Proveedor', '').strip()
        representante = row.get('Representante Legal', '').strip()
        ejecutiva = row.get('Ejecutiva', '').strip()
        direccion = row.get('Direccion', '').strip()
        comuna = row.get('Comuna', '').strip()
        telefono = row.get('Telefono', '').strip()
        email = row.get('Correo', '').strip()
        
        # Parse tags - check if they contain the tag name
        ariztia = 'Ariztía' in row.get('Etiquetas', '') if 'Etiquetas' in row else False
        lts = 'LTS' in row.get('Etiquetas', '') if 'Etiquetas' in row else False
        rendic = 'Rendic' in row.get('Etiquetas', '') if 'Etiquetas' in row else False
        interpolar = 'Interpolar' in row.get('Etiquetas', '') if 'Etiquetas' in row else False
        
        # Escape single quotes for SQL
        razon_social = razon_social.replace("'", "''")
        representante = representante.replace("'", "''")
        ejecutiva = ejecutiva.replace("'", "''")
        direccion = direccion.replace("'", "''")
        comuna = comuna.replace("'", "''")
        email = email.replace("'", "''")
        
        if rut and razon_social:  # Only add if RUT and company name exist
            companies.append({
                'rut': rut,
                'razon_social': razon_social,
                'nombre_contacto': representante,
                'ejecutiva': ejecutiva,
                'direccion': direccion,
                'comuna': comuna,
                'telefono': telefono,
                'email': email,
                'ariztia': ariztia,
                'lts': lts,
                'rendic': rendic,
                'interpolar': interpolar,
            })
    
    # Generate SQL INSERT statement
    print("-- Insert all transportistas into subcontratistas table")
    print("INSERT INTO subcontratistas (rut, razon_social, nombre_contacto, ejecutiva, direccion, comuna, telefono, email, ariztia, lts, rendic, interpolar, is_active)")
    print("VALUES")
    
    for i, company in enumerate(companies):
        values = (
            f"'{company['rut']}'",
            f"'{company['razon_social']}'",
            f"'{company['nombre_contacto']}'",
            f"'{company['ejecutiva']}'",
            f"'{company['direccion']}'",
            f"'{company['comuna']}'",
            f"'{company['telefono']}'",
            f"'{company['email']}'",
            f"{'true' if company['ariztia'] else 'false'}",
            f"{'true' if company['lts'] else 'false'}",
            f"{'true' if company['rendic'] else 'false'}",
            f"{'true' if company['interpolar'] else 'false'}",
            "true"
        )
        
        line = f"({', '.join(values)})"
        if i < len(companies) - 1:
            line += ","
        else:
            line += ";"
        
        print(line)
    
    print(f"\n-- Total companies: {len(companies)}")
