-- Setup Demo Users Profiles
-- This script creates/updates demo user profiles in the profiles table
-- Safe to run multiple times (uses ON CONFLICT DO UPDATE)

-- Demo User IDs (deterministic UUIDs)
-- conductor@demo.cl: 11111111-1111-1111-1111-111111111111
-- despachador@demo.cl: 22222222-2222-2222-2222-222222222222  
-- admin@demo.cl: 33333333-3333-3333-3333-333333333333

INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  role, 
  company_name, 
  rut, 
  phone, 
  address, 
  city, 
  region,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Driver profile
(
  '11111111-1111-1111-1111-111111111111',
  'conductor@demo.cl',
  'Juan Carlos Pérez',
  'driver',
  'Transportes Demo Ltda.',
  '12.345.678-9',
  '+56 9 8765 4321',
  'Av. Los Transportistas 123',
  'Santiago',
  'Metropolitana',
  true,
  NOW(),
  NOW()
),
-- Dispatcher profile  
(
  '22222222-2222-2222-2222-222222222222',
  'despachador@demo.cl',
  'María Elena González',
  'dispatcher', 
  'Central de Despacho Demo',
  '98.765.432-1',
  '+56 9 1234 5678',
  'Av. Logística 456',
  'Valparaíso',
  'Valparaíso',
  true,
  NOW(),
  NOW()
),
-- Admin profile
(
  '33333333-3333-3333-3333-333333333333',
  'admin@demo.cl',
  'Roberto Silva',
  'admin',
  'Sistema Central Demo',
  '11.222.333-4',
  '+56 9 9999 0000',
  'Av. Administración 789',
  'Santiago',
  'Metropolitana', 
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name,
  rut = EXCLUDED.rut,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  region = EXCLUDED.region,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the profiles were created/updated
SELECT id, email, full_name, role, company_name, is_active FROM profiles 
WHERE email IN ('conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl')
ORDER BY email;
