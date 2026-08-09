# ChileFlota — Product & Engineering Roadmap

Last updated: 2026-08-09
Canonical repository: `traviscomber/v0-transport-certificates-automation`
Product: **ChileFlota**
Current operational implementation: **LABBE**
Software factory: **N3uralia** — https://n3uralia.com

## Operating rule

This roadmap is the scope-control document for ChileFlota. A stage closes when its explicit exit criteria are met. New P2/P3 discoveries do not extend an active stage automatically.

Release flow:

`implementation -> preview/CI -> Qalito PASS -> merge to main -> production READY -> runtime/data verification -> stage closure`

Cronos owns synchronization and operational health. Qalito is the mandatory release gate. Supabase/Cronos live state remains authoritative for operational counters.

---

## Product thesis

ChileFlota should answer one operational question better than a generic document manager:

> **Can this fleet, vehicle, driver or supplier operate today, and what evidence or action is missing before it becomes a problem?**

The product moat is cumulative:

`more canonical evidence -> better enrichment -> less manual work -> better decisions -> more operational usage -> better coverage`

ChileFlota must not become a collection of dashboards. Every intelligence surface must lead to a decision, an action or evidence.

---

## Cross-cutting discovery layer — SEO / GEO / LLM discoverability

**Status: IN REVIEW — PR #84**

### Implemented

- **ChileFlota** established as the reusable public product brand.
- `https://chileflota.app` set as canonical public product URL.
- **LABBE** retained as the current operational implementation.
- **N3uralia** identified as creator/publisher/software factory at `https://n3uralia.com`.
- Chile-focused metadata, `es-CL`, OpenGraph and search terminology.
- `Organization` + `SoftwareApplication` JSON-LD.
- `robots.txt` with private operational routes excluded.
- `sitemap.xml` exposing selected public routes only.
- Supplemental `llms.txt` with product/entity context.
- Public landing aligned to ChileFlota and evidence-backed capabilities.
- Unsupported legacy claims removed.

### Gate

- Vercel preview build: PASS.
- Final preview deployment: READY.
- Runtime crawl verification on the final public domain remains required for `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` and structured data.
- Qalito discovery verdict remains HOLD until that runtime verification is possible.

---

## Stage 9 — Operational hardening and national PRT closure

**Status: CLOSED — QALITO PRT PASS**

### Closure evidence

All May, June and July 2026 PRT batches are `imported`.

| Period | Type | Rows read | Worker-valid | Canonical rows | Explained delta |
|---|---|---:|---:|---:|---:|
| May 2026 | RA1 | 13,895 | 13,842 | 13,842 | 0 |
| May 2026 | RA2 | 103,279 | 102,824 | 102,824 | 0 |
| May 2026 | RB | 531,180 | 526,158 | 526,157 | 1 |
| June 2026 | RA1 | 12,118 | 12,074 | 12,074 | 0 |
| June 2026 | RA2 | 92,994 | 92,534 | 92,534 | 0 |
| June 2026 | RB | 554,795 | 549,848 | 549,848 | 0 |
| July 2026 | RA1 | 13,385 | 13,358 | 13,358 | 0 |
| July 2026 | RA2 | 96,328 | 96,009 | 96,009 | 0 |
| July 2026 | RB | 598,130 | 594,805 | 594,804 | 1 |

The May RB and July RB one-row deltas are consistent with the known inter-block `upsert` identity behavior: a later source row can match an already-canonical identity and update it rather than create another physical row. This is an accounting defect to fix in future imports, not evidence of broad data loss.

Final PRT gate evidence:

- active May/June/July import rows: `0`;
- stale May/June/July import rows: `0`;
- failed May/June/July batches: `0`;
- latest observed `cronos_reconciliation`: `completed`, `failed_count = 0`, `issues = []`, `staleCount = 0`;
- post-drain `prt_import_stream` returns `no_large_prt_batch`.

### Deferred accounting improvement

Future importer accounting must distinguish:

- valid source row;
- new canonical identity;
- intra-block duplicate;
- inter-block upsert collision.

Do not rewrite or delete existing canonical evidence merely to make counters match.

---

## Stage 10 — Authentication, authorization and tenant security boundary

**Status: NEXT**

### Objective

Make ChileFlota safe to operate as a reusable multi-company product, not only a single implementation.

### Scope

- Inventory privileged `/api/*` routes and service-role usage.
- Define server-side actor contract for admin, executive, subcontractor and driver.
- Protect credential-bearing tables and remove client access to password hashes/secrets.
- Enforce tenant-aware authorization for productized ChileFlota deployments.
- Normalize RLS around explicit ownership/tenant relationships.
- Add positive and negative authorization regression tests.

### Exit criteria

- No credential hash readable by `anon` or ordinary authenticated clients.
- No privileged service-role route callable without authorized server context.
- Wrong-role and wrong-tenant access is denied deterministically.
- Primary LABBE flows continue to work.
- Qalito authorization matrix = PASS.

---

## Stage 11 — Canonical document workflow unification

**Status: PLANNED**

### Objective

Make every customer-visible document counter, list, search and validation action derive from one canonical lifecycle.

### Scope

- Declare canonical document lifecycle and source ownership.
- Unify counters, pending lists, RUT search, detail views and validation actions.
- Preserve valid document history and versions.
- Normalize status transitions: `pending -> approved/rejected/expired/superseded` where supported by canonical evidence.
- Eliminate client-side post-filtering that can hide valid records.
- Build one server-side query contract reusable by executive and customer portals.

### Exit criteria

