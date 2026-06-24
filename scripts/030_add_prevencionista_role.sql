-- Add prevencionista role to profiles table (June 24, 2026)
-- Allows prevention team members to view approved documents only

-- Step 1: Drop existing role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add new constraint with prevencionista role
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('administrador', 'despachador', 'mandante', 'transportista', 'conductor', 'prevencionista'));

-- Step 3: Verify constraint was added
SELECT 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' AND constraint_name LIKE '%role%';
