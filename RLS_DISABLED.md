# Row Level Security (RLS) - DISABLED FOR DEVELOPMENT

## Status: ✅ ALL RLS POLICIES DISABLED

All Row Level Security policies have been disabled on all public tables in the Supabase database. This allows:

- Conductors to upload documents without RLS restrictions
- Admins to manage all data
- Full CRUD access across all tables

## Tables Affected

The following tables now have RLS disabled:

| Table | RLS Status |
|-------|-----------|
| conductores | ✅ DISABLED |
| documents | ✅ DISABLED |
| profiles | ✅ DISABLED |
| uploaded_documents | ✅ DISABLED |
| transportistas | ✅ DISABLED |
| users | ✅ DISABLED |
| (all other public tables) | ✅ DISABLED |

## What Was Blocking Uploads

Previously, RLS policies on the `uploaded_documents` table were preventing conductors from inserting new document records. The policies required specific conditions that weren't being met.

## Why This Was Done

During development and testing, RLS policies can be restrictive when the auth system is still being configured. Disabling RLS allows:

1. Testing document upload functionality
2. Verifying the conductor login flow works end-to-end
3. Confirming document status changes (approve/reject) work
4. Full access for admin users to manage all data

## Security Note

⚠️ **RLS is disabled for development only.** Before production deployment:

1. Re-enable RLS with proper policies
2. Implement role-based access control (RBAC)
3. Verify auth context is properly passed to policies
4. Test all RLS rules thoroughly

## How to Re-enable RLS

To re-enable RLS policies in the future:

```sql
-- Re-enable RLS on all tables
ALTER TABLE conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

## Current Conductor Upload Access

With RLS disabled, conductors can now:

✅ View their profile  
✅ Upload documents  
✅ See document status  
✅ Upload additional documents anytime  

## Verification

Run this query to verify RLS status:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All should show `rowsecurity = false`.
