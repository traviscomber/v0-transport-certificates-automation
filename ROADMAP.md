# ChileFlota — Product & Engineering Roadmap

Last updated: 2026-08-09 CLT
Canonical repository: `traviscomber/v0-transport-certificates-automation`
Product architecture: **N3uralia -> ChileFlota -> LABBE**

## Operating rule

This roadmap is the scope-control document for ChileFlota. A stage closes only when its explicit exit criteria are met. New discoveries that are not active P0 security/data-loss incidents are assigned to the appropriate next stage instead of extending the current stage indefinitely.

Release flow:

`implementation -> preview/CI -> Qalito PASS -> merge to main -> production READY -> runtime/data verification -> stage closure`

Cronos owns operational supervision, synchronization health and recovery. Qalito is the mandatory release gate for code/release changes.

---

## Stage 9 — PRT operational hardening and national import closure

**Status: CLOSED — QALITO PASS**

### Closure evidence

- May, June and July 2026 RA1, RA2 and RB batches reached `imported` / EOF.
- No stale active PRT batches remained at closure.
- Cronos reconciliation was clean with no unexplained critical failures.
- May RB and July RB each contain a one-row canonical delta explained by an inter-block upsert identity collision, not missing canonical evidence.
- Qalito final PRT verdict: **PASS**.

### Accounting note

The worker historically counted a row as valid before knowing whether a later cross-block upsert would create a new physical canonical identity or update an existing one. This is an accounting distinction to improve, not evidence of bulk data loss.

---

## Stage 10 — Authentication, authorization and API security boundary

**Status: ACTIVE — BLOCKS 1–3 IN PROGRESS**

### Objective

Make every privileged API and credential-bearing table server-authorized by design without breaking executive, subcontractor, company or conductor workflows.

### Block 1 — Credential-table boundary

**Status: MATERIAL FIX COMPLETE / RELEASE GATE PENDING**

- Replaced RUT-as-password company login with real password verification using bcrypt server-side.
- Removed public SELECT access from `transportista_auth`.
- Verified `anon` and normal `authenticated` roles cannot read credential rows from the sensitive auth tables audited in this block.
- Company-auth PR remains gated until a controlled positive login can be reproduced without inventing or changing production credentials.

### Block 2 — Verified server actor contract

**Status: IMPLEMENTED IN PR #86 / QALITO HOLD**

- Removed email-only staff authentication.
- `/login` now requires a password.
- Supabase Auth users are validated with `signInWithPassword` and roles are sourced from server-side profile data.
- Legacy executive staff compatibility uses bcrypt against `executive_staff.password_hash` on the server.
- Added signed HTTP-only `cf_session` with an 8-hour lifetime.
- Added `requireServerActor()` to revalidate actor identity, active status, role and organization server-side.
- Browser-writable compatibility cookies remain presentation-only and are not sufficient for privileged authorization.
- Protected destructive admin routes including user, profile and document cleanup.
- Protected transportista auto-assignment with verified admin authorization.
- Retired hardcoded one-off executive assignment and runtime schema mutation routes.

### Block 3 — Admin/API perimeter reduction

**Status: ACTIVE**

Completed in the current branch:

- Retired `add-assigned-executive-column` runtime migration endpoint (`410 Gone`).
- Retired `add-rejection-reason` runtime migration endpoint (`410 Gone`).
- Retired `debug-transportista-auth` (`410 Gone`). This endpoint previously queried credential records with service-role privileges and was also the concrete source of a Vercel static-generation timeout.
- Hardened `audit-logs`:
  - GET requires verified admin;
  - POST requires a verified server actor;
  - `user_id`, IP and user-agent are derived server-side instead of trusting client-supplied identity metadata.
- Protected status/document diagnostic routes with verified admin authorization.
- Reduced unnecessary document payload reads in diagnostics where counts are sufficient.

### Remaining Stage 10 hard stop list

1. **Complete privileged route inventory**
   - Classify every remaining `/api/admin/*` route as operational, sensitive read, privileged mutation, migration/debug, or obsolete.
   - Require `requireServerActor()` on every retained privileged route.
   - Retire remaining one-off migration/debug HTTP routes.

2. **Service-role inventory outside `/api/admin`**
   - Identify all routes using `SUPABASE_SERVICE_ROLE_KEY`, `createAdminClient()` or the broad server client.
   - Apply actor/tenant authorization before privileged database operations.
   - Replace `lib/supabase/server.ts` default service-role behavior with explicit least-privilege clients.

3. **Middleware boundary**
   - Remove blanket `/api` public treatment only after retained routes have explicit route-level authorization.
   - Keep explicitly public auth/health endpoints allowlisted rather than using broad prefixes.

4. **Tenant isolation and authorization matrix**
   - Anonymous -> denied on privileged routes.
   - Wrong role -> 403.
   - Wrong tenant -> denied/no cross-tenant data.
   - Invalid/expired session -> 401.
   - Valid role/tenant -> expected operation succeeds.

