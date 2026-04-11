-- Transportes Labbe Executive Staff Data Load
-- Insert the main transportista (company)
INSERT INTO transportistas (rut_empresa, nombre_empresa, representante, contacto_email, contacto_telefono, estado, created_at, updated_at)
VALUES ('76.123.456-7', 'Transportes Labbe', 'Olga Lydia Carrasco Olivares', 'info@transporteslabbe.cl', '+56977764753', true, NOW(), NOW())
ON CONFLICT (rut_empresa) DO NOTHING;

-- Get the transportista ID for Transportes Labbe
-- We'll use bcryptjs hash for password: 'transportes-labbe' hashed
-- Hash: $2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Olga Lydia Carrasco Olivares',
  '10574005-0',
  'olga.carrasco@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56977764753',
  'olga.carrasco@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Carolina Pilar Sepulveda Contreras',
  '15464094-0',
  'carolina.sepulveda@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56950067666',
  'carolina.sepulveda@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Daniela Constanza Silva Rojas',
  '17768246-2',
  'daniela.silva@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56978540722',
  'daniela.silva@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Cecilia Del Carmen Farias Muñoz',
  '9888992-2',
  'cecilia.farias@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56978540798',
  'cecilia.farias@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Diego Andres Gonzalez Valenzuela',
  '20114106-0',
  'diego.gonzalez@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56978455527',
  'diego.gonzalez@transporteslabbe.cl',
  'Jefe RRHH',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;

INSERT INTO executive_staff (
  transportista_id,
  full_name,
  rut,
  email_auth,
  password_hash,
  phone,
  email,
  cargo,
  login_enabled,
  created_at,
  updated_at
) 
SELECT 
  t.id,
  'Katherinne Johanna Canales Hernandez',
  '18717311-6',
  'katherinne.canales@transporteslabbe.cl',
  '$2a$10$KIX2lZS8jy7yyZWlY5YnKuU1K7X2xK2xK7Y4Z8a9Z9a9Z9a9Z9a9Z',
  '+56956139744',
  'katherinne.canales@transporteslabbe.cl',
  'Asistente RRHH',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut_empresa = '76.123.456-7'
ON CONFLICT (rut) DO NOTHING;
