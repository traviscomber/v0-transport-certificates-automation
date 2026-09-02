# ChileFlota

> **Transport Compliance OS**

[ChileFlota](https://chileflota.app) is an evidence-driven operating system for transport compliance. It connects transport companies, subcontractors, drivers, vehicles, documentary evidence, verification and operational follow-up in one traceable model.

The product originated in the LABBE transport operation and evolved beyond document reminders into a canonical compliance system.

<p align="center"><strong>Evidence → Validation → Compliance → Action</strong></p>

---

## What ChileFlota connects

| Operational object | What the system manages |
|---|---|
| **Transport company** | Canonical company identity, status and verification context |
| **Subcontractor** | Portal, evidence and compliance relationship |
| **Driver** | Identity, documents and review state |
| **Vehicle** | Vehicle evidence, PRT history and compliance context |
| **Document** | Versions, validity, review, provenance and audit history |
| **External evidence** | SII/PRT and other verification sources without overwriting source truth |
| **Automation** | Ingestion, reconciliation, OCR and exception handling |

---

## Product model

ChileFlota is built around evidence rather than a flat checklist.

```text
SOURCE EVIDENCE
      │
      ▼
Canonical company / driver / vehicle / document
      │
      ▼
Validation + reconciliation
      │
      ▼
Compliance state
      │
      ├────► routine case → automatic flow
      │
      └────► exception → human review
      │
      ▼
Operational action + traceability
```

Historical evidence is retained. A corrected or renewed document does not silently erase the record that came before it.

---

## Core capabilities

- canonical identity for transport companies, drivers and vehicles;
- documentary upload, review, approval and rejection;
- multiple valid document versions and historical evidence;
- high-volume PRT ingestion with resumable batches;
- external verification and provenance;
- OCR/document-intelligence processing;
- reconciliation between source evidence and operational state;
- exception queues and human review;
- role-scoped operational views;
- auditable automation and job health.

---

## Operating principles

1. **Evidence before inference.** Original source evidence remains attributable.
2. **Missing evidence is unknown.** Absence is not silently converted to failure.
3. **History is not a duplicate.** Versions, corrections and renewals can all be valid evidence.
4. **Identity is explicit.** Critical processing is tied to canonical records.
5. **Sensitive processing stays server-side.** Credentials and privileged workers are not client surfaces.
6. **Automation must reconcile.** A successful HTTP response alone does not prove the business outcome completed.
7. **Human review is for exceptions.** Routine deterministic work should not create unnecessary approval friction.

---

## Architecture

The current implementation uses a modern TypeScript web stack with PostgreSQL/Supabase, server-side workflows, row-level security and scheduled/background processing for high-volume evidence operations.

Deployment credentials, private transport data and production exports are intentionally excluded from public documentation.

---

## Product

**ChileFlota — Transport Compliance OS**  
[chileflota.app](https://chileflota.app)
