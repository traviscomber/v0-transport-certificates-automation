-- Remove the foreign key constraint that requires profiles.id to exist in auth.users
-- This allows profiles to be created independently without auth.users dependencies
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
