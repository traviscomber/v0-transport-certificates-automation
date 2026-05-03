-- ============================================================
-- SETUP TRANSPORTES LABBE EXECUTIVES WITH AUTH
-- Loads the 6 executives with authentication credentials
-- ============================================================

-- First, ensure we have the transportista_id for Transportes Labbe
-- Get or create the transportista
INSERT INTO public.transportistas (nombre_empresa, rut_empresa, representante_legal, email_contacto, telefono_contacto)
VALUES (
  'Transportes Labbe',
  '76.123.456-7',
  'Transportes Labbe',
  'info@transporteslabbe.cl',
  '+56977764753'
)
ON CONFLICT (rut_empresa) DO NOTHING;

-- Insert Olga Lydia Carrasco Olivares
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Olga Lydia Carrasco Olivares',
  '10574005-0',
  'Ejecutiva',
  '+56977764753',
  'ocarrasco@labbe.cl',
  'ocarrasco@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;

-- Insert Carolina Pilar Sepulveda Contreras
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Carolina Pilar Sepulveda Contreras',
  '15464094-0',
  'Ejecutiva',
  '+56950067666',
  'csepulveda@labbe.cl',
  'csepulveda@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;

-- Insert Daniela Constanza Silva Rojas
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Daniela Constanza Silva Rojas',
  '17768246-2',
  'Ejecutiva',
  '+56978540722',
  'dsilva@labbe.cl',
  'dsilva@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;

-- Insert Cecilia Del Carmen Farias Muñoz
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Cecilia Del Carmen Farias Muñoz',
  '9888992-2',
  'Ejecutiva',
  '+56978540798',
  'cfarias@labbe.cl',
  'cfarias@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;

-- Insert Diego Andres Gonzalez Valenzuela (Jefe RRHH)
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Diego Andres Gonzalez Valenzuela',
  '20114106-0',
  'Jefe RRHH',
  '+56978455527',
  'dgonzalez@labbe.cl',
  'dgonzalez@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;

-- Insert Katherinne Johanna Canales Hernandez (Asistente RRHH)
INSERT INTO public.executive_staff (
  transportista_id,
  nombre_completo,
  rut,
  cargo,
  telefono,
  email,
  email_auth,
  password_hash,
  login_enabled,
  is_active
)
SELECT
  (SELECT id FROM public.transportistas WHERE rut_empresa = '76.123.456-7'),
  'Katherinne Johanna Canales Hernandez',
  '18717311-6',
  'Asistente RRHH',
  '+56956139744',
  'kcanales@labbe.cl',
  'kcanales@labbe.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LmrJi9gjEBdO',
  false,
  true
ON CONFLICT (rut) DO NOTHING;
