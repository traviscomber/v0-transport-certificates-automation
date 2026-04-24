-- Insert profiles for existing auth users
-- This script assumes the auth users have been created already with specific emails

-- First, get the organization ID
WITH org AS (
  SELECT id FROM organizations WHERE name = 'Transportes Labbe' LIMIT 1
)

-- Insert profiles using auth user IDs that match the emails
INSERT INTO profiles (id, email, full_name, rut, phone, role, is_active, organization_id, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'rut' as rut,
  u.raw_user_meta_data->>'phone' as phone,
  'admin' as role,
  true as is_active,
  org.id as organization_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u, org
WHERE u.email IN (
  'olga.carrasco@transporteslabbe.cl',
  'carolina.sepulveda@transporteslabbe.cl',
  'daniela.silva@transporteslabbe.cl',
  'cecilia.farias@transporteslabbe.cl',
  'diego.gonzalez@transporteslabbe.cl',
  'katherinne.canales@transporteslabbe.cl'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = u.id
)
ON CONFLICT (id) DO NOTHING;
