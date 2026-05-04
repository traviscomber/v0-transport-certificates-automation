# Row Level Security (RLS) Policies Documentation

## Overview
This document describes the Row Level Security policies implemented in the production database to ensure data isolation and security.

## Tables Protected by RLS

### 1. anomaly_tracking
Tracks all anomalies detected in documents with action history.

**Enabled RLS:** YES

**Policies:**
- `anomaly_select_company`: Users can SELECT anomalies for documents their company owns
  - Company users see only their company's anomalies
  - Admins can see all anomalies
  
- `anomaly_insert_company`: Only company users can INSERT new anomalies
  - Must own the document via company
  
- `anomaly_update_company`: Users can UPDATE anomalies for their company's documents
  - Cannot update anomalies from other companies

**Access Control:**
```
Company User:
  - Can view: anomalies for their company's documents
  - Can create: new anomalies (detected by system)
  - Can update: action_taken, action_notes for their company's anomalies
  - Cannot delete: any anomaly records

Admin User:
  - Can view: ALL anomalies
  - Can create: anomalies for any document
  - Can update: any anomaly
  - Cannot delete: any anomaly records
```

### 2. document_status_audit_log
Immutable audit trail of all document status changes.

**Enabled RLS:** YES

**Policies:**
- `audit_log_select_company`: SELECT access for document owners
  - Company users see audit logs for their documents only
  - Admins can see all audit logs
  
- `audit_log_prevent_modifications`: Write operations are BLOCKED
  - Prevents accidental or malicious audit log tampering
  - Audit logs can only be created via application service role

**Access Control:**
```
All Authenticated Users:
  - Can view: audit logs for documents they own/manage
  - Cannot insert: prevent manual audit log creation
  - Cannot update: audit logs are immutable
  - Cannot delete: audit logs cannot be deleted
```

### 3. documents
Documents table (base records).

**RLS Handling:** 
- Company-level isolation via company_id
- Users can only access documents from their company

### 4. uploaded_documents
Uploaded documents with status tracking.

**RLS Handling:**
- Isolates by company through conductor relationships
- Users see only documents from their company

## Security Best Practices

### For Application Development

1. **Always Verify User Context**
   - RLS policies assume `auth.uid()` is set correctly
   - Verify user is logged in before API calls
   - Never bypass authentication checks

2. **Audit Log Integrity**
   - Audit logs should NEVER be deleted
   - Deletions trigger the immutable policy (prevents deletion)
   - All status changes must flow through the app, not direct DB calls

3. **Service Role Usage**
   - Service role can bypass RLS (use sparingly)
   - Only use service role for:
     - Creating audit log entries
     - Batch operations that need admin access
     - System maintenance tasks

4. **Testing RLS**
   - Test as different user roles
   - Verify company isolation works
   - Confirm admins can access all data
   - Check that cross-company access is blocked

## Implementation Details

### Company Isolation Pattern
```sql
-- Companies can only see their own data
document_id IN (
  SELECT d.id FROM public.documents d
  JOIN public.users u ON d.company_id = u.company_id
  WHERE u.id = auth.uid()
)
```

### Admin Override Pattern
```sql
-- Admins bypass company isolation
auth.uid() IN (
  SELECT user_id FROM public.company_admins
  WHERE role = 'admin'
)
```

### Immutable Audit Log Pattern
```sql
-- Prevent modifications
CREATE POLICY "audit_log_prevent_modifications"
  FOR INSERT
  WITH CHECK (FALSE);  -- Always fails, no inserts allowed
```

## Monitoring & Debugging

### Check if RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE rowsecurity = true;
```

### View Active Policies
```sql
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### Test Policy as User
```sql
-- As service role (admin):
SELECT * FROM public.anomaly_tracking;

-- As specific user (add in app):
SET "request.jwt.claims" = '{"sub":"user-id"}';
SELECT * FROM public.anomaly_tracking;
RESET "request.jwt.claims";
```

## Troubleshooting

### "permission denied for relation" error
- User may not own the data
- Check company_id matches
- Verify auth.uid() is set

### Can't insert into audit_log
- This is expected! Use application service role
- Never insert directly into audit_log

### Admin can't see data
- Verify user has admin role in database
- Check company_admins table

### Performance Issues
- Ensure indexes exist on company_id
- Check RLS policy query complexity
- Consider materialized views for common queries

## Migration History

- `005_anomaly_tracking.sql` - Initial anomaly_tracking table with RLS
- `006_document_status_audit.sql` - Audit log table with RLS
- `007_enhanced_rls_policies.sql` - Enhanced and hardened policies
