-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'driver')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check certificate expiry and send notifications
CREATE OR REPLACE FUNCTION public.check_certificate_expiry()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notifications for certificates expiring in 30 days
  INSERT INTO public.notifications (user_id, title, message, type, related_certificate_id)
  SELECT 
    c.driver_id,
    'Certificado próximo a vencer',
    'Su certificado ' || c.certificate_type || ' vence el ' || c.expiry_date::text,
    'warning',
    c.id
  FROM public.certificates c
  WHERE c.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    AND c.expiry_date > CURRENT_DATE
    AND c.status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.related_certificate_id = c.id
        AND n.type = 'warning'
        AND n.created_at > CURRENT_DATE - INTERVAL '7 days'
    );

  -- Update expired certificates
  UPDATE public.certificates
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
    AND status = 'approved';
END;
$$;
