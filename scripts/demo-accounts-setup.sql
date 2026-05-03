-- Delete existing demo accounts (if any)
DELETE FROM public.profiles WHERE email IN ('conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl');
DELETE FROM auth.users WHERE email IN ('conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl');

-- Create demo accounts with bcrypt password hashing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'conductor@demo.cl',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Conductor Demo","role":"driver"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'despachador@demo.cl',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Despachador Demo","role":"dispatcher"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@demo.cl',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin Demo","role":"admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
);

-- Create profiles for demo accounts
INSERT INTO public.profiles (id, email, full_name, role, company_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.raw_user_meta_data->>'role' as role,
  'Demo Company',
  now(),
  now()
FROM auth.users au
WHERE au.email IN ('conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl')
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);
