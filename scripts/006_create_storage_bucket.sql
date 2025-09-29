-- Create storage bucket for certificate files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Dispatchers can view certificates from their company drivers
CREATE POLICY "Dispatchers can view company certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() 
      AND p1.role = 'dispatcher'
      AND p2.id::text = (storage.foldername(name))[1]
      AND p1.company_name = p2.company_name
    )
  );

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
