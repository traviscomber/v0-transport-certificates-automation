# TransportesLabbe — Product & Engineering Roadmap

Last updated: 2026-08-09 10:11 CLT
Canonical repository: `traviscomber/v0-transport-certificates-automation`
Current observed production SHA: `284026acb72dacef1357a0270792547eb83a978b`

## Operating rule

This roadmap is the scope-control document for the platform. A stage closes when its explicit exit criteria are met. New discoveries that are not P0 data-loss/security incidents do **not** extend the active stage automatically; they are assigned to the next appropriate stage.

Release flow for every code stage:

`implementation -> preview/CI -> Qalito PASS -> merge to main -> production READY -> runtime/data verification -> stage closure`

Cronos owns operational supervision, synchronization health, queue recovery and production verification. Qalito is the mandatory release gate for code/release changes.

**Documentation rule:** update this `ROADMAP.md` whenever a material stage milestone, production fix, gate decision, closure condition, or stage transition occurs. Live Supabase/Cronos state remains the source of truth for operational counters.

---

## Stage 9 — Operational hardening and synchronization closure

**Status: CLOSING — MAY COMPLETE; FINAL NATIONAL PRT BATCH ACTIVE**

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
- PRT starvation root cause fixed: `prt_import_stream` drains oldest eligible periods first instead of continually preferring newer periods.
- PR #83 passed both Vercel previews and was merged to `main`.
- May 2026 RA1, RA2 and RB are fully `imported`.
- June 2026 RA1, RA2 and RB are fully `imported`.
- July 2026 RA1 and RA2 are fully `imported`.
- May 2026 RB final source accounting: 531,180 rows read / 526,158 worker-valid / 5,022 duplicate/rejected-accounted.
- May 2026 RB canonical reconciliation identified a one-row inter-block upsert collision: 526,157 physical canonical identities versus 526,158 worker-valid rows. Evidence indicates no missing canonical evidence; one source identity was counted as valid in a later block and upserted over an existing canonical identity.
- The exact drift run was isolated to the block advancing May RB from cursor 460,000 to 470,000: 9,647 worker-valid rows versus 9,646 newly created canonical rows.
- Latest observed Cronos reconciliation runs are clean (`failed_count = 0`, `issues = []`, `staleCount = 0`).

### Remaining work — hard stop list

Only these items may keep the current PRT closure open:

1. **Drain final national PRT import**
   - July 2026 RB -> EOF / imported.
   - Current verified cursor before the active run: 530,000.
   - Current verified accounting at cursor 530,000: 530,000 rows read / 526,835 valid / 3,165 duplicate/rejected-accounted.
   - A `prt_import_stream` run is currently active against July RB.
   - No unexpected stale PRT batches.

2. **Final PRT canonical reconciliation**
   - Verify May, June and July batch row counts against `prt_vehicle_records`.
   - Verify duplicate/rejected accounting, including the known May RB one-row inter-block upsert collision.
   - Verify `prt_latest_vehicle_status` can be produced without unexplained drift.
   - Record final canonical counts as closure evidence.

3. **Operational release gate**
   - `cronos_reconciliation` clean after July RB drain.
   - No stale claims in critical queues.
   - No recent unexplained failed critical jobs.
   - Qalito final PRT verdict = PASS.

### Explicitly deferred from Stage 9

The following findings are important but do not extend Stage 9 unless they become active P0 incidents:

- General `/api/*` authentication boundary hardening.
- Legacy credential-table redesign (`transportista_auth`, `conductor_auth`, `companies`, related login tables).
- Full tenant-aware RLS redesign.
- Broader index cleanup/performance refactoring.
- UI redesign or new product features.
- Full PRT Intelligence Layer beyond the reconciliation proof; this remains prioritized for Stage 12.
- New external transport datasets (SII valuation, MTT registries, municipal circulation permits, CONASET, MOP) remain blocked until the current PRT closure gate is complete.

### Stage 9 / PRT exit condition

The current closure cycle ends when July 2026 RB is fully imported, May/June/July reconcile canonically with explained duplicate accounting, Cronos is clean, and Qalito issues PASS. At closure, record production SHA, PRT counts, known explained accounting exceptions, Cronos health and Qalito verdict. Do not open the next transport-data source before this gate passes.

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

Verified 2026-08-09 10:11 CLT:

- Current production SHA observed in PRT/Cronos jobs: `284026acb72dacef1357a0270792547eb83a978b`.
- May 2026 RA1: `imported`, 13,895 rows read / 13,842 valid / 53 rejected.
- May 2026 RA2: `imported`, 103,279 rows read / 102,824 valid / 455 rejected/duplicate-accounted.
- May 2026 RB: `imported`, 531,180 rows read / 526,158 worker-valid / 5,022 duplicate/rejected-accounted; 526,157 canonical physical rows, with the one-row difference explained as an inter-block upsert identity collision.
- June 2026 RA1: `imported`, 12,118 rows read / 12,074 valid / 44 rejected.
- June 2026 RA2: `imported`, 92,994 rows read / 92,534 valid / 460 rejected/duplicate-accounted.
- June 2026 RB: `imported`, 554,795 rows read / 549,848 valid / 4,947 rejected/duplicate-accounted.
- July 2026 RA1: `imported`, 13,385 rows read / 13,358 valid / 27 rejected.
- July 2026 RA2: `imported`, 96,328 rows read / 96,009 valid / 319 rejected/duplicate-accounted.
- July 2026 RB: active at cursor 530,000 / 526,835 valid / 3,165 rejected/duplicate-accounted, with an import run currently in progress.
- Stale active PRT batches older than 30 minutes: `0`.
- Latest observed `cronos_reconciliation`: `completed`, `failed_count = 0`, `issues = []`, `staleCount = 0`.

These counters are a snapshot, not a permanent specification. Cronos/Supabase live state is the source of truth for closure.

---

## Scope discipline

When a new issue is found:

- **P0** security/data corruption: interrupt the active stage and repair immediately.
- **P1** primary-flow regression: repair within the active stage only if caused by that stage or blocking its exit criteria; otherwise place it at the top of the next stage.
- **P2/P3** improvements: backlog only; do not delay stage closure.

The purpose of this rule is to finish stages, preserve a known production baseline and prevent continuous development from becoming an undefined permanent phase.
