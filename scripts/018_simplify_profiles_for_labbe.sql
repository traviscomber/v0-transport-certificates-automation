-- Simplify profiles table for Labbe: only admin and dispatcher roles
-- Drop the existing CHECK constraint on role and recreate it with just 2 roles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'dispatcher'));

-- Set any existing profiles to 'admin' if they have invalid roles
UPDATE public.profiles 
SET role = 'admin' 
WHERE role NOT IN ('admin', 'dispatcher');

-- Ensure the default is 'dispatcher' for new profiles
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'dispatcher';
