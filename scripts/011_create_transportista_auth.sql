-- Create transportista_auth table for subcontractor authentication
CREATE TABLE IF NOT EXISTS transportista_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rut VARCHAR(12) UNIQUE NOT NULL,
  transportista_id UUID REFERENCES transportistas(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE transportista_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read own auth" ON transportista_auth
  FOR SELECT USING (
    rut = current_setting('app.current_rut', true)
  );

-- Create index for fast lookups
CREATE INDEX idx_transportista_auth_rut ON transportista_auth(rut);
CREATE INDEX idx_transportista_auth_transportista_id ON transportista_auth(transportista_id);
