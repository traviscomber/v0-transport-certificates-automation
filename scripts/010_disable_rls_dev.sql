-- Disable all RLS policies for development
-- This script disables Row Level Security on all tables to allow unrestricted access

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Dispatchers can view company drivers" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Dispatchers can view company certificates" ON public.certificates;
DROP POLICY IF EXISTS "Dispatchers can update company certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Drivers can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Drivers can insert own certificates" ON public.certificates;

DROP POLICY IF EXISTS "Dispatchers can view company notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;

DROP POLICY IF EXISTS "Dispatchers can view company certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Disable RLS on storage buckets
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Log that RLS has been disabled
SELECT 'RLS policies have been disabled for development' AS status;
