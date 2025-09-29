-- Manual creation of demo users for immediate use
-- This script creates the demo accounts directly in the database

-- First, let's create the demo users in auth.users table
-- Note: In a real Supabase environment, you would use the admin API
-- This is a simplified version for development

-- Create demo UUIDs (deterministic for consistency)
CREATE OR REPLACE FUNCTION demo_uuid(email text) RETURNS uuid AS $$
BEGIN
  -- Generate deterministic UUID based on email for consistency
  RETURN md5(email || 'demo-salt-2024')::uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert demo users into auth.users (if not exists)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at,
  phone_confirmed_at,
  phone_change_token,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES 
-- Conductor Demo
(
  demo_uuid('conductor@demo.cl'),
  '00000000-0000-0000-0000-000000000000',
  'conductor@demo.cl',
  crypt('demo123', gen_salt('bf')), -- Encrypted password
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Carlos Mendoza"}',
  false,
  NOW(),
  NULL,
  '',
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
),
-- Despachador Demo  
(
  demo_uuid('despachador@demo.cl'),
  '00000000-0000-0000-0000-000000000000',
  'despachador@demo.cl',
  crypt('demo123', gen_salt('bf')), -- Encrypted password
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "María González"}',
  false,
  NOW(),
  NULL,
  '',
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
),
-- Admin Demo
(
  demo_uuid('admin@demo.cl'),
  '00000000-0000-0000-0000-000000000000',
  'admin@demo.cl',
  crypt('demo123', gen_salt('bf')), -- Encrypted password
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Roberto Silva"}',
  false,
  NOW(),
  NULL,
  '',
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- Insert profiles for demo users
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  rut,
  phone,
  company_name,
  address,
  city,
  region,
  created_at,
  updated_at
) VALUES 
-- Conductor Profile
(
  demo_uuid('conductor@demo.cl'),
  'conductor@demo.cl',
  'Carlos Mendoza',
  'driver',
  '12.345.678-9',
  '+56 9 8765 4321',
  'Transportes Demo Ltda.',
  'Av. Libertador 1234',
  'Santiago',
  'Región Metropolitana',
  NOW(),
  NOW()
),
-- Despachador Profile
(
  demo_uuid('despachador@demo.cl'),
  'despachador@demo.cl',
  'María González',
  'dispatcher',
  '98.765.432-1',
  '+56 9 1234 5678',
  'Transportes Demo Ltda.',
  'Oficina Central 123',
  'Santiago',
  'Región Metropolitana',
  NOW(),
  NOW()
),
-- Admin Profile
(
  demo_uuid('admin@demo.cl'),
  'admin@demo.cl',
  'Roberto Silva',
  'admin',
  '11.222.333-4',
  '+56 9 9876 5432',
  'Transportes Demo Ltda.',
  'Torre Empresarial 456',
  'Santiago',
  'Región Metropolitana',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  rut = EXCLUDED.rut,
  phone = EXCLUDED.phone,
  company_name = EXCLUDED.company_name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  region = EXCLUDED.region,
  updated_at = NOW();

-- Create sample certificates for conductor
INSERT INTO certificates (
  driver_id,
  certificate_type,
  certificate_number,
  issue_date,
  expiry_date,
  issuing_authority,
  status,
  file_url,
  file_name,
  validation_notes,
  created_at,
  updated_at
) VALUES 
-- Carlos Mendoza certificates
(
  demo_uuid('conductor@demo.cl'),
  'f30',
  'F30-2024-001234',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '335 days',
  'Ministerio de Transportes',
  'approved',
  '/demo/certificates/f30-demo.pdf',
  'certificado-f30-carlos.pdf',
  'Certificado válido y en regla',
  NOW(),
  NOW()
),
(
  demo_uuid('conductor@demo.cl'),
  'license',
  'LC-12345678',
  CURRENT_DATE - INTERVAL '180 days',
  CURRENT_DATE + INTERVAL '1095 days',
  'Registro Civil',
  'approved',
  '/demo/certificates/license-demo.pdf',
  'licencia-carlos.pdf',
  NULL,
  NOW(),
  NOW()
),
(
  demo_uuid('conductor@demo.cl'),
  'medical',
  'CM-2024-5678',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '355 days',
  'Centro Médico San Juan',
  'pending',
  '/demo/certificates/medical-demo.pdf',
  'certificado-medico-carlos.pdf',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (driver_id, certificate_type, certificate_number) DO NOTHING;

-- Create notifications for all demo users
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  is_read,
  created_at
) VALUES 
-- Conductor notifications
(
  demo_uuid('conductor@demo.cl'),
  'Bienvenido Conductor Demo',
  'Esta es una cuenta de demostración. Puedes subir certificados y ver el estado de validación.',
  'info',
  false,
  NOW()
),
(
  demo_uuid('conductor@demo.cl'),
  'Recordatorio de Vencimiento',
  'Tienes certificados que vencen pronto. Revisa tu panel para más detalles.',
  'warning',
  false,
  NOW()
),
-- Despachador notifications
(
  demo_uuid('despachador@demo.cl'),
  'Bienvenido Despachador Demo',
  'Esta es una cuenta de demostración. Puedes validar certificados de conductores y gestionar tu flota.',
  'info',
  false,
  NOW()
),
(
  demo_uuid('despachador@demo.cl'),
  'Certificados Pendientes',
  'Hay certificados pendientes de validación esperando tu revisión.',
  'warning',
  false,
  NOW()
),
-- Admin notifications
(
  demo_uuid('admin@demo.cl'),
  'Bienvenido Administrador Demo',
  'Esta es una cuenta de demostración. Puedes gestionar usuarios, empresas y ver estadísticas del sistema.',
  'info',
  false,
  NOW()
),
(
  demo_uuid('admin@demo.cl'),
  'Reporte Semanal',
  'Se han procesado certificados esta semana. Revisa el panel de administración para más detalles.',
  'info',
  false,
  NOW()
)
ON CONFLICT (user_id, title, message) DO NOTHING;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '=== DEMO ACCOUNTS CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Demo accounts available:';
  RAISE NOTICE '- conductor@demo.cl / demo123 (Driver)';
  RAISE NOTICE '- despachador@demo.cl / demo123 (Dispatcher)';
  RAISE NOTICE '- admin@demo.cl / demo123 (Admin)';
  RAISE NOTICE '==========================================';
END $$;
