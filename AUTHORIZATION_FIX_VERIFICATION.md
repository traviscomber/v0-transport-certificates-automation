# Authorization Fix Verification

## Critical Issue Resolved

The authorization system was failing with "Unauthorized" error because it was looking for the wrong database column.

### The Bug
- Code queried for: `conductores.empresa_id`
- Actual column: `conductores.transportista_id`

### The Fix
Authorization now correctly maps:
- `profiles.organization_id` → user's company/transportista
- `conductores.transportista_id` → conductor's company/transportista
- Compares these two fields to determine if user can modify the document

## How It Works Now

### Step 1: User Logs In (@labbe.cl)
```
Login with: ocarrasco@labbe.cl
→ Authentication succeeds
→ User profile loaded
→ organization_id retrieved from profiles table
→ organization_id is their transportista ID
```

### Step 2: User Opens Document and Tries to Approve/Reject
```
Click "Aprobar" or "Rechazar" button
→ Browser calls: PATCH /api/company/documents/[id]/status
→ Endpoint receives authenticated user with organization_id
```

### Step 3: Authorization Check
```
verifyAuth() gets user from Supabase session
↓
canChangeDocumentStatus() called with:
  - userId
  - documentId
  - userRole (must be 'admin')
  - userCompanyId (organization_id from profile)
↓
Check 1: Is user role 'admin'?
  If NO → DENY (403)
  If YES → Continue
↓
Check 2: Load document and find conductor_id
  If not found → DENY (403)
  If found → Continue
↓
Check 3: Load conductor and find transportista_id
  If not found → DENY (403)
  If found → Continue
↓
Check 4: Load user profile and find organization_id
  If not found → DENY (403)
  If found → Continue
↓
Check 5: Compare company IDs
  user.organization_id === conductor.transportista_id?
  If NO → DENY (403) "No tienes permiso para cambiar documentos de otra empresa"
  If YES → ALLOW (200) "Status changed"
```

## Testing Instructions

### For Each @labbe.cl Executive:

1. **Login Test**
   ```
   [ ] Can login with @labbe.cl email
   [ ] Redirected to dashboard
   [ ] No auth errors in console
   ```

2. **Profile Load Test**
   - Open browser DevTools → Console
   ```
   [ ] No "[v0] Error updating status" messages
   [ ] See logs like: "[v0] STATUS ENDPOINT - Auth successful..."
   ```

3. **Authorization Test**
   - Open any document from your company's conductors
   ```
   [ ] Click "Aprobar" button
   [ ] Modal appears, can select status
   [ ] Click "Confirmar Rechazo" or "Aprobar"
   [ ] Status changes successfully
   [ ] Document shows new status with checkmark/X
   ```

4. **Cross-Company Security Test**
   - If you can access a document from a DIFFERENT company's conductor
   ```
   [ ] Try to click "Aprobar" or "Rechazar"
   [ ] Should see error: "No tienes permiso para cambiar documentos de otra empresa"
   [ ] Document status should NOT change
   [ ] Should see 403 error in console
   ```

## Debug Logs to Check

### Browser Console (Success)
```
[v0] handleStatusChange called with: { docId, newStatus, reason }
[v0] PATCH response status: 200
[v0] PATCH response data: { success: true, ... }
[v0] Status change successful: ✅ Documento actualizado a aprobado
```

### Server Logs (Success)
```
[v0] STATUS ENDPOINT - Start PATCH request for document: 1235-...
[v0] STATUS ENDPOINT - Auth result: {
  authError: undefined,
  userId: "...",
  email: "ocarrasco@labbe.cl",
  role: "admin",
  org_id: "..." (transportista UUID)
}

[v0] AUTH CHECK START: { userId, documentId, userRole, userCompanyId }

[v0] AUTH - Document lookup: { found: true, error: null }
[v0] AUTH - Conductor lookup: { found: true, transportista_id: "...", error: null }
[v0] AUTH - User profile lookup: { found: true, user_org_id: "...", profileError: null }

[v0] AUTH - Final company comparison: {
  user_transportista_from_profile: "abc-123...",
  conductor_transportista: "abc-123...",  ← Should match
  final_user_transportista: "abc-123..."
}

[v0] AUTH - Company match: {
  userTransportista: "abc-123...",
  conductorTransportista: "abc-123...",
  match: true  ← ✅ CRITICAL: Should be true
}

[v0] AUTH ALLOW - All checks passed: { userId, documentId, userRole, userTransportista }
[v0] STATUS ENDPOINT - AUTHORIZATION APPROVED, changing status...
[v0] STATUS ENDPOINT - Status change successful: { documentId, newStatus }
```

