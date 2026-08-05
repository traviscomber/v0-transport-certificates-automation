# Compliance Intelligence Roadmap

## Objective

Transform the platform from document management into an operational compliance intelligence system that can answer, with evidence, whether a company, worker, vehicle, contract or operation is enabled, under warning or blocked.

## Product principle

Every conclusion must be traceable to:

1. Entity evaluated.
2. Document or official source used.
3. Rule and version executed.
4. Observed and expected values.
5. Decision produced.
6. Evidence timestamp and responsible actor.

## Phase 0 — Stabilize current ingestion pipelines

Status: in progress.

Deliverables:

- Complete RA1, RA2 and RB PRT imports for available periods.
- Ensure resumable imports, locking, retries and idempotency.
- Add health metrics for discovery, inspection, profiling and import workers.
- Prevent stale batches in `profiling`, `importing` or `failed` states.

Acceptance criteria:

- All six current PRT batches reach `imported`.
- Re-running workers creates no duplicate records.
- Failed downloads recover automatically.
- Each worker exposes last execution, duration, rows processed and error.

## Phase 1 — Unified evidence and decision layer

Goal: connect existing documents, external verification runs, findings and rules without replacing current tables.

New concepts:

- `compliance_evidence`: immutable evidence generated from documents, official sources or human reviews.
- `compliance_rule_definitions`: versioned operational rules.
- `compliance_rule_executions`: one execution of one rule against one entity.
- `operational_decisions`: final state `enabled`, `warning`, `blocked` or `unknown`.
- `entity_links`: normalized relationships among organization, company, worker, vehicle, contract, operation and document.

Acceptance criteria:

- A PRT lookup can generate evidence, rule execution and vehicle decision.
- An SII verification can generate evidence, findings and company decision.
- A document analysis can reference the same entity and decision model.
- Decisions retain the exact rule version and evidence used.

## Phase 2 — Company intelligence

Data sources:

- SII situation and observations.
- Uploaded F30/F30-1.
- Contracts and annexes.
- Previred and payroll documents.
- Existing company and organization records.

Capabilities:

- Historical SII snapshots.
- Company identity consistency.
- Worker counts by source and period.
- Missing or inconsistent labor evidence.
- Company operational decision and risk trend.

Acceptance criteria:

- Company timeline shows every relevant verification and decision change.
- Differences between F30, Previred and payroll create explicit findings.
- Score explains every deduction.

## Phase 3 — Vehicle intelligence

Data sources:

- PRT RA1, RA2 and RB.
- Uploaded SOAP, circulation permit, registration and vehicle documents.
- Vehicle master data.

Capabilities:

- Latest PRT state and full history.
- Rejection frequency and station patterns.
- Plate/VIN/chassis consistency.
- Upcoming expiry alerts.
- Vehicle enabled/warning/blocked decision.

Acceptance criteria:

- Any stored vehicle can be evaluated locally without visiting the PRT site.
- Conflicting VIN, decreasing mileage or invalid dates produce findings.
- Decision latency below 200 ms after data is imported.

## Phase 4 — Worker intelligence

Data sources:

- Contracts and annexes.
- F30/F30-1 worker lists.
- Previred and payroll.
- Licences, exams, EPP, ODI and certifications.

Capabilities:

- Active employment relationship by period.
- Document and training validity.
- Cross-document RUT and date consistency.
- Worker enabled/warning/blocked decision.

Acceptance criteria:

- Worker timeline consolidates all uploaded evidence.
- Missing mandatory evidence blocks only the applicable operation.
- Human overrides are recorded with reason and expiry.

## Phase 5 — Operation and contractor graph

Capabilities:

- Relationship graph among principal, contractor, subcontractor, workers, vehicles, contracts and operations.
- Eligibility evaluation at operation/property level.
- Impact propagation when one entity changes state.

Acceptance criteria:

- A company, worker or vehicle change recalculates affected operations.
- Dashboard identifies exactly who or what is blocking an operation.
- Queries support future expirations and historical reconstruction.

## Phase 6 — Explainable risk score

Components:

- Identity integrity.
- Document completeness.
- Official-source validation.
- Expiry exposure.
- Historical incidents and rejections.
- Unresolved critical findings.

Rules:

- Score is derived only from executed rules.
- Every deduction has a visible explanation.
- Critical blocking rules override the numeric score.

Acceptance criteria:

- Score can be reproduced from stored rule executions.
- Score history is immutable and comparable by period.
- Users can distinguish risk from missing information.

## Phase 7 — Defensible compliance dossier

Capabilities:

- Exportable audit package.
- Original file hash and storage reference.
- Extracted facts, official responses and evidence.
- Rule versions, decisions, corrections and approvals.
- Full chronological timeline.

Acceptance criteria:

- An auditor can reconstruct why a decision was made.
- Evidence cannot be silently overwritten.
- Corrections create new versions rather than deleting history.

## Phase 8 — Privacy and cybersecurity compliance

Capabilities:

- Processing inventory.
- Purpose, legal basis, retention and access controls.
- Data subject request workflows.
- Incident classification and regulatory clocks.
- Privacy and cybersecurity evidence linked to the same graph.

Acceptance criteria:

- Sensitive data access is auditable.
- Retention policies can be executed automatically.
- Incident workflow produces an evidence dossier.

## Execution order

1. Finish PRT pipeline stability.
2. Build unified evidence and decision schema.
3. Connect PRT and SII to the new model.
4. Connect uploaded document analysis.
5. Build company and vehicle timelines.
6. Add cross-document inconsistency rules.
7. Add operation-level decisions.
8. Introduce explainable scoring.
9. Generate defensible dossier exports.
10. Add privacy and cybersecurity modules.

## Delivery discipline

Each phase must include:

- Database migration.
- Service/API implementation.
- UI or report surface.
- Automated test or production smoke test.
- Backfill for existing records.
- Metrics and failure recovery.
- Commit and production deployment.
