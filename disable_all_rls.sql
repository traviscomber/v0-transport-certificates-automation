-- Disable ALL RLS policies to allow full CRUD access during development
-- This removes all Row Level Security restrictions

-- 1. Get list of all tables with RLS enabled
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND EXISTS (SELECT 1 FROM pg_class WHERE relname = tablename AND relrowsecurity = true)
  LOOP
    EXECUTE 'ALTER TABLE ' || table_record.schemaname || '.' || table_record.tablename || ' DISABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'Disabled RLS on table: %', table_record.tablename;
  END LOOP;
END $$;

-- 2. Explicitly disable RLS on critical tables
ALTER TABLE public.uploaded_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Drop all RLS policies on key tables to ensure no restrictions
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.' || quote_ident(policy_record.tablename);
    RAISE NOTICE 'Dropped policy: % on table: %', policy_record.policyname, policy_record.tablename;
  END LOOP;
END $$;

-- Confirm all RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
