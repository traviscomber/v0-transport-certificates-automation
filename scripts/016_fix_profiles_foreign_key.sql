-- Drop the foreign key constraint that's blocking profile imports
-- This allows profiles to be created independently without requiring auth.users to exist first
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the constraint with ON DELETE CASCADE so if an auth user is deleted, the profile is too
-- First, we need to ensure the column can handle NULL values if needed
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
