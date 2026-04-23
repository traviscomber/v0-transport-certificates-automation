-- Crear usuarios en auth.users y luego crear sus perfiles
-- Este script crea usuarios de autenticación y sus perfiles correspondientes

-- Datos de los ejecutivos con emails @labbe.cl
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Olga Carrasco
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ocarrasco@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Olga Lydia Carrasco Olivares', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'ocarrasco@labbe.cl', 'Olga Lydia Carrasco Olivares', 'admin', '', '', true);

  -- 2. Carolina Sepúlveda
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'csepulveda@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Carolina Pilar Sepulveda Contreras', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'csepulveda@labbe.cl', 'Carolina Pilar Sepulveda Contreras', 'admin', '', '', true);

  -- 3. Daniela Silva
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'dsilva@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Daniela Constanza Silva Rojas', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'dsilva@labbe.cl', 'Daniela Constanza Silva Rojas', 'admin', '', '', true);

  -- 4. Cecilia Farias
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'cfarias@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Cecilia Del Carmen Farias Muñoz', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'cfarias@labbe.cl', 'Cecilia Del Carmen Farias Muñoz', 'admin', '', '', true);

  -- 5. Diego González
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'dgonzalez@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Diego Andres Gonzalez Valenzuela', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'dgonzalez@labbe.cl', 'Diego Andres Gonzalez Valenzuela', 'admin', '', '', true);

  -- 6. Katherinne Canales
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_super_admin, role)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'kcanales@labbe.cl',
    crypt('TempPassword123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('full_name', 'Katherinne Johanna Canales Hernandez', 'phone', '', 'rut', ''),
    false,
    'authenticated'
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO profiles (id, email, full_name, role, phone, rut, is_active)
  VALUES (v_user_id, 'kcanales@labbe.cl', 'Katherinne Johanna Canales Hernandez', 'admin', '', '', true);

  RAISE NOTICE 'Successfully created 6 users and profiles';
END $$;
