-- Create demo users using Supabase admin functions
-- This script creates demo accounts with proper authentication

-- First, let's create the profiles directly since we can't easily create auth users via SQL
-- We'll use deterministic UUIDs for consistency

-- Demo user UUIDs (deterministic for consistency)
-- conductor@demo.cl: 11111111-1111-1111-1111-111111111111
-- despachador@demo.cl: 22222222-2222-2222-2222-222222222222  
-- admin@demo.cl: 33333333-3333-3333-3333-333333333333

-- Insert demo profiles (these will be linked when users are created via the app)
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
  'Roberto Silva Administrador',
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
  updated_at = NOW();

-- Create sample certificates for the driver
INSERT INTO certificates (
  id,
  driver_id,
  certificate_type,
  certificate_number,
  issue_date,
  expiry_date,
  issuing_authority,
  status,
  file_name,
  file_url,
  file_size,
  validated_by,
  validated_at,
  validation_notes,
  created_at,
  updated_at
) VALUES
-- Valid certificate
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Licencia de Conducir Profesional',
  'A1-2024-001234',
  '2024-01-15',
  '2026-01-15',
  'Registro Civil e Identificación',
  'valid',
  'licencia_profesional_juan_perez.pdf',
  '/demo/certificates/licencia_profesional.pdf',
  245760,
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '2 days',
  'Certificado válido y en regla. Cumple con todos los requisitos.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
),
-- Pending certificate
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Certificado de Antecedentes',
  'ANT-2024-567890',
  '2024-11-01',
  '2025-11-01',
  'Registro Civil e Identificación',
  'pending',
  'antecedentes_juan_perez.pdf',
  '/demo/certificates/antecedentes.pdf',
  189440,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
-- Expired certificate
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Certificado Médico',
  'MED-2023-789012',
  '2023-06-15',
  '2024-06-15',
  'COMPIN',
  'expired',
  'certificado_medico_juan_perez.pdf',
  '/demo/certificates/certificado_medico.pdf',
  156672,
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '10 days',
  'Certificado expirado. Requiere renovación urgente.',
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '10 days'
);

-- Create sample notifications
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  message,
  related_certificate_id,
  is_read,
  created_at
) VALUES
-- Notifications for driver
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'certificate_approved',
  'Certificado Aprobado',
  'Su licencia profesional ha sido validada exitosamente.',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'valid' LIMIT 1),
  false,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'certificate_expired',
  'Certificado Expirado',
  'Su certificado médico ha expirado. Por favor, renuévelo a la brevedad.',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'expired' LIMIT 1),
  false,
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'certificate_pending',
  'Certificado en Revisión',
  'Su certificado de antecedentes está siendo revisado por el equipo de validación.',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'pending' LIMIT 1),
  true,
  NOW() - INTERVAL '1 day'
),

-- Notifications for dispatcher
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'new_certificate',
  'Nuevo Certificado para Revisar',
  'Juan Carlos Pérez ha subido un nuevo certificado de antecedentes para validación.',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'pending' LIMIT 1),
  false,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'certificate_expiring',
  'Certificado Próximo a Expirar',
  'El certificado médico de Juan Carlos Pérez expirará en 30 días.',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'expired' LIMIT 1),
  true,
  NOW() - INTERVAL '40 days'
),

-- Notifications for admin
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'system',
  'Sistema de Demo Configurado',
  'El sistema de demostración ha sido configurado exitosamente con usuarios de prueba.',
  NULL,
  false,
  NOW()
),
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'user_activity',
  'Actividad de Usuarios Demo',
  'Los usuarios de demostración han sido creados: conductor@demo.cl, despachador@demo.cl',
  NULL,
  true,
  NOW() - INTERVAL '1 hour'
);

