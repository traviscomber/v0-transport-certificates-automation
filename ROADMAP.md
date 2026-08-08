# TransportesLabbe — Product & Engineering Roadmap

Last updated: 2026-08-08 18:27 CLT
Canonical repository: `traviscomber/v0-transport-certificates-automation`
Current Stage 9 production SHA: `613baf42b44be44eabb3a420e099afdb3ea35d8e`

## Operating rule

This roadmap is the scope-control document for the platform. A stage closes when its explicit exit criteria are met. New discoveries that are not P0 data-loss/security incidents do **not** extend the active stage automatically; they are assigned to the next appropriate stage.

Release flow for every code stage:

`implementation -> preview/CI -> Qalito PASS -> merge to main -> production READY -> runtime/data verification -> stage closure`

Cronos owns operational supervision, synchronization health, queue recovery and production verification. Qalito is the mandatory release gate for code/release changes.

**Documentation rule:** update this `ROADMAP.md` whenever a material stage milestone, production fix, gate decision, closure condition, or stage transition occurs. Live Supabase/Cronos state remains the source of truth for operational counters.

---

## Stage 9 — Operational hardening and synchronization closure

**Status: CLOSING — FINAL PRT BATCH ACTIVE**

### Objective

Finish the current operational hardening cycle and leave imports, reconciliation and customer-visible pending-document search in a stable, observable production state.

### Completed

- Cronos semantic control plane deployed.
- `cronos_reconciliation` scheduled and verified in production.
- Reconciliation schema bug fixed (`document_text_extractions.document_id`).
- Production reconciliation repeatedly completes with `failed_count = 0`.
- Critical worker/RPC exposure hardening blocks applied to internal service-role workflows.
- Pending-document RUT search root cause reproduced and fixed.
- Pending search now filters canonical `subcontractor_rut` in PostgreSQL before the result limit.
- Production verification of a previously invisible RUT returns the expected pending documents.
- June 2026 RA1, RA2 and RB are fully `imported`.
- PRT starvation root cause fixed: `prt_import_stream` now drains oldest eligible periods first instead of continually preferring newer periods.
- PR #83 passed both Vercel previews and was merged to `main`.
- Post-fix production behavior verified: May 2026 RA2 resumed ahead of July RB, proving the oldest-first drain rule is active.
- May 2026 RA2 is fully `imported`: 103,279 rows read, 102,824 valid and 455 rejected/duplicate-accounted.
- May 2026 RB is actively draining under the corrected oldest-first policy and has advanced to cursor 260,000.
- Latest observed PRT state has no error and no stale active PRT batch.

### Remaining work — hard stop list

Only these items may keep Stage 9 open:

1. **Drain final Stage 9 PRT import**
   - May 2026 RB -> EOF / imported. Current verified cursor: 260,000.
   - Current verified May RB accounting: 260,000 rows read / 259,598 valid / 402 rejected/duplicate-accounted.
   - No unexpected stale batches left in `importing` / `processing`.
   - July 2026 RB remains intentionally paused at cursor 180,000 behind May RB and does not extend Stage 9 closure scope.

2. **Final PRT canonical reconciliation**
   - Verify batch row counts against `prt_vehicle_records`.
   - Verify duplicate/rejected accounting.
   - Verify latest-vehicle projection can be produced without unexplained drift.
   - Record final canonical counts as closure evidence.

3. **Operational release gate**
   - `cronos_reconciliation` clean after PRT drain.
   - No stale claims in critical queues.
   - No recent unexplained failed critical jobs.
   - Qalito final Stage 9 verdict = PASS.

### Explicitly deferred from Stage 9

The following findings are important but do not extend Stage 9 unless they become active P0 incidents:

- General `/api/*` authentication boundary hardening.
- Legacy credential-table redesign (`transportista_auth`, `conductor_auth`, `companies`, related login tables).
- Full tenant-aware RLS redesign.
- Broader index cleanup/performance refactoring.
- UI redesign or new product features.
- Full PRT Intelligence Layer beyond the Stage 9 reconciliation proof; this is prioritized for Stage 12.

### Stage 9 exit condition

Stage 9 closes immediately when the three remaining work groups above are PASS. At closure, create a short closure record with production SHA, PRT counts, Cronos health and Qalito verdict. Do not add additional backlog to Stage 9 after that point.

---

## Stage 10 — Authentication, authorization and API security boundary

**Status: NEXT**

### Objective

Make every privileged API and credential-bearing table server-authorized by design without breaking executive, subcontractor or conductor workflows.

### Scope

