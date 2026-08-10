-- Fix incorrect document versioning for subcontractor uploads.
-- Canonical rule: separate uploaded documents remain independent records.
-- A document is superseded only when the caller explicitly references the exact
-- previous document via supersedes_document_id.

DROP INDEX IF EXISTS public.subcontractor_document_current_period_uniq;
DROP INDEX IF EXISTS public.uq_subcontractor_documents_current;

CREATE OR REPLACE FUNCTION public.set_subcontractor_document_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  previous_record record;
BEGIN
  IF NEW.supersedes_document_id IS NOT NULL THEN
    SELECT id, subcontractor_id, document_type_id, version_number, is_current
      INTO previous_record
      FROM public.subcontractor_documents
     WHERE id = NEW.supersedes_document_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Superseded subcontractor document % does not exist', NEW.supersedes_document_id
        USING ERRCODE = '23503';
    END IF;

    IF previous_record.subcontractor_id IS DISTINCT FROM NEW.subcontractor_id
       OR previous_record.document_type_id IS DISTINCT FROM NEW.document_type_id THEN
      RAISE EXCEPTION 'Superseded subcontractor document must belong to the same subcontractor and document type'
        USING ERRCODE = '23514';
    END IF;

    IF previous_record.is_current IS NOT TRUE THEN
      RAISE EXCEPTION 'Superseded subcontractor document must be the current exact document'
        USING ERRCODE = '23514';
    END IF;

    NEW.version_number := COALESCE(previous_record.version_number, 1) + 1;

    UPDATE public.subcontractor_documents
       SET is_current = false,
           updated_at = now()
     WHERE id = previous_record.id;
  ELSE
    NEW.version_number := COALESCE(NEW.version_number, 1);
  END IF;

  NEW.is_current := true;
  RETURN NEW;
END;
$function$;

-- The trigger needs EXECUTE as table owner, but this helper must not be exposed
-- as a callable RPC to public API roles.
REVOKE EXECUTE ON FUNCTION public.set_subcontractor_document_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_subcontractor_document_version() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_subcontractor_document_version() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_subcontractor_document_version() TO postgres;
GRANT EXECUTE ON FUNCTION public.set_subcontractor_document_version() TO service_role;
