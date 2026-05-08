# Alerts System Debugging Guide

## Problem Statement

Alerts are not appearing when conductors upload documents. This guide helps identify and fix the issue.

## System Overview

The alert system has two components:

### 1. **Legacy Alert System**
- Table: `alerts`
- Used by: Admin dashboard, notifications
- Triggered by: `generateDocumentUploadAlerts()` function
- Scope: Organization-wide alerts

### 2. **New Compliance Alert System**
- Table: `compliance_alerts`
- Used by: Compliance dashboard, compliance tracking
- Triggered by: Document upload endpoint, audit system
- Scope: Entity-specific (conductor, company, vehicle)

## Root Cause: Document Code Mismatch

The main issue is that the old system and new system use different document codes:

```
Old System (document_types table):
- LICENCIA-CONDUCIR
- CERTIFICADO-ANTECEDENTES
- CONTRATO_TRABAJO

New System (document_requirements table):
- CONDUCTOR_LICENSE
- CONDUCTOR_BACKGROUND_CERTIFICATE
- CONDUCTOR_WORK_CONTRACT
```

**When a conductor uploads a document**, the upload endpoint tries to find a matching requirement using the old code, which doesn't exist in the new table, so alerts aren't created.

## Solution: Document Code Mapping

The upload endpoint now includes a mapping layer:

```typescript
const docTypeCodeMapping: { [key: string]: string } = {
  'LICENCIA-CONDUCIR': 'CONDUCTOR_LICENSE',
  'CERTIFICADO-ANTECEDENTES': 'CONDUCTOR_BACKGROUND_CERTIFICATE',
  'CONTRATO_TRABAJO': 'CONDUCTOR_WORK_CONTRACT',
  // ... more mappings
}
```

## Troubleshooting Steps

### Step 1: Verify Document Requirements Are Loaded

```bash
curl http://localhost:3000/api/compliance/requirements?applicable_to=conductor
```

Expected response: 17 conductor requirements with codes like `CONDUCTOR_LICENSE`, `CONDUCTOR_AFP_MONTHLY`, etc.

### Step 2: Check if Conductor Has Uploaded Documents

```sql
SELECT id, conductor_id, validation_status, created_at
FROM uploaded_documents
ORDER BY created_at DESC
LIMIT 10;
```

Look for recent uploads and note the conductor IDs.

### Step 3: Check Compliance Tracking

```sql
SELECT cc.*, dr.code, dr.name
FROM conductor_document_compliance cc
LEFT JOIN document_requirements dr ON cc.document_requirement_id = dr.id
WHERE cc.conductor_id = 'YOUR_CONDUCTOR_ID'
LIMIT 20;
```

If no rows: Compliance tracking wasn't initialized (first upload didn't trigger initialization).

### Step 4: Check for Compliance Alerts

```sql
SELECT *
FROM compliance_alerts
WHERE entity_id = 'YOUR_CONDUCTOR_ID'
ORDER BY created_at DESC
LIMIT 10;
```

If no rows: Alerts weren't created. Check the upload endpoint logs for errors.

### Step 5: Check Upload Endpoint Logs

When a conductor uploads a document, look for:

```
[v0] Initializing compliance tracking for conductor: <CONDUCTOR_ID>
[v0] Document type mapping: { oldCode: 'LICENCIA-CONDUCIR', newCode: 'CONDUCTOR_LICENSE' }
[v0] Updating compliance status for matched requirement: <REQUIREMENT_ID>
[v0] Creating compliance alert for document upload
[v0] Created compliance alert
```

If you see warnings or errors, that's the issue.

## Common Issues & Fixes

### Issue 1: Alerts endpoint returns empty list

**Check:**
```bash
curl http://localhost:3000/api/compliance/alerts
```

**If you see:** `{"error": "Server configuration missing"}`
- **Cause**: Environment variables not loaded
- **Fix**: Ensure Supabase integration is connected in project settings

**If you see:** `{"alerts": []}`
- **Cause**: No alerts have been generated yet
- **Fix**: Upload a document from a conductor account

