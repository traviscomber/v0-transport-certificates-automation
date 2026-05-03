-- Create executive_staff table for Transportes Labbe
CREATE TABLE IF NOT EXISTS executive_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id UUID NOT NULL REFERENCES transportistas(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  rut VARCHAR(20) NOT NULL UNIQUE,
  email_auth VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  cargo VARCHAR(100),
  login_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_executive_staff_transportista_id ON executive_staff(transportista_id);
CREATE INDEX idx_executive_staff_rut ON executive_staff(rut);
CREATE INDEX idx_executive_staff_email_auth ON executive_staff(email_auth);

-- Now insert the executives
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
VALUES 
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  ),
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  ),
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  ),
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  ),
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  ),
  (
    (SELECT id FROM transportistas WHERE rut = '78.376.780-5' LIMIT 1),
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
  )
ON CONFLICT (rut) DO NOTHING;
