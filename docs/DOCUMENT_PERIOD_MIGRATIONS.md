# Document Period Migrations (014 & 015)

## Overview

These migrations add document period tracking and approval status to the documents table, enabling proper validation and expiration tracking.

## What These Migrations Do

### Migration 014: Document Period Fields
Adds the following columns to the `documents` table:
- `status`: Document approval status (pending, approved, rejected, expired)
- `approval_date`: When document was approved
- `approved_by`: User ID who approved the document
- `rejection_reason`: Reason if document was rejected
- `validity_start_date`: Start of document validity period
- `validity_end_date`: End of document validity period
- `period_years`: Document validity period in years
- `is_active`: Boolean tracking if document is currently active
- `approved_at`: Timestamp when approved (auto-populated)
- `expires_at`: Timestamp when document expires (auto-populated)

Also creates indexes for efficient querying:
- `idx_documents_status`
- `idx_documents_approval_date`
- `idx_documents_expires_at`
- `idx_documents_is_active`

### Migration 015: Data Consistency
Ensures data consistency by:
1. Populating `approved_at` from `approval_date` for existing documents
2. Setting `expires_at` based on `validity_end_date`
3. Updating `status` to 'approved' for documents with approval dates
4. Marking expired documents as 'expired'
5. Disabling `is_active` for expired documents
6. Creating triggers for automatic updates:
   - Auto-sets `approved_at` when status changes to 'approved'
   - Auto-calculates `expires_at` from `validity_end_date`
7. Setting up RLS policies for proper access control

## How to Apply Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from `migrations/014_document_period.sql`
5. Execute the query
6. Create another new query
7. Copy and paste the SQL from `migrations/015_document_period_consistency.sql`
8. Execute the query

### Option 2: Using psql Command Line

```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run migration 014
psql "$DATABASE_URL" -f migrations/014_document_period.sql

# Run migration 015
psql "$DATABASE_URL" -f migrations/015_document_period_consistency.sql
```

### Option 3: Using Node Script

```bash
# From project root
node scripts/run-document-migrations.js
```

## Verifying the Migrations

After applying migrations, verify they worked:

```bash
# Check table structure
psql "$DATABASE_URL" -c "\\d documents"

# Check approved documents count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM documents WHERE status = 'approved';"

# Check document statuses
psql "$DATABASE_URL" -c "SELECT status, COUNT(*) FROM documents GROUP BY status;"
```

## Viewing Approved Documents

Once migrations are applied, you should be able to:

1. Navigate to the dashboard's "Documentos Aprobados" section
2. See approved documents with:
   - Approval date
   - Expiration date
   - Current status
   - Active/inactive flag

### If Approved Documents Still Don't Show

1. **Check the documents table has the new columns:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'documents' AND column_name = 'status';
   ```

2. **Check if approved documents exist:**
   ```sql
   SELECT COUNT(*) FROM documents WHERE status = 'approved';
   SELECT COUNT(*) FROM documents WHERE approval_date IS NOT NULL;
   ```

3. **Update status for documents with approval dates:**
   ```sql
   UPDATE documents 
   SET status = 'approved' 
   WHERE status = 'pending' AND approval_date IS NOT NULL;
   ```

4. **Verify RLS policies allow viewing:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'documents';
   ```

## Schema Changes Summary

```sql
-- New columns added to documents table
ALTER TABLE documents ADD COLUMN status TEXT;
ALTER TABLE documents ADD COLUMN approval_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN approved_by UUID;
ALTER TABLE documents ADD COLUMN validity_start_date DATE;
ALTER TABLE documents ADD COLUMN validity_end_date DATE;
ALTER TABLE documents ADD COLUMN period_years INTEGER;
ALTER TABLE documents ADD COLUMN is_active BOOLEAN;
ALTER TABLE documents ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE documents ADD COLUMN rejection_reason TEXT;

-- New indexes created
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_approval_date ON documents(approval_date);
CREATE INDEX idx_documents_expires_at ON documents(expires_at);
CREATE INDEX idx_documents_is_active ON documents(is_active);
```

## Troubleshooting

### "Column already exists" error
This is normal if migrations have been run before. The `IF NOT EXISTS` clauses prevent re-creation.

### Documents don't show as approved
1. Verify `status` column exists: `\d documents` in psql
2. Check if documents have approval_date set
3. Run the UPDATE query from Migration 015 manually
4. Clear any client-side cache

### Triggers not working
1. Check trigger creation worked: `SELECT * FROM pg_trigger WHERE tgrelid = 'documents'::regclass;`
2. Verify trigger functions exist: `SELECT * FROM pg_proc WHERE proname LIKE 'set_%_at';`

## Next Steps

After migrations are applied:

1. Test the "Documentos Aprobados" page
2. Verify document counts match expectations
3. Check that expiration dates display correctly
4. Set up any additional application logic for status changes
