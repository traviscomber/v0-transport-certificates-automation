-- Drop the foreign key constraint that's preventing profile creation
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now profiles can be created without requiring auth.users to exist
