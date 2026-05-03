#!/usr/bin/env python3

import os
import json
import re
from supabase import create_client, Client

# Get environment variables
supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_role_key:
    print('[v0] ERROR: Missing environment variables')
    exit(1)

supabase: Client = create_client(supabase_url, service_role_key)

# Read the TypeScript file and extract the data
with open('/vercel/share/v0-project/lib/data/all-subcontractors.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JSON-like data between the brackets
start = content.find('[')
end = content.rfind(']') + 1
data_str = content[start:end]

# Replace TypeScript booleans with JSON booleans
data_str = data_str.replace(': true', ': true').replace(': false', ': false')

# Clean up the string to make it valid JSON
# Remove trailing commas before closing brackets
data_str = re.sub(r',(\s*[}\]])', r'\1', data_str)

try:
    data = json.loads(data_str)
    print(f'[v0] Loaded {len(data)} subcontractors from file')
except json.JSONDecodeError as e:
    print(f'[v0] ERROR parsing JSON: {e}')
    # Try a more manual approach
    print('[v0] Using regex extraction instead...')
    
    # Find all objects in the array
    objects = re.findall(r'\{[^{}]*\}', data_str)
    print(f'[v0] Found {len(objects)} objects')
    exit(1)

# Transform data for Supabase (only use columns that exist)
print('[v0] Transforming data...')
transportistas = []
for item in data:
    transportistas.append({
        'rut': item.get('rut', ''),
        'razon_social': item.get('razon_social') or item.get('nombre', ''),
        'nombre_fantasia': item.get('nombre_fantasia', ''),
        'direccion': item.get('direccion', ''),
        'comuna': item.get('comuna', ''),
        'region': item.get('region', ''),
        'email': item.get('email', ''),
        'is_active': item.get('is_active', True),
    })

print(f'[v0] Transformed {len(transportistas)} records')

# Delete existing records
print('[v0] Deleting existing transportistas...')
try:
    result = supabase.table('transportistas').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print(f'[v0] Deleted existing records')
except Exception as e:
    print(f'[v0] Error deleting: {e}')

# Insert in batches
batch_size = 50
total_inserted = 0

for i in range(0, len(transportistas), batch_size):
    batch = transportistas[i:i+batch_size]
    batch_num = (i // batch_size) + 1
    
    print(f'[v0] Inserting batch {batch_num} ({len(batch)} records)...')
    
    try:
        result = supabase.table('transportistas').insert(batch).execute()
        count = len(result.data) if result.data else 0
        total_inserted += count
        print(f'[v0] Batch {batch_num}: Inserted {count} records (total: {total_inserted})')
    except Exception as e:
        print(f'[v0] ERROR in batch {batch_num}: {str(e)}')

print(f'\n[v0] ✓ SUCCESS: Loaded {total_inserted} subcontractors into Supabase!')
print(f'[v0] Go to /admin/transportistas to see all transportistas')
