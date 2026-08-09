# TransportesLabbe — Product & Engineering Roadmap

Last updated: 2026-08-09 10:39 CLT
Canonical repository: `traviscomber/v0-transport-certificates-automation`
Current observed production SHA: `284026acb72dacef1357a0270792547eb83a978b`

## Operating rule

This roadmap is the scope-control document for the platform. A stage closes when its explicit exit criteria are met. New discoveries that are not P0 data-loss/security incidents do **not** extend the active stage automatically; they are assigned to the next appropriate stage.

Release flow for every code stage:

`implementation -> preview/CI -> Qalito PASS -> merge to main -> production READY -> runtime/data verification -> stage closure`

Cronos owns operational supervision, synchronization health, queue recovery and production verification. Qalito is the mandatory release gate for code/release changes.

Documentation rule: update this file whenever a material production fix, closure milestone, public-discovery change or stage transition occurs. Live Supabase/Cronos state remains authoritative for operational counters.

---

## Cross-cutting discovery layer — SEO / GEO / LLM discoverability

**Status: IN REVIEW — branch `feat/seo-geo-n3uralia`**

This work does not extend Stage 9's PRT exit criteria, but it is a material public-product milestone and must pass Qalito before production.

### Implemented in review branch

- Public product entity renamed/aligned to **LABBE** instead of legacy DocuFleet/Segur-ia metadata.
- N3uralia identified as creator/publisher/software factory, with canonical reference to `https://n3uralia.com`.
- Chile-focused metadata (`es-CL`, transport compliance, PRT, fleet/document intelligence).
- `Organization` + `SoftwareApplication` JSON-LD.
- `robots.txt` metadata route with private/operational routes excluded from crawling.
- `sitemap.xml` metadata route exposing selected public pages only.
- Supplemental `public/llms.txt` for machine-readable product context and N3uralia attribution.
- Public landing rewritten around evidence-backed product capabilities and Chilean transport use cases; unsupported legacy claims removed.
- README refreshed with current product positioning, discovery architecture and PRT evidence layer.

### Discovery gate

- Preview/CI build must pass.
- `/robots.txt`, `/sitemap.xml` and `/llms.txt` must resolve on preview.
- Structured data must be valid and match visible content.
- Public pages must not expose private dashboard/API routes in the sitemap.
- N3uralia attribution must remain factual and consistent.
- Qalito verdict must be PASS before merge.

### Canonical domain note

Current public production host available in Vercel is `https://transn3uralia.vercel.app`. Metadata/sitemap use `NEXT_PUBLIC_SITE_URL` with that host as fallback. A future dedicated LABBE domain can replace the base without redesigning the SEO layer.

---

## Stage 9 — Operational hardening and synchronization closure

**Status: CLOSING — FINAL NATIONAL PRT BATCH ACTIVE**

### Objective

Finish the current operational hardening cycle and leave imports, reconciliation and customer-visible pending-document search in a stable, observable production state.

### Completed

- Cronos control plane deployed and recurring reconciliation verified.
- Critical reconciliation and worker/RPC defects repaired.
- Pending-document RUT search defect fixed and production-verified.
- PRT starvation fixed: oldest eligible large batch drains before newer work.
- May 2026 RA1, RA2 and RB: `imported`.
- June 2026 RA1, RA2 and RB: `imported`.
- July 2026 RA1 and RA2: `imported`.
- May RB one-row accounting drift isolated to an inter-block canonical upsert collision; evidence indicates no lost canonical record.
- Recent Cronos reconciliation: `failed_count = 0`, `issues = []`, `staleCount = 0`.

### Remaining hard stop list

1. July 2026 RB -> EOF / `imported`.
2. Reconcile May, June and July batch accounting against `prt_vehicle_records`.
3. Verify known May one-row collision is recorded as explained accounting behavior, not missing evidence.
4. Verify `prt_latest_vehicle_status` without unexplained drift.
5. Zero unexpected stale/importing/processing rows.
6. Clean `cronos_reconciliation` and no unexplained recent failed critical jobs.
7. Qalito final PRT verdict = PASS.

### Current live PRT snapshot