-- Create sample documents for processing
INSERT INTO documents (
  id,
  file_name,
  file_type,
  file_size,
  document_type,
  status,
  priority,
  compliance_status,
  compliance_score,
  risk_level,
  upload_date,
  extracted_data,
  ocr_data,
  validation_errors,
  ai_confidence,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  'licencia_profesional_demo.pdf',
  'application/pdf',
  '245KB',
  'professional_license',
  'processed',
  'high',
  'compliant',
  95,
  'low',
  CURRENT_DATE - INTERVAL '5 days',
  '{"license_number": "A1-2024-001234", "expiry_date": "2026-01-15", "holder_name": "Juan Carlos Pérez"}',
  '{"text": "LICENCIA DE CONDUCIR PROFESIONAL", "confidence": 0.98}',
  '[]',
  0.95,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'antecedentes_demo.pdf', 
  'application/pdf',
  '189KB',
  'background_check',
  'pending',
  'medium',
  'pending_review',
  NULL,
  'medium',
  CURRENT_DATE - INTERVAL '1 day',
  '{"certificate_number": "ANT-2024-567890", "issue_date": "2024-11-01"}',
  '{"text": "CERTIFICADO DE ANTECEDENTES", "confidence": 0.92}',
  '[]',
  0.92,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Create sample transporters
INSERT INTO transporters (
  id,
  rut,
  name,
  company_name,
  license_number,
  license_class,
  email,
  phone,
  address,
  city,
  region,
  contact_name,
  status,
  restrictions,
  issue_date,
  expiry_date,
  document_id,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  '12.345.678-9',
  'Juan Carlos Pérez',
  'Transportes Demo Ltda.',
  'A1-2024-001234',
  'A1',
  'conductor@demo.cl',
  '+56 9 8765 4321',
  'Av. Los Transportistas 123',
  'Santiago',
  'Metropolitana',
  'Juan Carlos Pérez',
  'active',
  'Ninguna',
  '2024-01-15',
  '2026-01-15',
  (SELECT id FROM documents WHERE file_name = 'licencia_profesional_demo.pdf' LIMIT 1),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
);

-- Create sample machines
INSERT INTO machines (
  id,
  patent,
  document_number,
  vehicle_type,
  brand,
  model,
  year,
  transporter_name,
  transporter_rut,
  status,
  compliance_status,
  issue_date,
  expiry_date,
  document_id,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  'DEMO-123',
  'VEH-2024-001',
  'Camión',
  'Mercedes-Benz',
  'Actros 2644',
  2022,
  'Transportes Demo Ltda.',
  '12.345.678-9',
  'active',
  'compliant',
  '2024-01-01',
  '2025-12-31',
  (SELECT id FROM documents WHERE file_name = 'licencia_profesional_demo.pdf' LIMIT 1),
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '2 days'
);

-- Add audit log entries for demo activity
INSERT INTO audit_log (
  id,
  user_id,
  action,
  table_name,
  record_id,
  old_values,
  new_values,
  ip_address,
  user_agent,
  created_at
) VALUES
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'UPDATE',
  'certificates',
  (SELECT id FROM certificates WHERE driver_id = '11111111-1111-1111-1111-111111111111' AND status = 'valid' LIMIT 1),
  '{"status": "pending"}',
  '{"status": "valid", "validated_by": "22222222-2222-2222-2222-222222222222", "validated_at": "' || (NOW() - INTERVAL '2 days')::text || '"}',
  '192.168.1.100',
  'Mozilla/5.0 (Demo Browser)',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'INSERT',
  'profiles',
  '11111111-1111-1111-1111-111111111111',
  '{}',
  '{"email": "conductor@demo.cl", "role": "driver", "full_name": "Juan Carlos Pérez"}',
  '192.168.1.101',
  'Mozilla/5.0 (Demo Browser)',
  NOW() - INTERVAL '5 days'
);

-- Success message
SELECT 'Demo users profiles and data created successfully!' as result;
SELECT 'Created profiles for:' as info;
SELECT '- conductor@demo.cl (Driver)' as user1;
SELECT '- despachador@demo.cl (Dispatcher)' as user2; 
SELECT '- admin@demo.cl (Administrator)' as user3;
SELECT 'Note: Users still need to be created in Supabase auth via the setup-demo action' as note;
