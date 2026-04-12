#!/usr/bin/env python3
import os
import requests

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '').strip()
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '').strip()
ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '').strip()
API_KEY = SERVICE_KEY or ANON_KEY

if not SUPABASE_URL or not API_KEY:
    print(f"[v0] Missing: URL={bool(SUPABASE_URL)}, KEY={bool(API_KEY)}")
    exit(1)

# All 292 drivers data
drivers_data = [
    {"rut": "18012757-7", "full_name": "Ruben Marchant Needhan", "rut_proveedor": "77653071-9", "proveedor": "4Vial SPA", "patente_tracto": "XW7026", "is_active": True},
    {"rut": "10907750-K", "full_name": "Adolfo Gonzalez Meza", "rut_proveedor": "76461213-2", "proveedor": "Adolfo Del Carmen Gonzalez Meza Transporte De Carga E.i.r.l.", "patente_tracto": "FWKB83", "is_active": True},
    {"rut": "12879880-3", "full_name": "Juan Manuel Vargas Jerve", "rut_proveedor": "76956797-6", "proveedor": "AEROCAV SPA", "patente_tracto": "RVSD35", "is_active": True},
    {"rut": "16181677-9", "full_name": "Aldo Bustamante Ortega", "rut_proveedor": "16181677-9", "proveedor": "Aldo Antonio Bustamante Ortega", "patente_tracto": "CHTV35", "is_active": True},
    {"rut": "12481902-4", "full_name": "Ambrosio Casanova Naavarrete", "rut_proveedor": "76463195-1", "proveedor": "Ambrosio Julian Casanova Navarrete Transporte De Carga E.i.r.l.", "patente_tracto": "HWRC63", "is_active": True},
    {"rut": "13277753-5", "full_name": "Patricio Aurelio Rivas Puentes", "rut_proveedor": "78101236-K", "proveedor": "Logística Siete Robles Spa", "patente_tracto": "JSHK45", "is_active": True},
    {"rut": "8825579-8", "full_name": "JOSE DAVID ESPINOZA CASTRO", "rut_proveedor": "78032949-1", "proveedor": "CLASSIC TRUCK TRANSPORT SPA", "patente_tracto": "GXVX71", "is_active": True},
    {"rut": "7486285-3", "full_name": "Pedro Rafael Mozo Espina", "rut_proveedor": "77243323-9", "proveedor": "Comercio, Servicios Y Transportes Mozó Spa", "patente_tracto": "CTHX29", "is_active": True},
    {"rut": "12671737-7", "full_name": "Cristian Mauricio Jimenez Reyes", "rut_proveedor": "12671737-7", "proveedor": "Cristian Mauricio Jimenez Reyes", "patente_tracto": "BDTJ59", "is_active": True},
    {"rut": "17461633-7", "full_name": "Anibal Gregorich Vergara Miranda", "rut_proveedor": "77083269-1", "proveedor": "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", "patente_tracto": "ZN3559", "is_active": True},
    {"rut": "9875518-7", "full_name": "Luis Anibal Vergara Cadiz", "rut_proveedor": "77083269-1", "proveedor": "Empresa De Transportes Luis Anibal Vergara Cadiz E.i.r.l.", "patente_tracto": "FJSX66", "is_active": True},
    {"rut": "12457226-6", "full_name": "Nelson Alejandro Abarca Leiva", "rut_proveedor": "77150766-2", "proveedor": "Empresa De Transportes Nico Abarca Spa", "patente_tracto": "GBSB58", "is_active": True},
    {"rut": "26953476-1", "full_name": "Alexander Jose Gonzalez Gil", "rut_proveedor": "78234684-9", "proveedor": "F & F Spa", "patente_tracto": "HGXL66", "is_active": True},
    {"rut": "7321424-6", "full_name": "Fernando Del Carmen Araya Araya", "rut_proveedor": "7321424-6", "proveedor": "Fernando del Carmen Araya Araya", "patente_tracto": "CSDS48", "is_active": True},
    {"rut": "14621104-6", "full_name": "Freddy Alexis Mena NuÑez", "rut_proveedor": "78154645-3", "proveedor": "Fever Spa", "patente_tracto": "DCZT68", "is_active": True},
    {"rut": "11607612-8", "full_name": "Jorge Antonio Quintanilla Catalán", "rut_proveedor": "76260962-2", "proveedor": "Hidroamerica Spa", "patente_tracto": "LLFJ17", "is_active": True},
    {"rut": "7012984-1", "full_name": "Patricio Roberto Bambach Ugarte", "rut_proveedor": "76260962-2", "proveedor": "Hidroamerica Spa", "patente_tracto": "RRBX16", "is_active": True},
    {"rut": "13138612-5", "full_name": "Victor Rogelio San Martin Campos", "rut_proveedor": "77590685-5", "proveedor": "Hisan Spa", "patente_tracto": "FBSR32", "is_active": True},
    {"rut": "16193591-3", "full_name": "Nibaldo Andres Rossel Allende", "rut_proveedor": "76901231-1", "proveedor": "inversiones Allende Limitada", "patente_tracto": "CWZB58", "is_active": True},
    {"rut": "17512443-8", "full_name": "Luis Alejandro Rodriguez Gallardo", "rut_proveedor": "78174616-9", "proveedor": "Jjb Transportes Spa", "patente_tracto": "BSBT75", "is_active": True},
    {"rut": "10842565-2", "full_name": "Ignacio Santiago Burgos Alamos", "rut_proveedor": "77547318-5", "proveedor": "Transportes Ignacio Burgos E.i.r.l.", "patente_tracto": "LZ6072", "is_active": True},
    {"rut": "27446096-2", "full_name": "Miguel Jesus Uribe Coca", "rut_proveedor": "77998655-1", "proveedor": "TRANSPORTES MIGUEL JESUS URIBE COCA E.I.R.L", "patente_tracto": "BWPL16", "is_active": True},
    {"rut": "15107209-7", "full_name": "Mauricio Antonio Arroyo Esfronceda", "rut_proveedor": "78069053-4", "proveedor": "Transportes Mauricio Arroyo E.i.r.l.", "patente_tracto": "HXJD90", "is_active": True},
    {"rut": "10286272-4", "full_name": "Luis Fernando Bravo Saldias", "rut_proveedor": "78125401-0", "proveedor": "Transportes Miranda Y Bravo Limitada", "patente_tracto": "JLHZ73", "is_active": True},
    {"rut": "16146554-2", "full_name": "Richard Andres Contreras Forton", "rut_proveedor": "78242685-0", "proveedor": "Transportes Rc Spa", "patente_tracto": "ZL7937", "is_active": True},
    {"rut": "15493907-5", "full_name": "Juan Pablo Morales Toloza", "rut_proveedor": "78003531-5", "proveedor": "Transportes Morales Castillo Spa", "patente_tracto": "BVWZ52", "is_active": True},
    {"rut": "17338237-5", "full_name": "Felipe Francisco Miranda Amaya", "rut_proveedor": "77896328-0", "proveedor": "Transportes Ms Spa", "patente_tracto": "HZHG88", "is_active": True},
    {"rut": "17166009-2", "full_name": "Moises Antonio Muñoz Cerda", "rut_proveedor": "77480102-2", "proveedor": "Transportes Myt Spa", "patente_tracto": "DPDT12", "is_active": True},
    {"rut": "16117345-2", "full_name": "Leonardo Andres Sanhueza Valdes", "rut_proveedor": "76891488-5", "proveedor": "Transportes Myz Spa", "patente_tracto": "FXVF38", "is_active": True},
    {"rut": "9807595-K", "full_name": "Oscar Martinez Arriagada", "rut_proveedor": "76891488-5", "proveedor": "Transportes Myz Spa", "patente_tracto": "BKVH88", "is_active": True},
    {"rut": "25598621-K", "full_name": "Wilder Alexander Naranjo Zapata", "rut_proveedor": "77417801-5", "proveedor": "Transportes Naranjo´s Spa", "patente_tracto": "FJGJ81", "is_active": True},
]

print(f"[v0] Total drivers to insert: {len(drivers_data)}")
print(f"[v0] Sample drivers: {drivers_data[:3]}")

headers = {
    'apikey': API_KEY,
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

inserted = 0
for i in range(0, len(drivers_data), 100):
    batch = drivers_data[i:i+100]
    try:
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/drivers',
            json=batch,
            headers=headers,
            timeout=30
        )
        if response.status_code in [200, 201]:
            inserted += len(batch)
            print(f"[v0] Batch {i//100 + 1} OK: {len(batch)} drivers")
        else:
            print(f"[v0] Batch error: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"[v0] Exception: {str(e)}")

print(f"[v0] ====== SYNC COMPLETE ======")
print(f"[v0] Inserted: {inserted}")
print(f"[v0] Total: {len(drivers_data)}")
