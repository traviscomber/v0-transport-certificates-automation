# LABBE — Transport Compliance Intelligence for Chile

LABBE is an evidence-driven transport compliance and vehicle-intelligence platform built for Chile. It connects transportistas, subcontractors, drivers, vehicles, documentary evidence, Chilean PRT data, external verification and operational review in one traceable system.

**LABBE is developed by [N3uralia](https://n3uralia.com), the software and AI infrastructure factory behind the platform.**

> Current lifecycle: Stage 9 is closing. May and June 2026 PRT batches are complete; July RB is in its final drain and will be followed by full reconciliation and Qalito release-gate validation. See [`ROADMAP.md`](ROADMAP.md).

## Product principle

LABBE is not a file repository. Its operating rule is **evidence before inference**:

`source evidence -> canonical normalization -> verification -> reconciliation -> human-reviewable compliance state`

The system preserves source truth, keeps historical evidence, avoids simulated facts and treats missing evidence as unknown until verified.

## Core capabilities

- Transportista identity and workflows by canonical RUT.
- Subcontractor portal and executive review flows.
- Driver identity, documentation and validation.
- Vehicle and fleet records.
- High-volume Chilean PRT ingestion with resumable cursors.
- Canonical PRT evidence in `prt_vehicle_records`.
- Pending-document search by canonical RUT.
- OCR and text-extraction workers.
- SII/external verification infrastructure.
- Compliance and reconciliation workers.
- Cronos operational supervision.
- Qalito release-quality gates.

## PRT vehicle evidence layer

LABBE is building a national-scale vehicle evidence layer around Chilean PRT data.

Current verified production facts as of **2026-08-09**:

- `1,983,332` canonical PRT evidence rows stored in `prt_vehicle_records`.
- May 2026 RA1, RA2 and RB: `imported`.
- June 2026 RA1, RA2 and RB: `imported`.
- July 2026 RA1 and RA2: `imported`.
- July 2026 RB: actively draining; latest verified cursor `580,000`, with `576,687` valid source rows and no recorded batch error.
- No stale PRT batch was observed at the latest closure checks.

These counts are a dated operational snapshot, not permanent product specifications. Live Supabase/Cronos state remains authoritative.

The long-term model is:

`PRT historical evidence -> latest status by plate -> operational vehicle enrichment -> compliance intelligence -> alerts / review / reporting`

The PRT corpus is deliberately kept separate from operational fleet entities: hundreds of thousands of external vehicle identities must not be inserted as fake operational vehicles.

## Why this creates product value

When a customer introduces a vehicle or fleet, LABBE can reuse evidence already present in the platform instead of starting from zero. This supports future capabilities such as:

- latest PRT status by plate;
- revision and expiry history;
- rejected/approved revision evidence;
- vehicle onboarding enrichment;
- fleet compliance views;
- exception queues;
- evidence-backed risk and renewal alerts.

All derived intelligence must remain traceable to canonical evidence.

## Canonical architecture

| Domain | Primary structures |
|---|---|
| Transportistas | `transportistas`, `transportista_auth` |
| Drivers | `conductores`, `conductor_auth` |
| Driver documents | `uploaded_documents`, `document_types` |
| Subcontractor documents | `subcontractor_documents`, `subcontractor_document_types` |
| Operational vehicles | `vehiculos` |
| PRT evidence | `prt_import_batches`, `prt_vehicle_records`, `prt_latest_vehicle_status` |
| External verification | `external_verification_runs` |
| Document intelligence | `document_text_extractions` |
| Operations | `system_job_runs`, reconciliation workers and locks |
| Alerts | `alerts`, `alerts_log` |

Canonical domain rules live in [`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md).

## Cronos and Qalito

**Cronos** supervises synchronization health, cursor advancement, stale claims, failed jobs, reconciliation and production-state coherence.

**Qalito** is the release gate:

`implementation -> preview/CI -> Qalito PASS -> main -> production READY -> runtime/data verification`

HTTP success alone is never treated as proof of operational health.

## Search, GEO and machine discoverability

LABBE's public discovery layer is optimized around factual, indexable product content rather than unsupported marketing claims.

- Primary market and language: Chile / `es-CL`.
- Public metadata positions LABBE around transport compliance, PRT, fleet evidence, transportistas, subcontractors and drivers.
- `Organization` and `SoftwareApplication` structured data identify N3uralia as creator/publisher.
- `robots.txt` protects operational/private routes from public crawling.
- `sitemap.xml` exposes only selected public pages.
- `llms.txt` provides concise machine-readable product context and attribution.
- Public content references [n3uralia.com](https://n3uralia.com) as the software factory behind LABBE.

Google's generative-search guidance does not require a special AI file; standard SEO fundamentals, useful public text and structured data remain the primary discovery mechanisms. `llms.txt` is therefore supplemental rather than canonical.

## Public discovery URL

Current production host available in Vercel:

`https://transn3uralia.vercel.app`

SEO routes are implemented so the canonical base can later move to a dedicated LABBE domain through `NEXT_PUBLIC_SITE_URL` without rewriting the metadata architecture.

## Roadmap

### Stage 9 — Operational hardening and PRT closure — `CLOSING`

Finish July 2026 RB, reconcile May/June/July PRT counts and obtain Qalito PASS.

### Stage 10 — Authentication, authorization and API security — `NEXT`

Harden privileged routes, credential-bearing tables, sessions and service-role boundaries.

### Stage 11 — Canonical document workflow — `PLANNED`

Unify customer-facing pending lists, counters, RUT search and validation semantics.

### Stage 12 — Compliance and Vehicle Intelligence — `PLANNED`

Operationalize the PRT corpus through latest-by-plate projections, vehicle enrichment and evidence-backed compliance decisions.

### Stage 13 — Client release stabilization — `PLANNED`

Full role regression, accessibility, performance, observability, runbooks and controlled release packaging.

Detailed scope and exit criteria: [`ROADMAP.md`](ROADMAP.md).

## Technology

- Next.js App Router
- React / TypeScript
- Supabase PostgreSQL
- Vercel
- scheduled workers and reconciliation
- Cronos operational control
- Qalito QA/release gates

## Local development

```bash
npm install
npm run dev
```

Minimum server environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Before publishing:

```bash
npm run build
```

A successful build is necessary but not sufficient. Relevant changes must also pass preview/runtime/data verification and Qalito.

---

**LABBE is being built as Chilean transport compliance infrastructure: documentary evidence, national-scale PRT data, external verification, automation and human review connected through one canonical operational model — developed by [N3uralia](https://n3uralia.com).**
