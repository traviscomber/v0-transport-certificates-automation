# LABBE — Transport Compliance Intelligence

LABBE is N3uralia's production platform for transport-document operations: it connects transportistas, subcontractors, drivers, vehicles, documentary evidence, external verification and compliance workflows in one traceable system.

It is not designed as a simple file repository. Its core principle is **evidence before inference**: preserve the original operational evidence, normalize it into canonical structures, automate repeatable work, and keep every consequential status traceable to its source.

> **Current lifecycle:** Stage 9 is closing. Operational synchronization is stable while the remaining PRT batches drain. The controlled next stages are security boundary hardening, canonical document-workflow unification, compliance intelligence and client-release stabilization. See [`ROADMAP.md`](ROADMAP.md).

## What LABBE does

### Transportista and subcontractor operations

- Canonical transportista identity by RUT.
- Subcontractor portal and executive operational workflows.
- Documentary upload, review, approval and rejection.
- Multiple valid document versions by entity, type and period.
- Pending-document search by canonical RUT.
- Server-side pending search that filters before pagination/limits, preventing valid records from disappearing from executive searches.
- Certification flags and operational status without inventing unsupported expiration dates.

### Driver operations

- Canonical driver identity by RUT.
- Driver authentication relationship.
- Driver-document upload and validation.
- Pending, approved and rejected states with review timestamps.
- Historical evidence retained instead of collapsing versions into one row.

### Vehicle and PRT evidence pipeline

- Streaming ingestion of large PRT datasets in controlled batches.
- Separate RA1, RA2 and RB batch tracking by period.
- Cursor-based progress and resumable processing.
- Explicit valid, rejected and duplicate accounting.
- Canonical PRT evidence retained in `prt_vehicle_records`.
- Reconciliation designed to connect PRT evidence to operational vehicle/compliance decisions without silently overwriting source truth.

### External verification and compliance

- SII transportista verification worker.
- External-verification run history and provenance.
- Compliance-processing and reconciliation infrastructure.
- Company/worker reconciliation structures for backend intelligence.
- Unknown or unavailable external evidence remains unknown; it is not converted into a false negative.

### Document intelligence

- Text extraction/OCR processing infrastructure.
- Claim/recovery patterns for asynchronous workers.
- Exact `document_id` identity for processing and deduplication of the same record.
- OCR/source evidence is preserved for auditability.
- Internal worker functions are isolated from public/client execution.

### Automation and operational control

LABBE includes an operational control plane rather than relying only on HTTP success codes.

**Cronos** supervises:

- PRT imports and cursor advancement;
- reconciliation health;
- SII verification;
- compliance processing;
- OCR/text-extraction queues;
- stale or stuck claims;
- failed critical jobs;
- schema/API drift;
- deployment and canonical-data health.

**Qalito** is the mandatory release gate for relevant code/release changes:

`implementation -> preview/CI -> Qalito PASS -> main -> production READY -> runtime/data verification`

A job is not considered healthy merely because it returns HTTP 200. Downstream state, canonical counts and open claims must also reconcile.

## Why the architecture is different

LABBE follows several strict invariants:

1. **Evidence is canonical.** Simulated data, placeholders and unsupported assumptions cannot become operational facts.
2. **History is not a duplicate.** Two documents for the same entity/type/period can represent valid versions, corrections or renewals.
3. **Identity is explicit.** Document processing is protected by exact `document_id`; broad filename/plate/content heuristics do not silently erase evidence.
4. **Large datasets are streamed.** PRT ingestion uses resumable batches and explicit accounting rather than monolithic imports.
5. **Sensitive processing stays server-side.** `service_role` is backend-only and internal worker/RPC surfaces are not intended for browser execution.
6. **Operational health is reconciled.** Cronos checks database state and downstream effects, not only scheduler responses.
7. **Releases have a gate.** Qalito validates changes before a stage or production fix is considered closed.
8. **Stages end.** [`ROADMAP.md`](ROADMAP.md) defines hard exit criteria so new P2/P3 discoveries do not create endless development cycles.

## Canonical data model

Core operational entities include:

| Domain | Primary structures |
|---|---|
| Transportistas | `transportistas`, `transportista_auth` |
| Drivers | `conductores`, `conductor_auth` |
| Driver documents | `uploaded_documents`, `document_types` |
| Subcontractor documents | `subcontractor_documents`, `subcontractor_document_types` |
| Vehicles / PRT evidence | `vehiculos`, `prt_vehicle_records`, PRT batch state |
| Verification | `external_verification_runs` |
| Document intelligence | `document_text_extractions` and worker functions |
| Worker/company intelligence | `worker_document_facts`, `company_worker_reconciliation` |
| Operations | `system_job_runs`, `system_job_locks` and reconciliation workers |
| Alerts | `alerts`, `alerts_log` |