- Pending counts equal the corresponding pending list for the same scope.
- RUT search cannot lose records due to pagination or client-side filtering.
- Legacy sources are removed or explicitly adapted.
- Qalito workflow regression = PASS.

---

## Stage 12 — ChileFlota Vehicle & Compliance Intelligence

**Status: PLANNED — PRODUCT DIFFERENTIATION STAGE**

### Objective

Turn the national PRT corpus and canonical operational evidence into immediate, explainable decisions for fleet operators.

### Release 12.1 — Latest PRT by plate

Build a rebuildable projection over `prt_vehicle_records` that exposes the latest trustworthy PRT evidence for each normalized plate.

Required outputs:

- plate identity;
- latest inspection date;
- result/status when present;
- expiry/next relevant date only when supported by source evidence;
- plant/class/source fields when present;
- source batch and provenance;
- deterministic tie-breaking for multiple records.

Success signal: a plate lookup resolves from the projection without scanning historical PRT rows.

### Release 12.2 — Vehicle Intelligence Profile

Create one operational view per vehicle:

`plate -> latest PRT -> PRT history -> documents -> transportista -> assigned driver -> alerts -> evidence provenance`

The profile must clearly separate:

- verified evidence;
- derived state;
- missing/unknown evidence;
- human-review exceptions.

Success signal: an executive can understand what is known about one vehicle and what action is required without navigating multiple modules.

### Release 12.3 — Compliance Snapshot

Introduce explainable statuses for vehicle, driver, supplier and fleet scopes:

- `OK`;
- `Attention`;
- `Blocking`;
- `Insufficient evidence`.

Every status must open to the evidence/rule that produced it. No opaque AI score may become an operational fact.

Success signal: every snapshot status is traceable to canonical evidence and a deterministic rule or explicitly labeled AI interpretation.

### Release 12.4 — Instant Fleet Enrichment

Allow a customer to upload or register a list of plates and immediately discover which vehicles already have canonical PRT evidence.

Requirements:

- batch plate normalization;
- exact/deterministic matching first;
- no automatic creation of hundreds of thousands of operational vehicles;
- match/no-match/ambiguous counts;
- enrichment preview before operational acceptance;
- provenance for every matched result.

Success signal: onboarding a fleet produces useful evidence before the customer uploads individual documents.

### Release 12.5 — Action-oriented fleet dashboard

The main dashboard should prioritize actions rather than vanity metrics:

- what can block operation;
- what expires or requires attention soon;
- what changed recently;
- what requires human review;
- which supplier/vehicle/driver concentrates unresolved exceptions.

Success signal: a user can move from dashboard alert to resolution workflow in one navigation path.

### Release 12.6 — Explainable ChileFlota Intelligence

Add natural-language operational queries only after canonical projections exist.

Example questions:

- Which vehicles need attention this month?
- Which suppliers have the most unresolved evidence gaps?
- What changed for this transportista?
- Why is this vehicle marked Attention?

Rules:

- retrieval must use canonical/derived evidence;
- responses link back to evidence;
- uncertainty is explicit;
- AI cannot invent compliance facts.

Success signal: generated answers cite the exact records/rules behind consequential claims.

### Stage 12 exit criteria

- Operational vehicles enrich automatically when canonical evidence exists.
- Latest PRT lookup is fast and rebuildable.
- Vehicle Intelligence Profile is usable end to end.
- Compliance Snapshot is explainable and traceable.
- Fleet enrichment handles match/no-match/ambiguous states safely.
- No simulated operational facts.
- Qalito end-to-end intelligence gate = PASS.

---

## Stage 13 — Product stabilization and ChileFlota client release

**Status: PLANNED**

### Scope

- Full role and tenant regression.
- Responsive/mobile and accessibility checks.
- Performance baseline for highest-volume queries.
- Production observability and error budget.
- Public SEO/GEO regression on `chileflota.app`.
- Search Console and sitemap verification.
- Diagnostic/test-route cleanup.
- Operator runbook, rollback notes and client-facing release notes.

### Exit criteria

- No P0/P1 defects in primary client workflows.
- Public discovery endpoints validate on `chileflota.app`.
- Qalito release gate = PASS.
- Cronos health = healthy.
- Production SHA and schema baseline recorded.

---

## Data expansion after PRT

New transport datasets are intentionally sequenced one at a time after the canonical foundations above:

1. SII vehicle valuation/taxonomy.
2. MTT regulatory registries where legal/technical bulk access is appropriate.
3. Municipal circulation-permit datasets with compatible reuse terms.
4. CONASET contextual road-risk data.
5. MOP toll/routing cost layers.

Each source must enrich the existing vehicle identity graph. It must not become an isolated parallel database without product use.

---

## Product success metrics

Metrics should validate operational value, not activity for its own sake:

- percentage of operational vehicles enriched automatically from external evidence;
- median time from vehicle onboarding to usable compliance state;
- percentage of compliance states with direct evidence provenance;
- manual review actions per 100 vehicles;
- unresolved exceptions by age;
- mismatch/ambiguous rate during fleet enrichment;
- critical worker failure/stale-claim rate;
- time from dashboard alert to resolution.

Do not publish unsupported commercial performance claims.

---

## Scope discipline

- **P0** security/data corruption: interrupt and repair immediately.
- **P1** primary-flow regression: repair when it blocks the active stage or was caused by it.
- **P2/P3** improvements: backlog unless promoted by measured product impact.

The goal is to finish stages, preserve trustworthy evidence and build a compounding ChileFlota data advantage rather than an endless feature list.
