-- Debug script to check data in uploaded_documents and profiles
-- Run this to see what data exists

-- Check total documents in uploaded_documents
SELECT COUNT(*) as total_documents FROM uploaded_documents;

-- Check documents with validated_at
SELECT COUNT(*) as validated_documents FROM uploaded_documents WHERE validated_at IS NOT NULL;

-- Check unique validated_by values
SELECT DISTINCT validated_by, COUNT(*) as count 
FROM uploaded_documents 
WHERE validated_at IS NOT NULL 
GROUP BY validated_by;

-- Check profiles
SELECT id, full_name FROM profiles LIMIT 10;

-- Check profiles that are in validated_by
SELECT DISTINCT u.id, u.email, p.full_name
FROM profiles p
RIGHT JOIN auth.users u ON p.id = u.id
WHERE u.id IN (
  SELECT DISTINCT validated_by 
  FROM uploaded_documents 
  WHERE validated_at IS NOT NULL
);
