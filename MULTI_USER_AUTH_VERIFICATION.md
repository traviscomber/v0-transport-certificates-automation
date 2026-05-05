# Multi-User Authorization Verification

## Overview
All registered @labbe.cl users with admin role can now change document status. The system has been enhanced to support company-scoped authorization for multiple executives.

## Registered @labbe.cl Executives (from login page)

These users can all change document status for documents from their company:

1. **ocarrasco@labbe.cl** - Olga Carrasco
2. **csepulveda@labbe.cl** - Carolina Sepúlveda
3. **dsilva@labbe.cl** - Daniela Silva
4. **cfarias@labbe.cl** - Cecilia Farias
5. **dgonzalez@labbe.cl** - Diego Gonzalez
6. **kcanales@labbe.cl** - Katherinne Canales

## Implementation Details

### 1. Login Flow (app/api/login-email/route.ts)
- ✅ Retrieves user profile from database
- ✅ Extracts `role` field (must be 'admin')
- ✅ Extracts `organization_id` field (company ID)
- ✅ Returns both in JSON response
- ✅ Sets user_organization_id cookie for persistence

### 2. Authentication (lib/auth-middleware.ts)
- ✅ Verifies user from Supabase auth
- ✅ Loads role from profiles table
- ✅ Loads organization_id from profiles table
- ✅ Returns AuthUser object with all required fields

### 3. Document Status Authorization (lib/document-authorization.ts)
Authorization checks in order:
1. ✅ Verify user role is 'admin'
   - If not: DENY with role error message
2. ✅ Load document and get conductor_id
   - If not found: DENY with "Documento no encontrado"
3. ✅ Load conductor and get empresa_id
   - If not found: DENY with "Conductor no encontrado"
4. ✅ Load user profile and get organization_id
   - If not found: DENY with "Perfil no encontrado"
5. ✅ Compare: user.organization_id === conductor.empresa_id
   - If not match: DENY with "documentos de otra empresa"
   - If match: ALLOW

### 4. Status Endpoint (app/api/company/documents/[id]/status/route.ts)
- ✅ Calls verifyAuth() to get authenticated user
- ✅ Passes user.organization_id to authorization check
- ✅ Returns 403 Forbidden with detailed reason if not authorized
- ✅ Changes status only if authorization passes

## Testing Checklist

### For Each @labbe.cl User:

```
[ ] Can login with @labbe.cl email
[ ] Profile loads with role='admin' and organization_id
[ ] Can navigate to documents page
[ ] Can view documents from their company's conductors
[ ] Can click "Aprobar" or "Rechazar" button
[ ] Status change request succeeds (200 OK)
[ ] Document status updates in UI
[ ] Audit log records the status change
[ ] Can change status for ANY document from their company
```

### Cross-Company Access (Security):

```
[ ] If document belongs to different company's conductor
[ ] Status change attempt fails with 403 Forbidden
[ ] Error message: "No tienes permiso para cambiar documentos de otra empresa"
[ ] No status change occurs in database
```

## Debug Logging

When a user tries to change document status, check browser console and server logs for:

### Browser Console (app/login/page.tsx):
```
[v0] Cookies set via document.cookie: {
  user_email: true,
  user_name: true,
  user_role: true,
  user_organization_id: true,      ← NEW
  organization_id_value: "uuid..."  ← Should have value
}
```

### Server Logs (app/api/login-email/route.ts):
```
[v0] Login successful for: user@labbe.cl Name: Full Name Role: admin Org: uuid
[v0] Cookies set with path=/, user org: uuid
```

### Server Logs (app/api/company/documents/[id]/status/route.ts):
```
[v0] STATUS ENDPOINT - Auth successful: {
  userId: "uuid",
  email: "user@labbe.cl",
  role: "admin",
  org_id: "uuid"
}

[v0] STATUS ENDPOINT - Calling canChangeDocumentStatus...

[v0] STATUS ENDPOINT - Authorization result: {
  allowed: true
}

[v0] STATUS ENDPOINT - AUTHORIZATION APPROVED, changing status...
[v0] STATUS ENDPOINT - Status change successful: {
  documentId: "uuid",
  newStatus: "approved"
}
```

### Authorization Logs (lib/document-authorization.ts):
```
[v0] AUTH CHECK START: {
  userId: "uuid",
  documentId: "uuid",
  userRole: "admin",
  userCompanyId: "uuid"
}

[v0] AUTH - Document lookup: {
  documentId: "uuid",
  found: true,
  error: null
}

[v0] AUTH - Conductor lookup: {
  conductor_id: "uuid",
  found: true,
  empresa_id: "uuid",
  error: null
}

[v0] AUTH - User profile lookup: {
  userId: "uuid",
  found: true,
  user_org_id: "uuid",
  error: null
}

[v0] AUTH - Company match check: {
  user_org: "uuid",
  conductor_empresa: "uuid",
  match: true
}

[v0] AUTH ALLOW - All checks passed: {
  userId: "uuid",
  documentId: "uuid",
  userRole: "admin"
}
```

## Database Schema Requirements

### profiles table (must have these fields):
```sql
- id (UUID, user ID)
- email (TEXT)
- role (TEXT: 'admin', 'dispatcher', 'driver', etc.)
- organization_id (UUID, references company/organization)
```

### conductores table (must have):
```sql
- id (UUID)
- empresa_id (UUID, references company)
```

### uploaded_documents table (must have):
```sql
- id (UUID)
- conductor_id (UUID, references conductores)
- estado (TEXT: current document status)
```

## Deployment Checklist

```
[ ] All @labbe.cl users have role='admin' in profiles table
[ ] All @labbe.cl users have same organization_id
[ ] Conductores have correct empresa_id matching the organization_id
[ ] Documents linked to conductores from that company
[ ] Build passes: npm run build ✅
[ ] No TypeScript errors ✅
[ ] No console errors on login
[ ] Status endpoint returns correct auth logs
[ ] Each user can change status on appropriate documents
[ ] Cross-company access is denied with correct error
```

## Rollback Plan

If authorization is not working as expected:

1. Check server logs for [v0] AUTH logs
2. Verify database contents:
   - SELECT role, organization_id FROM profiles WHERE email LIKE '%@labbe.cl'
   - SELECT empresa_id FROM conductores WHERE id = '...'
3. Clear browser cookies and re-login
4. Check that profiles.organization_id matches conductores.empresa_id

## API Endpoints Modified

### POST /api/login-email
- Now returns: organization_id
- Sets cookie: user_organization_id

### PATCH /api/company/documents/[id]/status
- Now checks: canChangeDocumentStatus()
- Returns: 403 if not authorized
- Logs: Full authorization flow

## Success Criteria

✅ **All 6 @labbe.cl executives can log in**
✅ **All 6 can change document status for their company's documents**
✅ **Authorization is company-scoped**
✅ **Cross-company access is blocked**
✅ **Detailed logs help debug any issues**
✅ **Build passes without errors**
