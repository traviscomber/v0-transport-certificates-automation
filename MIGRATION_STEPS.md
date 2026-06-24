# Document Types Migration - Manual SQL Execution

## Status: Data Verified ✅ | SQL Ready ⏳ | Execution Pending

### Prerequisites
- All 3,522 documents are intact in the database
- 1,004 documents have active type assignments  
- 4 types (AFP, SALUD, MUTUAL, SEGURO_SOCIAL) have 0 documents - ready to deprecate

### Execution Steps

**Location:** Go to Supabase Dashboard → Your Project → SQL Editor

**Step 1: Copy and paste this SQL**

```sql
-- Migration: Deactivate old document types (June 24, 2026)
-- Data integrity: All 3,522 documents preserved
-- New types: PLANILLAS_IMPOSICIONES, PENSION already available

-- Add is_active column to track active types
ALTER TABLE public.subcontractor_document_types
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mark old types as inactive (no documents currently use these types)
UPDATE public.subcontractor_document_types
SET is_active = false
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL');

-- Verify: Show old (inactive) and new (active) types
SELECT 
  code, 
  nombre, 
  is_active,
  CASE 
    WHEN code = 'AFP' THEN '→ Use: PLANILLAS_IMPOSICIONES'
    WHEN code = 'SALUD' THEN '→ Use: CERT_AFIL_MUTUAL'
    WHEN code = 'MUTUAL' THEN '→ Use: CERT_TASAS_MUTUAL'
    WHEN code = 'SEGURO_SOCIAL' THEN '→ Use: PLANILLAS_IMPOSICIONES'
    ELSE ''
  END as replacement
FROM public.subcontractor_document_types 
WHERE code IN (
  'AFP', 
  'SALUD', 
  'MUTUAL', 
  'SEGURO_SOCIAL', 
  'PLANILLAS_IMPOSICIONES', 
  'PENSION'
)
ORDER BY is_active DESC, code;
```

**Step 2: Click the RUN button** (or Cmd+Enter / Ctrl+Enter)

**Step 3: Verify the output**
You should see:
- AFP, SALUD, MUTUAL, SEGURO_SOCIAL with `is_active = false`
- PLANILLAS_IMPOSICIONES, PENSION with `is_active = true`

### What This Does

1. **Adds is_active column** - If it doesn't exist, creates it with default value `true`
2. **Marks 4 types as deprecated** - Sets `is_active = false` for old types
3. **Preserves all data** - No documents are deleted or modified
4. **Shows migration map** - Query results show which new type replaces each old type

### After Execution

The application (already deployed) has been updated to:
- Filter out deprecated types from dropdowns
- Show only active types in UI
- Continue displaying all existing documents correctly

### Rollback (if needed)

```sql
-- To reactivate the old types:
UPDATE public.subcontractor_document_types
SET is_active = true
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL');
```

### Notes

- The application code already filters deprecated types (in-memory filtering)
- This SQL execution makes the deprecation permanent at the database level
- No user action required; the system continues working seamlessly
- All 3,522 documents remain accessible and unchanged

---

**Questions?** Check `scripts/029_deactivate_old_document_types.sql` for the raw SQL file.
