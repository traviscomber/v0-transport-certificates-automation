-- Disable RLS on profiles table for development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other tables that might be blocking
ALTER TABLE public.executive_staff DISABLE ROW LEVEL SECURITY;

-- Optional: Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON public.profiles;
