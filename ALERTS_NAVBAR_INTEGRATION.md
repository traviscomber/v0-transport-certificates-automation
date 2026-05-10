# 🔔 Alerts Navbar Integration

## ✅ Alerts Bell Now Visible in Dashboard Navbar

The compliance alert system is now fully integrated into the dashboard navigation bar.

### Where to See It

**Location:** Right side of the dashboard header, next to the user info

```
┌─────────────────────────────────────────────────────────────┐
│ ☰  Transportes Labbé         [🔔] [User Info] [Logout]     │
│                              ↑
│                         Alerts Bell
└─────────────────────────────────────────────────────────────┘
```

### Visual Indicators

- **Blue Bell Icon**: No active alerts
- **Red Pulsing Dot**: Active alerts waiting for acknowledgment
- **Count Badge**: Shows number of unread alerts
- **Color-Coded List**: 
  - 🔴 Red: High severity (expired docs, critical issues)
  - 🟡 Amber: Medium severity (docs expiring soon)
  - 🔵 Blue: Low severity (info messages)

### Features

#### 1. Real-Time Updates
- Alerts fetch automatically on page load
- Subscribe to database changes in real-time
- New alerts appear instantly without page refresh

#### 2. Quick Preview
Click the bell icon to see:
- 5 most recent active alerts
- Alert title, message, and timestamp
- Severity indicator with icon
- Checkmark button to acknowledge

#### 3. Acknowledge Alerts
- Click ✓ button to mark alert as handled
- Alert disappears from dropdown
- Calls `/api/compliance/alerts/acknowledge` endpoint
- Alert status changes to "acknowledged" in database

#### 4. View All Alerts
- Button at bottom: "Ver todas las alertas"
- Links to `/dashboard/alerts` for full alerts page
- See all alerts with more details

### Code Structure

```
components/layout/
├── alerts-bell.tsx          ← New alerts component
└── dashboard-layout.tsx      ← Updated to import AlertsBell

API Endpoints:
├── /api/compliance/alerts                 ← Fetch active alerts
├── /api/compliance/alerts/acknowledge     ← Mark as acknowledged
└── /api/compliance/alerts/resolve         ← Mark as resolved
```

### How It Works

1. **On Mount**
   - Component initializes and checks `isMounted`
   - Fetches compliance_alerts from database
   - Counts unread alerts
   - Sets up real-time subscription

2. **Real-Time Updates**
   - Supabase channel listens for ANY changes to compliance_alerts table
   - When new alert inserted → fetches latest alerts
   - Bell icon updates with new count
   - Pulsing dot appears if count > 0

3. **User Interaction**
   - Click bell → dropdown opens/closes
   - Click checkmark → calls acknowledge endpoint
   - Click outside → dropdown closes
   - Click "Ver todas las alertas" → navigates to full alerts page

4. **Data Flow**
   ```
   conductor uploads document
           ↓
   compliance alert created
           ↓
   database insert triggers
           ↓
   realtime subscription fires
           ↓
   alerts-bell component refetches
           ↓
   UI updates with new alert
           ↓
   admin sees bell icon update
   ```

### Database Tables

**compliance_alerts** (stores all alerts)
```sql
- id: UUID (primary key)
- entity_type: "conductor" | "company"
- entity_id: UUID (conductor_id or transportista_id)
- alert_type: "document_submitted" | "document_expired" | "document_expiring_soon"
- severity: "low" | "medium" | "high" | "info"
- title: string (display name)
- message: string (detailed message)
- status: "active" | "acknowledged" | "resolved"
- created_at: timestamp
- acknowledged_at: timestamp (when user clicked checkmark)
- resolved_at: timestamp (when admin resolved)
```

### API Endpoints

#### GET /api/compliance/alerts
Fetch all active compliance alerts

```bash
curl http://localhost:3000/api/compliance/alerts

Response:
{
  "alerts": [
    {
      "id": "uuid...",
      "title": "Documento Subido: Licencia de Conducir",
      "message": "Documento enviado para revisión",
      "severity": "medium",
      "alert_type": "document_submitted",
      "status": "active",
      "created_at": "2026-05-08T10:30:00Z"
    }
  ]
}
```

#### POST /api/compliance/alerts/acknowledge
Mark alert as acknowledged

```bash
curl -X POST http://localhost:3000/api/compliance/alerts/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "uuid..."}'

Response:
{
  "success": true,
  "message": "Alert acknowledged"
}
```

#### POST /api/compliance/alerts/resolve
Mark alert as resolved

```bash
curl -X POST http://localhost:3000/api/compliance/alerts/resolve \
  -H "Content-Type: application/json" \
  -d '{"alert_id": "uuid..."}'

Response:
{
  "success": true,
  "message": "Alert resolved"
}
```

### Styling

Uses Tailwind CSS with theme colors:
- Primary: Button colors, active states
- Destructive/Red: High severity
- Amber: Medium severity
- Blue: Low severity
- Muted-foreground: Secondary text

Responsive:
- Mobile: Compact layout, scrollable on small screens
- Desktop: Full width dropdown with scroll

### Performance

- **Lazy Loading**: Component only fetches on mount (hydration-safe)
- **Batched Updates**: Real-time subscription refetches all alerts (not individual updates)
- **Caching**: Supabase client-side caching reduces API calls
- **Limits**: Only loads 5 most recent alerts in dropdown (rest on full page)

### Troubleshooting

**Alerts not showing?**
1. Check if alerts exist in `compliance_alerts` table
2. Verify `status = 'active'` (not acknowledged/resolved)
3. Check browser console for fetch errors
4. Verify `/api/compliance/alerts` endpoint is accessible

**Acknowledge button not working?**
1. Check `/api/compliance/alerts/acknowledge` endpoint
2. Verify alert ID is being sent correctly
3. Check browser console network tab
4. Verify endpoint returns success response

**Real-time not updating?**
1. Check Supabase connection
2. Verify channel subscription is active
3. Check browser console for subscription errors
4. Try page refresh to see if manual fetch works

### Testing

```javascript
// Test in browser console
// Open alerts dropdown
document.querySelector('button[aria-label="Alert Bell"]').click()

// Check number of alerts shown
document.querySelectorAll('[class*="bg-red-50"]').length

// Click acknowledge button
document.querySelector('button:contains("✓")').click()
```

### Future Enhancements

- [ ] Filter alerts by severity/type
- [ ] Sort alerts by date/priority
- [ ] Group by conductor/company
- [ ] Email notifications for high severity
- [ ] SMS alerts for critical issues
- [ ] Archive old alerts
- [ ] Search across alerts
- [ ] Bulk acknowledge/resolve
- [ ] Alert preferences per user
- [ ] Do not disturb time settings

### Related Files

- `components/layout/alerts-bell.tsx` - React component
- `components/layout/dashboard-layout.tsx` - Integration point
- `app/api/compliance/alerts/route.ts` - GET endpoint
- `app/api/compliance/alerts/acknowledge/route.ts` - POST endpoint
- `app/api/compliance/alerts/resolve/route.ts` - POST endpoint
- `lib/compliance/audit-system.ts` - Alert generation logic

---

**Status**: ✅ Production Ready

The alerts bell is live and ready to display compliance notifications in real-time!
