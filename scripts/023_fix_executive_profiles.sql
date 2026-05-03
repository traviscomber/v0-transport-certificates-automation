-- Fix duplicate profiles for the 6 executives by upserting them as admin role
-- This bypasses all the JS logic issues and directly fixes the DB constraint errors

INSERT INTO profiles (id, email, rut, full_name, role, is_active, organization_id, phone)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'olga.carrasco@transporteslabbe.cl', '10574005-0', 'Olga Carrasco', 'admin', true, NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440001', 'carolina.sepulveda@transporteslabbe.cl', '15464094-0', 'Carolina Sepúlveda', 'admin', true, NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'daniela.silva@transporteslabbe.cl', '17768246-2', 'Daniela Silva', 'admin', true, NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'cecilia.farias@transporteslabbe.cl', '9888992-2', 'Cecilia Farias', 'admin', true, NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 'kcanales@labbe.cl', '20114106-0', 'Katherinne Canales', 'admin', true, NULL, NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 'dgonzalez@labbe.cl', '18717311-6', 'Diego Gonzalez', 'admin', true, NULL, NULL)
ON CONFLICT (email) DO UPDATE
SET 
  rut = EXCLUDED.rut,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active
WHERE profiles.rut IS NULL OR profiles.rut != EXCLUDED.rut;
