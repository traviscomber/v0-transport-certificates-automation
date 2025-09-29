-- Create function to automatically check and update expired certificates
CREATE OR REPLACE FUNCTION public.update_expired_certificates()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update certificates that have expired
  UPDATE public.certificates
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
    AND status = 'approved';

  -- Create notifications for newly expired certificates
  INSERT INTO public.notifications (user_id, title, message, type, related_certificate_id)
  SELECT 
    c.driver_id,
    'Certificado Vencido',
    'Su certificado ' || c.certificate_type || ' ha vencido. Por favor, renuévelo lo antes posible.',
    'error',
    c.id
  FROM public.certificates c
  WHERE c.status = 'expired'
    AND c.expiry_date = CURRENT_DATE - INTERVAL '1 day'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.related_certificate_id = c.id
        AND n.type = 'error'
        AND n.title = 'Certificado Vencido'
    );
END;
$$;

-- Create function to send expiry warnings
CREATE OR REPLACE FUNCTION public.send_expiry_warnings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send warnings for certificates expiring in 30 days
  INSERT INTO public.notifications (user_id, title, message, type, related_certificate_id)
  SELECT 
    c.driver_id,
    'Certificado próximo a vencer',
    'Su certificado ' || c.certificate_type || ' vence el ' || c.expiry_date::text || '. Considere renovarlo pronto.',
    'warning',
    c.id
  FROM public.certificates c
  WHERE c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND c.status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.related_certificate_id = c.id
        AND n.type = 'warning'
        AND n.created_at > CURRENT_DATE - INTERVAL '7 days'
    );

  -- Send urgent warnings for certificates expiring in 7 days
  INSERT INTO public.notifications (user_id, title, message, type, related_certificate_id)
  SELECT 
    c.driver_id,
    'URGENTE: Certificado vence pronto',
    'Su certificado ' || c.certificate_type || ' vence en menos de 7 días (' || c.expiry_date::text || '). Renuévelo inmediatamente.',
    'error',
    c.id
  FROM public.certificates c
  WHERE c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND c.status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.related_certificate_id = c.id
        AND n.type = 'error'
        AND n.title LIKE 'URGENTE:%'
        AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$;

-- Create function to clean old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete read notifications older than 30 days
  DELETE FROM public.notifications
  WHERE is_read = true
    AND created_at < CURRENT_DATE - INTERVAL '30 days';

  -- Delete unread notifications older than 90 days
  DELETE FROM public.notifications
  WHERE is_read = false
    AND created_at < CURRENT_DATE - INTERVAL '90 days';
END;
$$;
