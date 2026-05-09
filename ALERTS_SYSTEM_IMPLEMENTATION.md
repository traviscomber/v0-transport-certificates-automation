# Enhanced Alerts System - Implementation Complete

## Overview
Implemented a comprehensive alerts system with **ejecutiva-based filtering** and **direct action CTAs** for managing subcontractors and transportistas documents.

## What Was Built

### 1. Database Schema (025_enhance_alerts_table.sql)
Added columns to `alerts` table for proper tracking and ejecutiva assignment:
- `transportista_id` - Link to transportista
- `subcontratista_id` - Link to subcontratista
- `ejecutiva_nombre` - Name of assigned ejecutiva (e.g., "Olga", "Carolina")
- `status` - Alert status: pendiente → actioned → resuelto
- `action_type` - approve | reject | request_info
- `action_notes` - Notes added by ejecutiva
- `actioned_by` - Who took the action
- `actioned_at` - When action was taken

Indexes created for fast filtering by ejecutiva and status.

### 2. Alert Types & Utilities (lib/alerts/)
**types.ts:**
- Enhanced `Alert` interface with all new fields
- `AlertAction` interface for tracking actions
- `AlertSummary` interface for statistics
- `AlertFilterOptions` interface for query parameters

**utils.ts:**
- `filterAlertsByEjecutiva(alerts, nombre)` - Filter only ejecutiva's alerts
- `filterAlertsByStatus(alerts, status)` - Filter by state
- `getStatusLabel()`, `getPriorityLabel()` - Human-readable labels
- Color utilities for UI styling
- `formatAlertTime()` - Relative time formatting

### 3. API Endpoints

#### GET /api/alerts (Updated)
```
Parameters:
- ejecutiva: string (filter by ejecutiva_nombre)
- status: 'pendiente' | 'actioned' | 'resuelto'
- priority: 'critical' | 'high' | 'medium' | 'low'
- limit: number (default 100)
- offset: number (default 0)

Response: { alerts[], total, ejecutiva }
```

Example:
```bash
GET /api/alerts?ejecutiva=Olga&status=pendiente
# Returns only Olga's pending alerts
```

#### POST /api/alerts/{id}/action (New)
```
Body: {
  action: 'approve' | 'reject' | 'request_info',
  notes?: string
}

Header:
- x-ejecutiva-name: string (ejecutiva taking action)

Response: { success, alert, message }

Side Effects:
1. Updates alert.status = 'actioned'
2. Updates related document.estado based on action
3. Creates follow-up alert with action result
4. Records ejecutiva name and timestamp
```

### 4. AlertActionCard Component (components/alert-action-card.tsx)
Interactive card displayed for each alert showing:

**Display:**
- Alert title, message, priority badge
- Document metadata (conductor ID, transportista, document type)
- Current execution status

**Actions (Direct CTAs):**
- ✓ **Aprobar** (green) - Approve document, sets estado='aprobado'
- ✗ **Rechazar** (red) - Reject document, sets estado='rechazado'
- ⓘ **Solicitar Info** (yellow) - Request more info, keeps pendiente

**User Flow:**
1. Click action button
2. Optional notes textarea appears
3. Confirm action with button
4. API processes, shows loading state
5. Success notification appears
6. Alert updates to show "Procesada" state

### 5. Enhanced AlertasPage (/app/dashboard/company/alertas/page.tsx)

**Features:**
- Displays alerts only for logged-in ejecutiva
- Currently filters for "Olga" (will use user session in production)
- Shows "Tus Alertas" header with ejecutiva name
- Updated stats cards with "Pendientes" metric

**Filters:**
- Search by title/message
- Filter by status (Pendiente/Procesada/Resuelto)
- Filter by priority (Crítica/Alta/Media/Baja)
- Clear filters button

**Display:**
- Uses `AlertActionCard` for each alert instead of generic list
- Color-coded by status: Green=Resuelto, Orange=High priority, etc.
- Shows action status inline

## How to Use

### For Ejecutivas (e.g., Olga)
1. Go to Alertas dashboard
2. See only your assigned alerts
3. Click action button directly on alert
4. Add optional notes
5. Confirm action
6. Document updates automatically

### For Admins (Data Setup)
1. When creating alert, include `ejecutiva_nombre` field
2. Example alert creation:
```sql
INSERT INTO alerts (title, message, ejecutiva_nombre, status, metadata, ...)
VALUES ('Documento Pendiente', 'RUT vencido', 'Olga', 'pendiente', {...})
```

3. System automatically filters by ejecutiva on display

## Why No Data After May 4?

The document mentioned the last alert was on May 4 at 11:07. This is likely because:
1. Test data load ended on May 4 (CSV import final batch)
2. No ongoing data ingestion after that date
3. No automated trigger to generate new alerts

**Solution for ongoing alerts:**
- Set up Supabase trigger on `uploaded_documents` INSERT/UPDATE
- Auto-generate alerts when:
  * Document status changes
  * Document expires soon (< 30 days)
  * New document uploaded awaiting review
- Use webhook or pg_cron for scheduled checks

## Next Steps (Optional Enhancements)

1. **User Session Integration**
   - Replace hardcoded "Olga" with actual logged-in user
   - Get ejecutiva name from `auth.users` profile

2. **Automated Alert Generation**
   - Set up Supabase trigger for document changes
   - Pre-generate alerts for expiring documents

3. **Notifications**
   - Send email/SMS when alert created for ejecutiva
   - Push notifications for pending actions

4. **Audit Trail**
   - Log all alert actions for compliance
   - Show action history on each alert

5. **Batch Actions**
   - Approve/reject multiple alerts at once
   - Filter and bulk update status

## Files Created/Modified

**Created:**
- `scripts/025_enhance_alerts_table.sql`
- `lib/alerts/types.ts`
- `lib/alerts/utils.ts`
- `components/alert-action-card.tsx`
- `app/api/alerts/[id]/action/route.ts`

**Modified:**
- `app/api/alerts/route.ts` - Added ejecutiva filtering
- `app/dashboard/company/alertas/page.tsx` - New UI with AlertActionCard

## Testing Checklist

- [ ] Olga logs in and sees only her alerts
- [ ] Clicking "Aprobar" button on an alert updates document status
- [ ] Notes are saved and displayed when viewing actioned alerts
- [ ] "Procesada" state shows green success indicator
- [ ] Follow-up alert created after action (shows in history)
- [ ] Filters work (status, priority, search)
- [ ] Different ejecutivas see different alerts
