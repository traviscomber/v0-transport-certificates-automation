-- Track the business period selected by users independently from upload/review dates.
-- This avoids moving a June document to July when it is approved or rejected in July.

ALTER TABLE public.uploaded_documents
  ADD COLUMN IF NOT EXISTS document_period_month integer,
  ADD COLUMN IF NOT EXISTS document_period_year integer,
  ADD COLUMN IF NOT EXISTS document_period_start date;

ALTER TABLE public.subcontractor_documents
  ADD COLUMN IF NOT EXISTS document_period_month integer,
  ADD COLUMN IF NOT EXISTS document_period_year integer,
  ADD COLUMN IF NOT EXISTS document_period_start date;

UPDATE public.uploaded_documents
SET
  document_period_month = COALESCE(document_period_month, EXTRACT(MONTH FROM created_at)::integer),
  document_period_year = COALESCE(document_period_year, EXTRACT(YEAR FROM created_at)::integer),
  document_period_start = COALESCE(
    document_period_start,
    DATE_TRUNC('month', created_at)::date
  )
WHERE document_period_start IS NULL
  AND created_at IS NOT NULL;

UPDATE public.subcontractor_documents
SET
  document_period_month = COALESCE(document_period_month, EXTRACT(MONTH FROM COALESCE(uploaded_at, created_at))::integer),
  document_period_year = COALESCE(document_period_year, EXTRACT(YEAR FROM COALESCE(uploaded_at, created_at))::integer),
  document_period_start = COALESCE(
    document_period_start,
    DATE_TRUNC('month', COALESCE(uploaded_at, created_at))::date
  )
WHERE document_period_start IS NULL
  AND COALESCE(uploaded_at, created_at) IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uploaded_documents_period_month_check'
  ) THEN
    ALTER TABLE public.uploaded_documents
      ADD CONSTRAINT uploaded_documents_period_month_check
      CHECK (document_period_month IS NULL OR document_period_month BETWEEN 1 AND 12);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subcontractor_documents_period_month_check'
  ) THEN
    ALTER TABLE public.subcontractor_documents
      ADD CONSTRAINT subcontractor_documents_period_month_check
      CHECK (document_period_month IS NULL OR document_period_month BETWEEN 1 AND 12);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_uploaded_documents_period
  ON public.uploaded_documents (document_period_year, document_period_month, document_period_start);

CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_period
  ON public.subcontractor_documents (document_period_year, document_period_month, document_period_start);
