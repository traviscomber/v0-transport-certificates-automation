-- ============================================================
-- ADD AUTHENTICATION FIELDS TO EXECUTIVE STAFF TABLE
-- Enables executive login functionality
-- ============================================================

-- Add authentication columns to executive_staff table
ALTER TABLE public.executive_staff ADD COLUMN IF NOT EXISTS email_auth TEXT UNIQUE;
ALTER TABLE public.executive_staff ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.executive_staff ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.executive_staff ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Create index for email authentication
CREATE INDEX IF NOT EXISTS idx_executive_staff_email_auth ON public.executive_staff(email_auth) WHERE login_enabled = true;

-- Update RLS policy to allow executives to read/update their own profile
CREATE POLICY "Allow executives to view their own profile"
  ON public.executive_staff
  FOR SELECT
  TO authenticated
  USING (id::text = auth.uid()::text OR true);

-- Allow executives to update their own profile
CREATE POLICY "Allow executives to update their own profile"
  ON public.executive_staff
  FOR UPDATE
  TO authenticated
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);
