#!/usr/bin/env python3
"""
Script to import conductores (drivers) data from CSV format
and generate SQL INSERT statements for batch import
"""

import csv
import sys
from datetime import datetime
import hashlib

def sanitize_text(text):
    """Escape SQL special characters"""
    if not text:
        return None
    return text.replace("'", "''").replace("\\", "\\\\")

def parse_rut(rut_str):
    """Parse RUT format: XXXXXXXX-X"""
    if not rut_str or rut_str.strip() == '':
        return None
    return rut_str.strip()

def generate_sql_inserts(data_rows):
    """Generate SQL INSERT statements from driver data"""
    
    insert_statements = []
    batch_size = 20
    
    # Group into batches
    for i in range(0, len(data_rows), batch_size):
        batch = data_rows[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        values = []
        for row in batch:
            rut_conductor = parse_rut(row['Rut_Conductor'])
            rut_proveedor = parse_rut(row['Rut_Proveedor'])
            conductor_name = sanitize_text(row['Conductor'])
            
            if not rut_conductor or not conductor_name:
                continue
            
            # Split name into first and last names
            name_parts = conductor_name.split()
            if len(name_parts) >= 2:
                nombres = ' '.join(name_parts[:-1])
                apellido_paterno = name_parts[-1]
            else:
                nombres = conductor_name
                apellido_paterno = ""
            
            nombres = sanitize_text(nombres)
            apellido_paterno = sanitize_text(apellido_paterno)
            
            value_str = f"('{rut_conductor}', '{rut_proveedor}', '{nombres}', '{apellido_paterno}', '{row['Patente Tracto'].strip()}')"
            values.append(value_str)
        
        if values:
            sql = f"""-- Batch {batch_num} of conductores import ({len(values)} records)
INSERT INTO public.conductores_import_staging (rut, rut_proveedor, nombres, apellido_paterno, patente)
VALUES
{',\n'.join(values)}
ON CONFLICT (rut) DO NOTHING;
"""
            insert_statements.append(sql)
    
    return insert_statements

def main():
    # Read from stdin or file
    csv_data = """Rut_Conductor\tConductor\tRut_Proveedor\tProveedor\tPatente Tracto
18012757-7\tRuben Marchant Needhan\t77653071-9\t4Vial SPA\tXW7026
10907750-K\tAdolfo Gonzalez Meza\t76461213-2\tAdolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.\tFWKB83
12879880-3\tJuan Manuel Vargas Jerve\t76956797-6\tAEROCAV SPA\tRVSD35
16181677-9\tAldo Bustamante Ortega\t16181677-9\tAldo Antonio Bustamante Ortega\tCHTV35
12481902-4\tAmbrosio Casanova Naavarrete\t76463195-1\tAmbrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.\tHWRC63
13277753-5\tPatricio Aurelio Rivas Puentes\t78101236-K\tLogÍstica Siete Robles Spa\tJSHK45
8825579-8\tJOSE DAVID ESPINOZA CASTRO\t78032949-1\tCLASSIC TRUCK TRANSPORT SPA\tGXVX71
7486285-3\tPedro  Rafael Mozo  Espina\t77243323-9\tComercio, Servicios Y Transportes Mozó Spa\tCTHX29
12671737-7\tCristian Mauricio Jimenez Reyes\t12671737-7\tCristian Mauricio Jimenez Reyes\tBDTJ59
17461633-7\tAnibal Gregorich Vergara Miranda\t77083269-1\tEmpresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.\tZN3559
9875518-7\tLuis Anibal Vergara Cadiz\t77083269-1\tEmpresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.\tFJSX66
12457226-6\tNelson Alejandro Abarca Leiva\t77150766-2\tEmpresa De Transportes Nico Abarca Spa\tGBSB58
26953476-1\tAlexander Jose Gonzalez Gil\t78234684-9\tF & F Spa\tHGXL66
7321424-6\tFernando Del Carmen Araya Araya\t7321424-6\tFernando del Carmen Araya Araya\tCSD48
14621104-6\tFreddy Alexis Mena  NuÑez\t78154645-3\tFever Spa\tDCZT68
11607612-8\tJorge Antonio Quintanilla CatalÁn\t76260962-2\tHidroamerica Spa\tLLFJ17
7012984-1\tPatricio Roberto Bambach Ugarte\t76260962-2\tHidroamerica Spa\tRRBX16
13138612-5\tVictor Rogelio San Martin Campos\t77590685-5\tHisan Spa\tFBSR32
16193591-3\tNibaldo Andres Rossel Allende\t76901231-1\tinversiones  Allende Limitada\tCWZB58
17512443-8\tLuis Alejandro Rodriguez Gallardo\t78174616-9\tJjb Transportes Spa\tBSBT75"""
    
    # Parse CSV data
    lines = csv_data.strip().split('\n')
    reader = csv.DictReader(lines, delimiter='\t')
    
    data_rows = list(reader)
    print(f"Found {len(data_rows)} conductor records", file=sys.stderr)
    
    # Generate SQL
    sql_statements = generate_sql_inserts(data_rows)
    
    for stmt in sql_statements:
        print(stmt)

if __name__ == "__main__":
    main()