- Inventory all `/api/*` routes by actor and privilege level.
- Remove the current blanket API pass-through pattern where privileged routes rely only on obscurity or client behavior.
- Define one server-side authorization contract for admin, ejecutiva, subcontractor and conductor roles.
- Protect routes that use `SUPABASE_SERVICE_ROLE_KEY` from unauthenticated invocation.
- Audit `transportista_auth`, `conductor_auth`, `companies`, `executive_staff` and any table containing password hashes or login secrets.
- Remove public/client access to credential hashes.
- Replace unsafe legacy credential access with server-only login verification.
- Audit and normalize RLS policies for exposed business tables.
- Add negative authorization tests: anonymous, wrong role, wrong tenant, expired/invalid session.
- Add positive tests for each real portal role.

### Exit criteria

- No credential hash is readable by `anon` or normal `authenticated` clients.
- No privileged service-role API can be invoked without an authorized server session/contract.
- Executive, subcontractor and conductor login/primary flows pass regression.
- Qalito authorization matrix = PASS.
- Production has no new auth-related 5xx/lockout regression after release.

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
- Add canonical status transition/audit contract: pending -> approved/rejected/expired/superseded.
- Add regression coverage for counts vs detail lists.

### Exit criteria

- A pending count always reconciles to the pending list for the same actor/scope.
- Searching a valid RUT cannot lose records because of pagination or client-side post-filtering.
- No customer-visible screen depends on a parallel legacy document source without an explicit compatibility adapter.
- Qalito workflow regression = PASS.

---

## Stage 12 — Compliance intelligence and PRT operationalization

**Status: PLANNED — PRIORITY AFTER CANONICAL FOUNDATIONS**

### Objective

Turn the stable canonical document and PRT corpus into reliable operational decisions and a reusable vehicle-intelligence layer rather than leaving PRT as passive storage.

### Priority scope

- Build a canonical `latest PRT by plate` projection over the historical PRT corpus.
- Enrich operational `vehiculos` from that projection without creating hundreds of thousands of fake operational vehicles.
- Finalize PRT -> vehicle -> compliance matching contract.
- Define confidence and no-match handling for vehicle evidence.
- Make new operational vehicles immediately benefit from already-imported PRT history.
- Expose traceable PRT status: latest revision, result, expiry, plant/class when present, and source provenance.
- Consolidate worker/company reconciliation into decision-ready outputs.
- Improve exception queues for human review.
- Introduce safe auto-recovery only for proven reversible stale states.
- Keep consequential business decisions human-reviewable unless explicitly approved for automation.

### Exit criteria

- Operational vehicles are automatically enriched from canonical PRT evidence when a valid plate match exists.
- Compliance decisions are traceable to canonical evidence.
- No invented/simulated evidence is used.
- Failed/uncertain matches enter an explicit review state.
- Automation is idempotent, observable and recoverable.
- Qalito end-to-end compliance gate = PASS.

---

## Stage 13 — Product stabilization and client release package

**Status: PLANNED**

### Objective

Prepare a controlled client-facing release baseline after the architectural stages above.

### Scope

- Full role-based regression suite.
- Responsive/mobile checks for operational portals.
- Accessibility and critical UX cleanup.
- Performance review of highest-volume queries and routes.
- Production observability/error budget baseline.
- Remove dead diagnostic/test routes from customer navigation and evaluate removal from production where safe.
- Final operator runbook and rollback notes.

### Exit criteria

- No P0/P1 open defects in primary client workflows.
- Qalito release gate = PASS.
- Cronos health = healthy.
- Production SHA and schema/migration baseline recorded.
- Client-ready release notes produced.

---

## Current live closure snapshot

Verified 2026-08-08 18:27 CLT:

- Current Stage 9 production SHA observed in recent jobs: `613baf42b44be44eabb3a420e099afdb3ea35d8e`.
- May 2026 RA1: `imported`, 13,895 rows read / 13,842 valid / 53 rejected.
- May 2026 RA2: `imported`, 103,279 rows read / 102,824 valid / 455 rejected/duplicate-accounted.
- May 2026 RB: `importing`, cursor 260,000 / 259,598 valid / 402 rejected/duplicate-accounted — final Stage 9 PRT batch actively draining.
- July 2026 RB: `profiled`, cursor 180,000 and intentionally waiting behind May RB.
- Stale active PRT batches older than 30 minutes: `0`.

These counters are a snapshot, not a permanent specification. Cronos/Supabase live state is the source of truth for closure.

---

## Scope discipline

When a new issue is found:

- **P0** security/data corruption: interrupt the active stage and repair immediately.
- **P1** primary-flow regression: repair within the active stage only if caused by that stage or blocking its exit criteria; otherwise place it at the top of the next stage.
- **P2/P3** improvements: backlog only; do not delay stage closure.

The purpose of this rule is to finish stages, preserve a known production baseline and prevent continuous development from becoming an undefined permanent phase.