5. **Session secret**
   - Configure a dedicated `APP_SESSION_SECRET` in Vercel and remove the temporary signing fallback to `SUPABASE_SERVICE_ROLE_KEY`.
   - Secret creation/rotation must follow the controlled infrastructure change process.

6. **Release gate**
   - Latest Vercel preview must be READY.
   - Qalito authorization matrix must PASS.
   - Merge PR #86 only after the above checks.
   - Verify production for auth-related 401/403 behavior and absence of new 5xx/lockout regressions.

### Stage 10 exit criteria

- No credential hash is readable by `anon` or ordinary `authenticated` clients.
- No retained privileged service-role API can execute without an authorized server actor and correct scope.
- No runtime schema migration or credential-debug endpoint remains callable in production.
- Executive, company/subcontractor and conductor primary login flows pass regression.
- Wrong-role and wrong-tenant tests pass.
- Qalito authorization matrix = **PASS**.
- Production has no new auth-related 5xx or lockout regression after release.

---

## Stage 11 — Canonical document workflow unification

**Status: PLANNED**

### Objective

Eliminate divergent definitions of documents and pending work across executive/subcontractor interfaces.

### Scope

- Declare the canonical source for subcontractor document lifecycle.
- Reconcile or retire overlapping flows using `certificates`, `subcontractor_documents`, `uploaded_documents` and queue tables where appropriate.
- Make counters, pending lists, RUT search, detail views and validation actions derive from the same canonical status semantics.
- Enforce consistent RUT normalization at all trust boundaries.
- Ensure executive assignment/scoping is server-side and deterministic.
- Add canonical status transitions and audit: `pending -> approved/rejected/expired/superseded`.
- Add regression coverage for counts versus detail lists.

### Exit criteria

- Pending counts reconcile to pending lists for the same actor/scope.
- Searching a valid RUT cannot lose records because of pagination or client-side post-filtering.
- No customer-visible screen depends on a parallel legacy document source without an explicit compatibility adapter.
- Qalito workflow regression = **PASS**.

---

## Stage 12 — ChileFlota Vehicle & Compliance Intelligence

**Status: PLANNED — PRIORITY AFTER CANONICAL FOUNDATIONS**

### Objective

Turn the canonical document and PRT corpus into decision-ready fleet intelligence rather than leaving evidence as passive storage.

### Delivery sequence

1. **Latest PRT by plate**
   - Canonical latest-status projection from historical PRT evidence.
   - Provenance, revision date, result, expiry, plant/class when present.

2. **Vehicle Intelligence Profile**
   - `plate -> PRT history -> documents -> company -> driver -> alerts -> provenance`.
   - No fake operational vehicles created from the national corpus.

3. **Compliance Snapshot**
   - Explainable states such as OK / Attention / Blocking / Insufficient evidence.
   - Every state links back to canonical evidence.

4. **Instant Fleet Enrichment**
   - Upload or provide a fleet of plates and immediately enrich them from the existing national evidence corpus.

5. **Action-oriented dashboard**
   - What expires soon.
   - What blocks operation.
   - What requires human review.
   - Which supplier/transportista concentrates exceptions.
   - What changed since the previous operating period.

6. **Explainable intelligence**
   - Operational questions over canonical data with evidence links.
   - No opaque consequential score or unsupported AI claim.

### External transport data sequence after the foundation

Integrate one source at a time into the same canonical vehicle identity:

`SII vehicle valuation -> MTT registries -> municipal circulation permits -> CONASET contextual risk -> MOP route/toll data`

Each source requires provenance, reuse/licensing review and a clear product decision before ingestion.

### Exit criteria

- Operational vehicles are automatically enriched from canonical PRT evidence when a valid plate match exists.
- Compliance decisions are traceable to canonical evidence.
- No invented or simulated evidence is used.
- Failed/uncertain matches enter explicit review states.
- Automation is idempotent, observable and recoverable.
- Qalito end-to-end compliance gate = **PASS**.

---

## Stage 13 — Product stabilization and client release package

**Status: PLANNED**

### Objective

Prepare a controlled client-facing ChileFlota baseline after the architectural stages above.

### Scope

- Full role-based regression suite.
- Responsive/mobile checks for operational portals.
- Accessibility and critical UX cleanup.
- Performance review of highest-volume queries/routes.
- Production observability/error-budget baseline.
- Remove remaining dead diagnostic/test routes from customer-facing production.
- Final operator runbook and rollback notes.

### Exit criteria

- No P0/P1 defects in primary client workflows.
- Qalito release gate = **PASS**.
- Cronos health = healthy.
- Production SHA and schema/migration baseline recorded.
- Client-ready release notes produced.

---

## Scope discipline

When a new issue is found:

- **P0** security/data corruption: interrupt the active stage and repair immediately.
- **P1** primary-flow regression: repair within the active stage only if caused by that stage or blocking its exit criteria; otherwise place it at the top of the next stage.
- **P2/P3** improvements: backlog only; do not delay stage closure.

The goal is to finish stages, preserve a known production baseline and prevent continuous development from becoming an undefined permanent phase.
