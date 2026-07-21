-- Keep document period fields internally consistent.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uploaded_documents_period_year_check'
  ) THEN
    ALTER TABLE public.uploaded_documents
      ADD CONSTRAINT uploaded_documents_period_year_check
      CHECK (document_period_year IS NULL OR document_period_year BETWEEN 2020 AND 2100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subcontractor_documents_period_year_check'
  ) THEN
    ALTER TABLE public.subcontractor_documents
      ADD CONSTRAINT subcontractor_documents_period_year_check
      CHECK (document_period_year IS NULL OR document_period_year BETWEEN 2020 AND 2100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uploaded_documents_period_consistency_check'
  ) THEN
    ALTER TABLE public.uploaded_documents
      ADD CONSTRAINT uploaded_documents_period_consistency_check
      CHECK (
        document_period_start IS NULL
        OR document_period_month IS NULL
        OR document_period_year IS NULL
        OR document_period_start = make_date(document_period_year, document_period_month, 1)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subcontractor_documents_period_consistency_check'
  ) THEN
    ALTER TABLE public.subcontractor_documents
      ADD CONSTRAINT subcontractor_documents_period_consistency_check
      CHECK (
        document_period_start IS NULL
        OR document_period_month IS NULL
        OR document_period_year IS NULL
        OR document_period_start = make_date(document_period_year, document_period_month, 1)
      );
  END IF;
END $$;
