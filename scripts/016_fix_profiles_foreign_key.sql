-- Drop the foreign key constraint that's blocking profile imports
-- This allows profiles to be created independently without requiring auth.users to exist first
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
