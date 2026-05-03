-- Disable RLS policies on profiles table temporarily for development
-- This allows the import to work without RLS restrictions

-- Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Optional: After development/testing is complete, re-enable RLS with:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