### Server Logs (Authorization Denied)
```
[v0] AUTH DENY - Company mismatch: {
  user_transportista: "labbe-uuid",
  conductor_transportista: "other-uuid"  ← Different company!
}

[v0] STATUS ENDPOINT - AUTHORIZATION DENIED: "No tienes permiso para cambiar documentos de otra empresa"
→ Returns 403 Forbidden
```

## Database Mapping Reference

### profiles table
```
id (UUID) → User ID
email (TEXT) → User email
role (TEXT) → 'admin', 'user', etc.
organization_id (UUID) → ✅ This is the transportista_id
```

### conductores table
```
id (UUID) → Conductor ID
transportista_id (UUID) → ✅ Their company (should match user's organization_id)
```

### uploaded_documents table
```
id (UUID) → Document ID
conductor_id (UUID) → Which conductor this document belongs to
```

## Troubleshooting

### Symptom: Still Getting "Unauthorized" Error

1. **Check role**
   ```sql
   SELECT role FROM profiles WHERE email = 'ocarrasco@labbe.cl';
   -- Should return: 'admin'
   ```

2. **Check organization_id**
   ```sql
   SELECT organization_id FROM profiles WHERE email = 'ocarrasco@labbe.cl';
   -- Should return: a UUID (not NULL)
   ```

3. **Check conductor's transportista_id**
   ```sql
   SELECT transportista_id FROM conductores WHERE id = '<conductor_id>';
   -- Should match the organization_id from above
   ```

4. **Check server logs**
   - Look for "[v0] AUTH" log messages
   - Find where it says DENY or ALLOW
   - Check the comparison values to see if they match

### Symptom: Getting "Company Mismatch" Error

1. **Verify conductor belongs to correct company**
   ```sql
   SELECT id, transportista_id FROM conductores 
   WHERE id = '<conductor_id_from_document>';
   -- Check if transportista_id is labbe's transportista
   ```

2. **Check document assignment**
   ```sql
   SELECT id, conductor_id FROM uploaded_documents 
   WHERE id = '<document_id>';
   -- Check if conductor_id points to a labbe conductor
   ```

3. **Update data if needed**
   ```sql
   UPDATE conductores 
   SET transportista_id = '<labbe_transportista_uuid>'
   WHERE id = '<conductor_id>';
   ```

## Verification Checklist

After deploying the fix:

```
✅ Build passes: npm run build
✅ No TypeScript errors
✅ All @labbe.cl users can login
✅ All @labbe.cl users have role='admin' in database
✅ All @labbe.cl users have organization_id filled in database
✅ All labbe conductores have transportista_id matching labbe's organization_id
✅ Each executive can change status on their company's documents
✅ Cross-company access is blocked with 403 error
✅ Server logs show AUTH ALLOW for same-company access
✅ Server logs show AUTH DENY for cross-company access
✅ No "Unauthorized" errors in browser console
```

## Success Criteria

✅ **All 6 @labbe.cl executives can change document status for their company's conductors**
✅ **Authorization is company-scoped (transportista-scoped)**
✅ **Cross-company access is blocked**
✅ **Clear error messages when authorization fails**
✅ **Detailed logs for debugging**
✅ **Build passes without errors**

## FAQ

**Q: Why transportista_id instead of empresa_id?**
A: The conductores table structure uses transportista_id to reference the company/transportation company that employs the driver.

**Q: What if a conductor has NULL transportista_id?**
A: The authorization will fail (DENY) because the comparison `null !== user_org` will be false.

**Q: Can multiple organizations/transportistas share conductores?**
A: No, each conductor belongs to exactly one transportista (company).

**Q: Why do we need both authentication AND authorization?**
A: Authentication verifies WHO the user is. Authorization verifies WHAT they're allowed to do.