### Issue 2: No compliance records after upload

**Debug log message:**
```
[v0] No matching document requirement found for document type: LICENCIA-CONDUCIR
```

**Cause**: Document code isn't in the mapping

**Fix**: Add the mapping to the upload endpoint:
```typescript
const docTypeCodeMapping: { [key: string]: string } = {
  'YOUR_DOC_CODE': 'CONDUCTOR_OR_COMPANY_REQUIREMENT_CODE',
  // ...
}
```

### Issue 3: Compliance initialization fails

**Debug log message:**
```
[v0] Failed to initialize compliance (non-blocking): Error...
```

**Cause**: Database issue or missing permissions

**Check:**
1. Are all document requirements marked as `is_active = true`?
2. Is the conductor_id valid?
3. Do you have permission to write to `conductor_document_compliance` table?

## Testing the Alert System

### Full End-to-End Test

1. **Login as conductor**
   ```
   RUT: 19123456-8
   Password: (from test data)
   ```

2. **Upload a document**
   - Go to upload page
   - Select "Licencia de Conducir"
   - Upload PDF file
   - Wait for response

3. **Check alerts created**
   ```sql
   SELECT * FROM compliance_alerts
   WHERE created_at > NOW() - INTERVAL '1 minute'
   ORDER BY created_at DESC;
   ```

4. **View in dashboard**
   - Go to admin alerts dashboard
   - Should show new alert with document type

### Testing with curl

```bash
# Get alerts
curl http://localhost:3000/api/compliance/alerts

# Get specific conductor alerts (if auth needed)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/compliance/conductor-status?conductor_id=YOUR_ID"

# Acknowledge an alert
curl -X POST http://localhost:3000/api/compliance/alerts/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "ALERT_UUID"}'

# Resolve an alert
curl -X POST http://localhost:3000/api/compliance/alerts/resolve \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "ALERT_UUID"}'
```

## Database Schema Reference

### compliance_alerts table
```sql
CREATE TABLE compliance_alerts (
  id uuid PRIMARY KEY,
  entity_type text, -- 'conductor' | 'company' | 'vehicle'
  entity_id uuid,   -- conductor_id, company_id, or vehicle_id
  alert_type text,  -- 'document_submitted', 'document_expired', etc.
  severity text,    -- 'high' | 'medium' | 'low'
  title text,
  message text,
  document_requirement_id uuid,
  status text,      -- 'active' | 'acknowledged' | 'resolved'
  acknowledged_at timestamp,
  resolved_at timestamp,
  created_at timestamp,
  updated_at timestamp
);
```

### conductor_document_compliance table
```sql
CREATE TABLE conductor_document_compliance (
  id uuid PRIMARY KEY,
  conductor_id uuid,
  document_requirement_id uuid,
  status text,      -- 'pending' | 'approved' | 'rejected' | 'expired'
  latest_document_id uuid,
  submission_date timestamp,
  last_checked_at timestamp,
  created_at timestamp,
  updated_at timestamp
);
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/compliance/alerts` | GET | Fetch all active compliance alerts |
| `/api/compliance/alerts/acknowledge` | POST | Mark alert as acknowledged |
| `/api/compliance/alerts/resolve` | POST | Resolve alert |
| `/api/compliance/requirements` | GET | Fetch document requirements |
| `/api/compliance/conductor-status` | GET | Fetch conductor compliance status |
| `/api/compliance/company-status` | GET | Fetch company compliance status |
| `/api/conductor/upload-document` | POST | Upload document and trigger alerts |

## Next Steps

If alerts still aren't working after these troubleshooting steps:

1. Check the browser console for client-side errors
2. Check the server logs in the dev tools
3. Verify all environment variables are set correctly
4. Ensure Supabase service role key has proper permissions
5. Check that the document types table has the mappings you're uploading

## Performance Notes

- Alert creation is non-blocking during upload (upload succeeds even if alert creation fails)
- Compliance initialization only happens on first conductor upload
- Compliance tracking is automatically updated on each document upload
- Use the compliance dashboard to view real-time alert status
