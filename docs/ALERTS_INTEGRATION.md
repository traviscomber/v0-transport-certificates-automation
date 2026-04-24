# Alerts Integration Documentation

## Current Alert System Status

### ✅ Integrated Endpoints (Triggering Alerts)
1. **Document Upload** - `/api/company/documents/drivers/upload`
   - Triggers: `triggerDocumentUploadedAlert()`
   - Alert Type: info - "Documento subido"

### ⏳ Endpoints That Should Trigger Alerts (Not Yet Integrated)

1. **Document Status Change** - `/api/company/documents/[id]/status`
   - Should Trigger: 
     - status='approved' → success alert "Documento aprobado"
     - status='rejected' → error alert "Documento rechazado"
     - status='expired' → warning alert "Documento vencido"
   - Impact: HIGH - Users need immediate notification of rejections/approvals

2. **Subcontractor Upload** - `/api/company/documents/subcontractors/upload`
   - Should Trigger: info alert "Documento de subcontratista subido"
   - Impact: MEDIUM - Admin tracking of subcontractor documents

3. **Document Deletion** - `/api/company/documents/[id]/delete`
   - Should Trigger: info alert "Documento eliminado"
   - Impact: LOW - Audit trail of document removal

4. **User Management** - `/api/company/users/route.ts` (POST/DELETE)
   - Should Trigger: info alert when users added/removed
   - Impact: MEDIUM - Track user activity

5. **Document Metadata Update** - `/api/company/documents/[id]/metadata`
   - Should Trigger: info alert "Metadata de documento actualizada"
   - Impact: LOW - Track document property changes

### 🔄 Alert Generation Sources

**Current (Stateless - Regenerates Each Call)**
- `/api/alerts/generate` - Checks local data for missing docs, inactive users, system status

**What's Missing (Persistent Event Tracking)**
- Need database table `alerts_log` to track actual events over time
- Need to persist alert triggers as events for later analysis
- Need to track which alerts have been read/dismissed by users

### 📊 Alert Coverage by Module

| Module | Conductores | Documentos | Subcontratistas | Status Changes | Users |
|--------|-------------|-----------|-----------------|---|---|
| Upload | ✅ | ✅ | ❌ | N/A | N/A |
| Status | N/A | ❌ | N/A | ❌ | N/A |
| Delete | N/A | ❌ | ❌ | N/A | N/A |
| Mgmt | N/A | N/A | N/A | N/A | ❌ |

### 🎯 Recommended Implementation Order

**Phase 1 (HIGH PRIORITY)**
1. Add alert trigger to document status changes (approval/rejection)
2. Add alert trigger to subcontractor upload

**Phase 2 (MEDIUM PRIORITY)**
3. Create `alerts_log` table for persistent storage
4. Add alert state management (read/unread/dismissed)
5. Add alert triggers to user management

**Phase 3 (NICE TO HAVE)**
6. Add historical alert analytics
7. Add alert preferences per user role
8. Add email/SMS notification delivery

## How Alerts Work Currently

1. **Generation**: `/api/alerts/generate` runs stateless analysis of local data
2. **Retrieval**: `useGeneratedAlerts` hook fetches alerts (no longer auto-refreshes)
3. **Display**: Alerts shown in `/dashboard/company/alertas` with filters
4. **Persistence**: None - alerts are recalculated each fetch

## How to Add Alert Trigger to an Endpoint

```typescript
// 1. Import the trigger function
import { triggerDocumentStatusAlert } from '@/lib/operations/alert-triggers'

// 2. Call it when the event happens
await triggerDocumentStatusAlert(
  documentId,
  status, // 'approved', 'rejected', 'expired'
  documentName,
  driverId // for linking
)
```

## Testing Alerts

Visit `/dashboard/company/alertas` to see:
- System status (always shows)
- Drivers with incomplete documentation
- Inactive drivers/subcontractors
- Manual refresh button works
- Filters work correctly