Verified 2026-08-09 10:39 CLT:

- Canonical `prt_vehicle_records`: `1,983,332` rows.
- May RB: `imported`, 531,180 rows read / 526,158 worker-valid / 5,022 duplicate/rejected-accounted.
- June RB: `imported`, 554,795 rows read / 549,848 valid / 4,947 duplicate/rejected-accounted.
- July RA1: `imported`, 13,358 valid.
- July RA2: `imported`, 96,009 valid.
- July RB: `profiled`, cursor `580,000`, 576,687 valid, 3,313 duplicate/rejected-accounted, no recorded error.
- No stale PRT batch observed in the latest checks.

These counters are a dated snapshot. Supabase/Cronos live state remains the source of truth.

### Explicitly deferred from Stage 9

- General `/api/*` authorization hardening.
- Legacy credential-table redesign.
- Full tenant-aware RLS redesign.
- Broad performance/index cleanup.
- New transport-data sources (SII vehicle valuation, MTT registries, municipal circulation permits, CONASET, MOP) until the PRT closure gate is complete.
- Full PRT Intelligence Layer implementation; prioritized for Stage 12.

### Stage 9 exit condition

July RB must be imported, May/June/July must reconcile with explained duplicate accounting, Cronos must be clean and Qalito must issue PASS. Record production SHA, final PRT counts, known explained exceptions and gate evidence at closure.

---

## Stage 10 — Authentication, authorization and API security boundary

**Status: NEXT**

### Objective

Make privileged APIs and credential-bearing data server-authorized by design without breaking admin, executive, subcontractor or driver workflows.

### Exit criteria

- No credential hash readable by `anon` or ordinary authenticated clients.
- No privileged service-role API callable without an authorized server contract.
- Positive and negative role/session regression coverage passes.
- Qalito authorization matrix = PASS.

---

## Stage 11 — Canonical document workflow unification

**Status: PLANNED**

### Objective

Unify counts, pending lists, RUT search, detail views and validation actions around one canonical document lifecycle.

### Exit criteria

- Pending counts reconcile exactly to pending lists for the same scope.
- RUT search cannot lose valid records due to pagination or client-side post-filtering.
- Legacy document sources are removed or explicitly adapted.
- Qalito workflow regression = PASS.

---

## Stage 12 — Compliance intelligence and PRT operationalization

**Status: PLANNED — PRIORITY AFTER CANONICAL FOUNDATIONS**

### Objective

Turn the national-scale PRT corpus and canonical document evidence into traceable operational intelligence.

### Priority scope

- Canonical latest PRT by plate projection.
- Automatic enrichment of operational `vehiculos` from PRT evidence.
- PRT -> vehicle -> compliance matching contract.
- Evidence-backed latest revision/result/expiry provenance.
- Explicit no-match and uncertainty states.
- Human-reviewable exceptions.
- Safe rebuildable projections rather than second canonical sources.

### Exit criteria

- Operational vehicles enrich automatically when canonical evidence exists.
- Decisions remain traceable to source evidence.
- No simulated facts.
- Qalito end-to-end compliance gate = PASS.

---

## Stage 13 — Product stabilization and client release package

**Status: PLANNED**

### Objective

Prepare a controlled client-facing release baseline.

### Scope

- Full role regression.
- Responsive/accessibility checks.
- Performance and observability baseline.
- Public SEO/GEO regression after domain changes.
- Search Console/sitemap verification when the final dedicated domain is connected.
- Diagnostic/test-route cleanup from customer navigation.
- Operator runbook, rollback notes and release notes.

### Exit criteria

- No P0/P1 open defects in primary client workflows.
- Public discovery endpoints validate on the production domain.
- Qalito release gate = PASS.
- Cronos health = healthy.
- Production SHA and schema baseline recorded.

---

## Scope discipline

- **P0** security/data corruption: interrupt and repair immediately.
- **P1** primary-flow regression: repair in the active stage only when it blocks that stage's exit or was caused by it; otherwise place it at the top of the next stage.
- **P2/P3** improvements: backlog; do not delay closure.

The purpose is to finish stages, preserve production baselines and prevent development from becoming an undefined permanent phase.
