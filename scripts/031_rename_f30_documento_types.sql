-- Rename F30 variants to include "1" to differentiate from regular F30
-- F30 shows different information than F30-1

UPDATE public.subcontractor_document_types
SET code = 'F30-1_CLIENTE'
WHERE code = 'F30_CLIENTE';

UPDATE public.subcontractor_document_types
SET code = 'F30-1_DOÑA_ISIDORA'
WHERE code = 'F30_DOÑA_ISIDORA';

-- Verify
SELECT code FROM public.subcontractor_document_types 
WHERE code LIKE 'F30%' 
ORDER BY code;
