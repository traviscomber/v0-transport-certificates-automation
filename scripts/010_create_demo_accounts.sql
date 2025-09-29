-- Create demo profiles and sample data
-- This script creates demo profiles that will be linked when users sign up with demo emails

-- First, create some sample data that doesn't depend on auth users
-- We'll use placeholder UUIDs that will be replaced when real users sign up

-- Create a function to generate consistent UUIDs for demo data
CREATE OR REPLACE FUNCTION demo_uuid(seed TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate a deterministic UUID based on the seed
  RETURN md5(seed)::uuid;
END;
$$;

-- Create sample certificates with placeholder driver IDs
-- These will be updated when real demo users are created
INSERT INTO public.certificates (
  id,
  driver_id,
  certificate_type,
  certificate_number,
  issue_date,
  expiry_date,
  status,
  file_url,
  created_at,
  updated_at
) VALUES 
(
  demo_uuid('cert-f30-demo'),
  demo_uuid('conductor@demo.cl'), -- Placeholder, will be updated
  'F-30',
  'F30-2024-001234',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '335 days',
  'approved',
  '/demo/certificates/f30-demo.pdf',
  NOW(),
  NOW()
),
(
  demo_uuid('cert-license-demo'),
  demo_uuid('conductor@demo.cl'), -- Placeholder, will be updated
  'Licencia de Conducir',
  'LC-12345678',
  CURRENT_DATE - INTERVAL '180 days',
  CURRENT_DATE + INTERVAL '1095 days',
  'approved',
  '/demo/certificates/license-demo.pdf',
  NOW(),
  NOW()
),
(
  demo_uuid('cert-medical-demo'),
  demo_uuid('conductor@demo.cl'), -- Placeholder, will be updated
  'Certificado Médico',
  'CM-2024-5678',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '305 days',
  'pending',
  '/demo/certificates/medical-demo.pdf',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  certificate_number = EXCLUDED.certificate_number,
  issue_date = EXCLUDED.issue_date,
  expiry_date = EXCLUDED.expiry_date,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create sample notifications with placeholder user IDs
INSERT INTO public.notifications (
  id,
  user_id,
  title,
  message,
  type,
  read,
  created_at
) VALUES 
(
  demo_uuid('notif-driver-welcome'),
  demo_uuid('conductor@demo.cl'),
  'Bienvenido al Sistema Demo',
  'Esta es una cuenta de demostración. Explora todas las funcionalidades del sistema.',
  'info',
  false,
  NOW()
),
(
  demo_uuid('notif-driver-approved'),
  demo_uuid('conductor@demo.cl'),
  'Certificado Aprobado',
  'Su certificado F-30 ha sido aprobado y está listo para usar.',
  'success',
  false,
  NOW() - INTERVAL '1 day'
),
(
  demo_uuid('notif-dispatcher-welcome'),
  demo_uuid('despachador@demo.cl'),
  'Bienvenido Despachador Demo',
  'Cuenta de demostración para despachador. Puede gestionar conductores y certificados.',
  'info',
  false,
  NOW()
),
(
  demo_uuid('notif-admin-welcome'),
  demo_uuid('admin@demo.cl'),
  'Bienvenido Administrador Demo',
  'Cuenta de demostración con acceso completo al sistema.',
  'info',
  false,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  type = EXCLUDED.type,
  created_at = EXCLUDED.created_at;

-- Create a trigger function to set up demo profiles when users sign up
CREATE OR REPLACE FUNCTION setup_demo_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_data RECORD;
BEGIN
  -- Check if this is a demo account
  IF NEW.email IN ('conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl') THEN
    
    -- Set up profile data based on email
    IF NEW.email = 'conductor@demo.cl' THEN
      demo_data := ROW(
        'Carlos Mendoza',
        'driver',
        '12.345.678-9',
        '+56 9 8765 4321',
        'Transportes Demo Ltda.',
        'Santiago',
        'Región Metropolitana'
      );
    ELSIF NEW.email = 'despachador@demo.cl' THEN
      demo_data := ROW(
        'María González',
        'dispatcher',
        '98.765.432-1',
        '+56 9 1234 5678',
        'Transportes Demo Ltda.',
        'Santiago',
        'Región Metropolitana'
      );
    ELSIF NEW.email = 'admin@demo.cl' THEN
      demo_data := ROW(
        'Roberto Silva',
        'admin',
        '11.222.333-4',
        '+56 9 9876 5432',
        'Transportes Demo Ltda.',
        'Santiago',
        'Región Metropolitana'
      );
    END IF;
    
    -- Insert the demo profile
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      rut,
      phone,
      company_name,
      city,
      region,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      demo_data.f1, -- full_name
      demo_data.f2, -- role
      demo_data.f3, -- rut
      demo_data.f4, -- phone
      demo_data.f5, -- company_name
      demo_data.f6, -- city
      demo_data.f7, -- region
      NOW(),
      NOW()
    );
    
    -- Update certificates and notifications to use the real user ID
    UPDATE public.certificates 
    SET driver_id = NEW.id, updated_at = NOW()
    WHERE driver_id = demo_uuid(NEW.email);
    
    UPDATE public.notifications 
    SET user_id = NEW.id
    WHERE user_id = demo_uuid(NEW.email);
    
    -- Create sample audit log entry
    INSERT INTO public.audit_logs (
      id,
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      created_at
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      'INSERT',
      'profiles',
      NEW.id,
      '{}',
      jsonb_build_object(
        'email', NEW.email,
        'role', demo_data.f2,
        'full_name', demo_data.f1
      ),
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set up demo profiles
DROP TRIGGER IF EXISTS setup_demo_profile_trigger ON auth.users;
CREATE TRIGGER setup_demo_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION setup_demo_profile();

-- Create a function to check if demo data is ready
CREATE OR REPLACE FUNCTION check_demo_status()
RETURNS TABLE(
  email TEXT,
  profile_exists BOOLEAN,
  certificates_count INTEGER,
  notifications_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    demo_emails.email,
    EXISTS(SELECT 1 FROM public.profiles WHERE profiles.email = demo_emails.email) as profile_exists,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.certificates c 
              JOIN public.profiles p ON c.driver_id = p.id 
              WHERE p.email = demo_emails.email), 0) as certificates_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.notifications n 
              JOIN public.profiles p ON n.user_id = p.id 
              WHERE p.email = demo_emails.email), 0) as notifications_count
  FROM (VALUES 
    ('conductor@demo.cl'),
    ('despachador@demo.cl'),
    ('admin@demo.cl')
  ) AS demo_emails(email);
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION demo_uuid TO authenticated, anon;
GRANT EXECUTE ON FUNCTION setup_demo_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_demo_status TO authenticated, anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_driver_demo ON public.certificates(driver_id) 
WHERE driver_id IN (
  SELECT demo_uuid(email) FROM (VALUES ('conductor@demo.cl'), ('despachador@demo.cl'), ('admin@demo.cl')) AS t(email)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_demo ON public.notifications(user_id) 
WHERE user_id IN (
  SELECT demo_uuid(email) FROM (VALUES ('conductor@demo.cl'), ('despachador@demo.cl'), ('admin@demo.cl')) AS t(email)
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Demo system setup completed successfully!';
  RAISE NOTICE 'Demo accounts will be automatically configured when users sign up with:';
  RAISE NOTICE '- conductor@demo.cl / demo123';
  RAISE NOTICE '- despachador@demo.cl / demo123';
  RAISE NOTICE '- admin@demo.cl / demo123';
  RAISE NOTICE 'Sample certificates and notifications are ready to be linked.';
END;
$$;
