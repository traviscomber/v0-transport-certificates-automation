# Phase 1: Database Schema Setup

## Overview
This creates 5 new tables to support operational requirements:
1. **applicants** - Postulantes/candidates
2. **driver_licenses** - Driver license tracking (A2→A5 changes)
3. **driver_certifications** - Professional certifications (ADR, safety, etc)
4. **driver_liquidations** - Payment/liquidation status tracking
5. **subcontractor_drivers** - Subcontractor driver relationships

## How to Execute

### Option 1: Direct SQL in Supabase (Recommended)
1. Go to https://supabase.com → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content from `/scripts/phase1_new_tables.sql`
5. Paste into the editor
6. Click **Run**
7. Wait for "Query succeeded" message

### Option 2: Via psql (if you have CLI access)
```bash
psql -h {host} -U postgres -d {database} -f scripts/phase1_new_tables.sql
```

## What Gets Created

### New Tables:
- `applicants` - Candidate management with background check tracking
- `driver_licenses` - License type (A2/A5), expiry, and law change dates
- `driver_certifications` - Professional certs with expiry dates
- `driver_liquidations` - Payment status (draft→pending→approved→paid)
- `subcontractor_drivers` - Links subcontractors to drivers with vehicle info

### Modified Tables:
- `organizations` - Added: provider_rut, service_type, is_active
- `reports` - Added: enabled, requires_payment, payment_status
- `certificates` - Added: standardized_filename

### Indexes Created:
- Performance indexes on company_id, status, driver_id, expiry_date, period dates

### RLS Policies:
- Row-level security for multi-tenant data isolation
- Permission rules by role (admin, manager, driver)

## Next Steps

After running this migration:
1. Proceed to **Phase 2**: Update driver management UI
2. Add filters for company/RUT/tracto
3. Display license changes and certification status

## Rollback (if needed)

Drop tables in this order:
```sql
DROP TABLE IF EXISTS public.subcontractor_drivers CASCADE;
DROP TABLE IF EXISTS public.driver_liquidations CASCADE;
DROP TABLE IF EXISTS public.driver_certifications CASCADE;
DROP TABLE IF EXISTS public.driver_licenses CASCADE;
DROP TABLE IF EXISTS public.applicants CASCADE;
```

Then remove added columns:
```sql
ALTER TABLE public.organizations DROP COLUMN IF EXISTS provider_rut;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS service_type;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.reports DROP COLUMN IF EXISTS enabled;
ALTER TABLE public.reports DROP COLUMN IF EXISTS requires_payment;
ALTER TABLE public.reports DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.certificates DROP COLUMN IF EXISTS standardized_filename;
```