The complete domain rules are maintained in [`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md). That specification must be read before changing schema, APIs, dashboards, document semantics or bulk-import behavior.

## Current production capabilities

The current production system has verified operational paths for:

- transportista and driver identity;
- application authentication relationships;
- subcontractor and driver document management;
- executive pending-document workflows;
- canonical RUT search;
- historical document preservation;
- exact status statistics beyond Supabase's common row-return limits;
- SII verification automation;
- PRT streaming ingestion and batch accounting;
- asynchronous text/OCR infrastructure;
- compliance/reconciliation workers;
- operational job history and locking;
- stale-state detection and reconciliation;
- Vercel production deployment with Supabase PostgreSQL as canonical storage.

Live counts are intentionally **not hardcoded in this README**. They change with production operation and must be queried from Supabase/Cronos when needed.

## Architecture

| Layer | Technology / responsibility |
|---|---|
| Web application | Next.js App Router, React, TypeScript |
| Server/API | Next.js server routes and server-side domain logic |
| Canonical database | Supabase PostgreSQL |
| Security | Application authentication, RLS, backend-only `service_role` |
| Document evidence | Persistent document URLs + canonical metadata/history |
| Automation | Scheduled workers, claims, locks, retries and reconciliation |
| Production | Vercel |
| Operational supervision | Cronos |
| Release quality gate | Qalito |

## Product roadmap

The roadmap is deliberately finite and stage-gated.

### Stage 9 — Operational hardening and synchronization closure — `CLOSING`

Finish remaining PRT imports, perform final canonical reconciliation and obtain Qalito PASS. No new features are added to this stage.

### Stage 10 — Authentication, authorization and API security — `NEXT`

Create one explicit server-side authorization boundary for admin, executive, subcontractor and driver roles; protect credential-bearing tables and privileged service-role APIs.

### Stage 11 — Canonical document workflow — `PLANNED`

Unify counters, pending lists, RUT search, detail views and validation actions around one canonical document-status contract.

### Stage 12 — Compliance intelligence — `PLANNED`

Connect PRT, vehicles, documents and external verification into traceable compliance decisions and explicit human-review exceptions.

### Stage 13 — Client release stabilization — `PLANNED`

Full role regression, responsive/accessibility checks, performance, observability, runbooks and controlled client release.

Detailed scope and exit criteria: [`ROADMAP.md`](ROADMAP.md).

## Security model

- RLS is enabled on relevant public operational tables.
- Sensitive worker tables and internal `SECURITY DEFINER` functions are intended for backend/service-role execution only.
- `SUPABASE_SERVICE_ROLE_KEY` must never be sent to the browser, logged or committed.
- Sensitive operations should pass through authenticated server APIs.
- Open RLS policies must not be introduced merely to make a frontend query work.
- Credential/API-boundary hardening is explicitly tracked as Stage 10 rather than being mixed into unrelated operational fixes.

## Canonical rules developers must preserve

- Never invent expiration dates or statuses without a canonical source.
- Never delete documentary history merely because entity, type and period match.
- Do not treat different URLs as proof of different binary content.
- Future true-file deduplication should use content hashes and preserve provenance.
- User-selected document period outranks filename/metadata inference where the canonical model specifies it.
- Statistics must use exact database counts rather than truncated client result sets.
- Missing external evidence means unknown/unavailable, not false.
- Changes to domain semantics must update [`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md).

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
```

Before publishing:

```bash
npm run build
```

A build alone is not sufficient. Relevant changes must also be checked against real Supabase schema/data, RLS/role behavior, Vercel deployment/runtime and the affected end-to-end operational flow.

## Source-of-truth hierarchy

When documentation, legacy code and UI behavior disagree, use this order:

1. verified production schema and canonical data in Supabase;
2. [`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md);
3. versioned migrations;
4. server APIs/shared domain rules;
5. UI components;
6. legacy comments or assumptions.

## Documentation

- [`ROADMAP.md`](ROADMAP.md) — finite product/engineering stages and closure criteria.
- [`docs/LABBE_CANONICAL_SYSTEM.md`](docs/LABBE_CANONICAL_SYSTEM.md) — canonical domain and data rules.

---

**LABBE is being built as an evidence-driven transport compliance operating system: documentary history, external verification, high-volume PRT evidence, automation and human review coordinated through one canonical operational model.**
