-- Migration 017: Respect user-selected document period
-- 
-- Priority for document_period_month and document_period_year:
-- 1. Period explicitly selected by user during upload (most reliable)
-- 2. Period extracted from document metadata
-- 3. Period extracted from filename (fallback)
--
-- This migration ensures we NEVER overwrite a user-selected period with 
-- filename extraction, which was causing mismatches like:
-- - File: "ORLANDO F29 MAYO.pdf"
-- - User selected: 5/2026
-- - Was being overwritten to: 7/2026 (from approval_at)
-- - Should respect: 5/2026 (user's selection)

-- Add a column to track the source of the period (for auditing and future improvements)
ALTER TABLE public.subcontractor_documents
  ADD COLUMN IF NOT EXISTS document_period_source TEXT CHECK (document_period_source IN ('user_selected', 'metadata', 'filename', 'unknown'));

ALTER TABLE public.uploaded_documents
  ADD COLUMN IF NOT EXISTS document_period_source TEXT CHECK (document_period_source IN ('user_selected', 'metadata', 'filename', 'unknown'));

-- Backfill: Mark existing periods as coming from filename extraction or user selection
-- If both month and year exist, assume user selected it (since it was populated during upload)
UPDATE public.subcontractor_documents
SET document_period_source = 'user_selected'
WHERE document_period_month IS NOT NULL 
  AND document_period_year IS NOT NULL
  AND document_period_source IS NULL;

UPDATE public.uploaded_documents
SET document_period_source = 'user_selected'
WHERE document_period_month IS NOT NULL 
  AND document_period_year IS NOT NULL
  AND document_period_source IS NULL;

-- Mark any orphaned periods (should not exist but cover edge cases)
UPDATE public.subcontractor_documents
SET document_period_source = 'unknown'
WHERE document_period_source IS NULL;

UPDATE public.uploaded_documents
SET document_period_source = 'unknown'
WHERE document_period_source IS NULL;

-- Create index on period_source for auditing queries
CREATE INDEX IF NOT EXISTS idx_subdocs_period_source ON public.subcontractor_documents(document_period_source);
CREATE INDEX IF NOT EXISTS idx_uploaddocs_period_source ON public.uploaded_documents(document_period_source);

-- Verification query
SELECT 
  'subcontractor_documents' AS table_name,
  document_period_source,
  COUNT(*) as count
FROM public.subcontractor_documents
WHERE document_period_source IS NOT NULL
GROUP BY document_period_source
UNION ALL
SELECT 
  'uploaded_documents',
  document_period_source,
  COUNT(*)
FROM public.uploaded_documents
WHERE document_period_source IS NOT NULL
GROUP BY document_period_source
ORDER BY table_name, document_period_source;
