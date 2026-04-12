#!/usr/bin/env python3
import os
import sys
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase = create_client(url, key)

drivers_data = [
    {"rut": "18012757-7", "nombre": "Ruben Marchant Needhan", "rut_proveedor": "77653071-9", "proveedor": "4Vial SPA", "patente_tracto": "XW7026"},
    {"rut": "10907750-K", "nombre": "Adolfo Gonzalez Meza", "rut_proveedor": "76461213-2", "proveedor": "Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.", "patente_tracto": "FWKB83"},
    {"rut": "12879880-3", "nombre": "Juan Manuel Vargas Jerve", "rut_proveedor": "76956797-6", "proveedor": "AEROCAV SPA", "patente_tracto": "RVSD35"},
    {"rut": "16181677-9", "nombre": "Aldo Bustamante Ortega", "rut_proveedor": "16181677-9", "proveedor": "Aldo Antonio Bustamante Ortega", "patente_tracto": "CHTV35"},
    {"rut": "12481902-4", "nombre": "Ambrosio Casanova Naavarrete", "rut_proveedor": "76463195-1", "proveedor": "Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.", "patente_tracto": "HWRC63"},
]

print(f"[v0] Inserting {len(drivers_data)} drivers...")

try:
    response = supabase.table("drivers").insert(drivers_data).execute()
    print(f"[v0] Successfully inserted {len(response.data)} drivers")
    print(f"[v0] Response: {response.data}")
except Exception as e:
    print(f"[v0] Error inserting drivers: {e}")
    sys.exit(1)
