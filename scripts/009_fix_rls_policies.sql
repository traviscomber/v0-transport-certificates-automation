-- Fix infinite recursion in RLS policies by removing circular references
-- This script drops the problematic policies and creates new ones that don't cause recursion

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Dispatchers can view company drivers" ON public.profiles;

-- Drop problematic policies on certificates table
DROP POLICY IF EXISTS "Dispatchers can view company certificates" ON public.certificates;
DROP POLICY IF EXISTS "Dispatchers can update company certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update all certificates" ON public.certificates;

-- Drop problematic policies on notifications table
DROP POLICY IF EXISTS "Dispatchers can view company notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

-- Drop problematic policies on audit_log table
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;

-- Drop problematic policies on storage
DROP POLICY IF EXISTS "Dispatchers can view company certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;

-- Create a security definer function to check user roles without RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'driver');
END;
$$;

-- Create a security definer function to get user company
CREATE OR REPLACE FUNCTION public.get_user_company(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_company TEXT;
BEGIN
  SELECT company_name INTO user_company
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_company;
END;
$$;

-- Recreate profiles policies using the security definer functions
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Dispatchers can view company drivers" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'dispatcher' 
    AND public.get_user_company(auth.uid()) = company_name
  );

-- Recreate certificates policies
CREATE POLICY "Dispatchers can view company certificates" ON public.certificates
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'dispatcher' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = public.certificates.driver_id 
      AND company_name = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Dispatchers can update company certificates" ON public.certificates
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'dispatcher' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = public.certificates.driver_id 
      AND company_name = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Admins can view all certificates" ON public.certificates
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all certificates" ON public.certificates
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Recreate notifications policies
CREATE POLICY "Dispatchers can view company notifications" ON public.notifications
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'dispatcher' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = public.notifications.user_id 
      AND company_name = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Recreate audit_log policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_log
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Recreate storage policies
CREATE POLICY "Dispatchers can view company certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    public.get_user_role(auth.uid()) = 'dispatcher' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id::text = (storage.foldername(name))[1]
      AND company_name = public.get_user_company(auth.uid())
    )
  );

CREATE POLICY "Admins can view all certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company(UUID) TO authenticated;
