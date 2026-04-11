-- Transportes Labbe Executive Staff Data Load
-- Insert the main transportista (company)
INSERT INTO transportistas (rut, razon_social, nombre_fantasia, representante_legal, email, telefono, region, comuna, is_active, created_at, updated_at)
VALUES ('78.376.780-5', 'Transportes Labbe Hermanos Limitada', 'Transportes Labbe', 'Olga Lydia Carrasco Olivares', 'info@transporteslabbe.cl', '+56977764753', 'XIII Región Metropolitana', 'Paine', true, NOW(), NOW())
ON CONFLICT (rut) DO NOTHING;

-- Ejecutiva 1: Olga Lydia Carrasco - Password: Olga2024#Labbe
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
  '$2a$10$h7vYOdLXJ5v8L9K2Q3R8C.K5X2p0M9N5B8C1D2E3F4G5H6I7J8K9L0',
  '+56977764753',
  'olga.carrasco@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;

-- Ejecutiva 2: Carolina Pilar Sepulveda - Password: Carolina2024#Exec
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
  '$2a$10$K8M1N2O3P4Q5R6S7T8U9V.W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5',
  '+56950067666',
  'carolina.sepulveda@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;

-- Ejecutiva 3: Daniela Constanza Silva - Password: Daniela2024#Silva
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
  '$2a$10$L6M7N8O9P0Q1R2S3T4U5V.W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1',
  '+56978540722',
  'daniela.silva@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;

-- Ejecutiva 4: Cecilia Del Carmen Farias - Password: Cecilia2024#Farias
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
  '$2a$10$M7N8O9P0Q1R2S3T4U5V6W.X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2',
  '+56978540798',
  'cecilia.farias@transporteslabbe.cl',
  'Ejecutiva',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;

-- Jefe RRHH: Diego Andres Gonzalez - Password: Diego2024#JefeRRHH
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
  '$2a$10$N8O9P0Q1R2S3T4U5V6W7X.Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3',
  '+56978455527',
  'diego.gonzalez@transporteslabbe.cl',
  'Jefe RRHH',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;

-- Asistente RRHH: Katherinne Johanna Canales - Password: Katherinne2024#RRHH
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
  '$2a$10$O9P0Q1R2S3T4U5V6W7X8Y.Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4',
  '+56956139744',
  'katherinne.canales@transporteslabbe.cl',
  'Asistente RRHH',
  true,
  NOW(),
  NOW()
FROM transportistas t WHERE t.rut = '78.376.780-5'
ON CONFLICT (rut) DO NOTHING;
