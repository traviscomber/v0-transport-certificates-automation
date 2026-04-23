-- Check if organization_id column already exists
-- If not, add it to the profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='organization_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN organization_id UUID;
  END IF;
END $$;
