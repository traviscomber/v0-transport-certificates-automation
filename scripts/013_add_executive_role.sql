-- Add executive role to profiles table
-- This migration adds the 'executive' role for document reviewers at Transportes Labbe

-- Step 1: Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

-- Step 2: Add the new constraint with 'executive' role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('driver', 'dispatcher', 'admin', 'executive'));

-- Step 3: Add new RLS policy for executives
-- Executives can view documents from their own company
CREATE POLICY "Executives can view company documents" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      WHERE p1.id = auth.uid() 
      AND p1.role = 'executive'
      AND p1.company_name = public.profiles.company_name
    )
  );

-- Step 4: Add policy for executives to update their own profile
CREATE POLICY "Executives can update their own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'executive'
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_role ON public.profiles(company_name, role);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
