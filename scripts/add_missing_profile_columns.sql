-- Add missing avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add other potentially missing columns for consistency
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
