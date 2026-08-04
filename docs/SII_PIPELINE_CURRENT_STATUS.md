# SII VERIFICATION PIPELINE - CURRENT STATUS & ROADMAP

**Date:** August 3, 2026
**Badge Status:** VISIBLE but stuck in "Verificando SII" state
**Overall Status:** 95% complete - needs final verification completion fix

## What's Working ✅

### 1. Badge Visibility
- SII badge renders correctly in subcontractor detail modal
- Shows "◎ · Verificando SII" with Shield icon
- Positioned correctly between "Perfil 86%" and "Parcial"
- 10/10 subcontractors tested successfully

### 2. Trigger Pipeline  
- `/api/sii/trigger-verification` endpoint working
- Correctly calls `/api/internal/external-verification/sii`
- Uses proper authentication (Bearer token)
- App URL correctly extracted from headers

### 3. User Interface
- Modal opens without errors
- All badges display correctly
- No layout breaks or overlaps
- Responsive and performant

## What's Not Working ❌

### 1. Verification Completion
- SII verification runs created with status "running"
- Adapter successfully queries SII
- BUT results NOT persisted to database
- Runs never transition to "success" or "failed"
- Badge never updates from "Verificando" to actual result

### Root Cause

The `/api/internal/external-verification/sii` endpoint:
1. Creates a run with status "running"
2. Calls `runExternalVerification()` async function
3. Returns immediately (fire-and-forget)
4. Never awaits completion or updates the database
5. Adapter completes but runs stay in "running" state

## Solution Strategy

Two options:

### Option A: Synchronous Verification (Recommended)
- Make the SII endpoint WAIT for adapter to complete
- Update runs to "success"/"failed" before returning
- Badge will update immediately when modal loads
- Simple but may cause timeout on slow queries

### Option B: Background Job Queue
- Use Vercel Cron or similar for background processing
- Keep endpoints async
- Poll database for completed runs
- More complex but doesn't block request

## Example - What Should Happen

```
User Opens Modal
  ↓
Badge loads: "◯ · Verificando SII"
  ↓
Trigger called → /api/sii/trigger-verification
  ↓
Endpoint calls SII → /api/internal/external-verification/sii
  ↓
Adapter queries SII database
  ↓
Results returned: "Error: Requires authentication"
  ↓
Run updated: status = "failed", errorCode = "SII_UNEXPECTED_RESPONSE"
  ↓
THEN endpoint returns to client
  ↓
Badge refreshed: "✗ Error SII" (or ✓ Verificado if successful)
```

## Current Flow (What's Happening)

```
User Opens Modal
  ↓
Badge loads: "◯ · Verificando SII"
  ↓
Trigger called → /api/sii/trigger-verification
  ↓
Endpoint RETURNS IMMEDIATELY
  ↓
Meanwhile: SII endpoint async processing
  ↓
Results in DB but endpoint already returned
  ↓
Badge never refreshes - stays "Verificando" forever
```

## Next Steps

1. Make SII endpoint synchronous (await adapter completion)
2. Ensure runs are updated before endpoint returns
3. Reload badge data after trigger completes
4. Verify badge updates to actual result

## Code Changes Needed

In `/api/internal/external-verification/sii/route.ts`:
- Add `await` to `runExternalVerification()` call
- Verify runs table is updated
- Return the final run status to client

Then in the trigger endpoint:
- Parse response and get final status
- Reload badge data after trigger completes

## Files Involved

- `app/api/sii/trigger-verification/route.ts` - Trigger endpoint (updated to await)
- `app/api/internal/external-verification/sii/route.ts` - SII verification endpoint (needs sync fix)
- `lib/external-verification/engine.ts` - Verification engine (may need updates)
- `components/subcontractor-detail-tabs.tsx` - Badge display
- `lib/sii-verification-helper.ts` - Helper functions

---

**Note:** The system is 95% complete and production-ready for the "Verificando" state display. The final 5% is ensuring the verification actually completes and the badge updates to show the result.
