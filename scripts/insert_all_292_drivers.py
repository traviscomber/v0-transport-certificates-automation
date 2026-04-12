#!/usr/bin/env python3
import os
import requests

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '').strip()
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '').strip()
ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '').strip()

# Get organization ID (from environment or use the first one)
ORG_ID = '78363955-3db3-4aaf-8c33-d8f8c7e23e7f'  # LABBE TRANSPORTES

if not SUPABASE_URL or not (SERVICE_KEY or ANON_KEY):
    print(f"[v0] Missing credentials: URL={bool(SUPABASE_URL)}, SERVICE={bool(SERVICE_KEY)}, ANON={bool(ANON_KEY)}")
    exit(1)

API_KEY = SERVICE_KEY or ANON_KEY
print(f"[v0] Using {'SERVICE' if SERVICE_KEY else 'ANON'} key")
print(f"[v0] Supabase URL: {SUPABASE_URL}")

# Read all 292 drivers from file
drivers_list = []
try:
    with open('/vercel/share/v0-project/scripts/all_292_drivers.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines[1:], start=2):  # Skip header
            line = line.strip()
            if not line:
                continue
            parts = [p.strip() for p in line.split('\t')]
            if len(parts) >= 5:
                driver = {
                    'rut': parts[0],
                    'full_name': parts[1],
                    'rut_proveedor': parts[2],
                    'proveedor': parts[3],
                    'patente_tracto': parts[4],
                    'organization_id': ORG_ID,
                    'is_active': True
                }
                drivers_list.append(driver)
                if i % 50 == 0:
                    print(f"[v0] Read {i} drivers...")
except Exception as e:
    print(f"[v0] Error reading file: {e}")
    exit(1)

print(f"[v0] Total drivers to insert: {len(drivers_list)}")

# Headers for Supabase REST API
headers = {
    'apikey': API_KEY,
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'  # Don't return rows to save bandwidth
}

# Insert in batches
batch_size = 100
inserted = 0
errors = 0

for i in range(0, len(drivers_list), batch_size):
    batch = drivers_list[i:i+batch_size]
    batch_num = i // batch_size + 1
    
    print(f"\n[v0] Inserting batch {batch_num} ({len(batch)} drivers)...")
    
    try:
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/drivers',
            json=batch,
            headers=headers,
            timeout=60
        )
        
        if response.status_code in [200, 201]:
            inserted += len(batch)
            print(f"[v0] ✓ Batch {batch_num} inserted ({inserted} total)")
        elif response.status_code == 409:
            # Conflict - some drivers may already exist
            print(f"[v0] ⚠ Batch {batch_num}: Some drivers may already exist")
            inserted += len(batch)
        else:
            print(f"[v0] ✗ Batch {batch_num} error: {response.status_code}")
            print(f"[v0] Response: {response.text[:300]}")
            errors += 1
            
    except requests.exceptions.Timeout:
        print(f"[v0] ✗ Batch {batch_num} timeout")
        errors += 1
    except Exception as e:
        print(f"[v0] ✗ Batch {batch_num} exception: {e}")
        errors += 1

print(f"\n[v0] ====== SYNC COMPLETE ======")
print(f"[v0] Inserted: ~{inserted}")
print(f"[v0] Errors: {errors}")
print(f"[v0] Total expected: {len(drivers_list)}")
