-- Insert profiles for existing auth users
-- This script creates profiles linked to existing auth.users records
-- The profiles will be linked to the Transportes Labbe organization

INSERT INTO profiles (id, email, full_name, rut, phone, role, is_active, organization_id, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
  u.raw_user_meta_data->>'rut' as rut,
  u.raw_user_meta_data->>'phone' as phone,
  'admin' as role,
  true as is_active,
  (SELECT id FROM organizations WHERE name = 'Transportes Labbe' LIMIT 1) as organization_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email IN (
  'olga.carrasco@transporteslabbe.cl',
  'carolina.sepulveda@transporteslabbe.cl',
  'daniela.silva@transporteslabbe.cl',
  'cecilia.farias@transporteslabbe.cl',
  'diego.gonzalez@transporteslabbe.cl',
  'katherinne.canales@transporteslabbe.cl'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
