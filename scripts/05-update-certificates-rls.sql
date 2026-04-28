-- Add RLS policy to allow reading all certificates for admin/metrics purposes
-- This policy allows service role to read all certificates
CREATE POLICY "Allow admin metrics read" ON public.certificates
  FOR SELECT
  USING (true);

-- Also update the existing policies to be more permissive for dispatchers/admin
CREATE POLICY "Allow validated_by users to view certificates" ON public.certificates
  FOR SELECT
  USING (
    validated_by = auth.uid() OR
    driver_id = auth.uid()
  );
