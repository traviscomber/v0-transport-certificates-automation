from __future__ import annotations

import os
import time
from typing import Any

from python_workers.pdf_ocr_common import (
    MAX_PAGES,
    OCR_DPI,
    ApiError,
    SupabaseRest,
    download_pdf,
    expected_type,
    infer_metadata,
    is_vehicle_related,
    utc_now,
)
from python_workers.pdf_ocr_extract import extract_pdf


def _document_context(supabase: SupabaseRest, document_id: str) -> dict[str, Any]:
    rows = supabase.select(
        "subcontractor_documents",
        {"id": f"eq.{document_id}", "is_current": "eq.true"},
        "id,file_name,file_url,document_type_id,is_current",
    )
    if not rows:
        raise ApiError("Current document not found", 404)
    document = rows[0]
    file_name = str(document.get("file_name") or "")
    if not file_name.lower().endswith(".pdf"):
        raise ApiError("Targeted PDF OCR only accepts PDF documents", 415)
    document_type_id = document.get("document_type_id")
    type_rows = (
        supabase.select("document_types", {"id": f"eq.{document_type_id}"}, "code")
        if document_type_id
        else []
    )
    document_type = str(type_rows[0].get("code") if type_rows else "DOCUMENTO")
    return {
        "document": document,
        "fileName": file_name,
        "documentType": document_type,
        "vehicleRelated": is_vehicle_related(file_name, document_type),
        "targetType": expected_type(file_name, document_type),
    }


def _attempt_count(supabase: SupabaseRest, document_id: str) -> int:
    rows = supabase.select("document_text_extractions", {"document_id": f"eq.{document_id}"}, "attempts,status")
    return int((rows[0].get("attempts") if rows else 0) or 0) + 1


def _create_batch(supabase: SupabaseRest, document_id: str, context: dict[str, Any]) -> str:
    batch = supabase.insert(
        "ocr_processing_batches",
        {
            "source": "document_pdf_ocr_targeted",
            "status": "processing",
            "total_documents": 1,
            "metadata": {
                "documentId": document_id,
                "fileName": context["fileName"],
                "deployment": os.getenv("VERCEL_GIT_COMMIT_SHA"),
                "maxPages": MAX_PAGES,
                "dpi": OCR_DPI,
            },
        },
    )
    batch_id = str(batch["id"])
    supabase.insert(
        "ocr_batch_documents",
        {
            "batch_id": batch_id,
            "document_id": document_id,
            "status": "processing",
            "semaphore": "processing",
            "extraction_status": "processing",
            "metadata": {
                "fileName": context["fileName"],
                "documentType": context["documentType"],
                "targetType": context["targetType"],
            },
        },
    )
    return batch_id


def process_pdf_document(document_id: str) -> dict[str, Any]:
    started = time.monotonic()
    supabase = SupabaseRest()
    context = _document_context(supabase, document_id)
    attempts = _attempt_count(supabase, document_id)
    now = utc_now()
    supabase.upsert(
        "document_text_extractions",
        "document_id",
        {
            "document_id": document_id,
            "status": "processing",
            "attempts": attempts,
            "error_message": None,
            "updated_at": now,
        },
    )
    batch_id = _create_batch(supabase, document_id, context)

    try:
        pdf_bytes = download_pdf(str(context["document"].get("file_url") or ""))
        extraction = extract_pdf(pdf_bytes, context["targetType"], context["vehicleRelated"])
        extracted_text = str(extraction["text"]).strip()
        metadata = infer_metadata(extracted_text, context["targetType"])
        analyzed_at = utc_now()
        engine = "pymupdf_hybrid_openai_vision"

        supabase.update(
            "subcontractor_documents",
            {"id": f"eq.{document_id}"},
            {
                "ai_document_type": metadata["documentType"],
                "ai_expiration_date": metadata["expirationDate"],
                "ai_issuance_date": metadata["issuanceDate"],
                "ai_document_number": metadata["documentNumber"],
                "ai_extracted_text": extracted_text,
                "ai_confidence": extraction["confidence"],
                "ai_warnings": extraction["warnings"],
                "ai_analyzed_at": analyzed_at,
            },
        )
        supabase.update(
            "document_text_extractions",
            {"document_id": f"eq.{document_id}"},
            {
                "status": "text_extracted",
                "extraction_method": engine,
                "text_length": len(extracted_text),
                "error_message": None,
                "processed_at": analyzed_at,
                "updated_at": analyzed_at,
            },
        )

        canonical_status = "not_vehicle_related"
        candidate_count = 0
        matched_count = 0
        if context["vehicleRelated"]:
            supabase.rpc("canonicalize_vehicle_document", {"p_document_id": document_id})
            scans = supabase.select(
                "vehicle_document_scans",
                {"document_id": f"eq.{document_id}"},
                "status,candidate_count,matched_count,error_message",
            )
            if not scans:
                raise ApiError("Canonicalization did not persist vehicle_document_scans")
            canonical_status = str(scans[0].get("status") or "no_candidate")
            candidate_count = int(scans[0].get("candidate_count") or 0)
            matched_count = int(scans[0].get("matched_count") or 0)

        semaphore = "green" if canonical_status in {"matched", "not_vehicle_related"} else (
            "red" if canonical_status == "owner_conflict" else "yellow"
        )
        completed_at = utc_now()
        badge_eligible = bool(context["vehicleRelated"] and canonical_status == "matched")
        supabase.update(
            "ocr_batch_documents",
            {"batch_id": f"eq.{batch_id}", "document_id": f"eq.{document_id}"},
            {
                "status": "canonicalized",
                "semaphore": semaphore,
                "extraction_status": "text_extracted",
                "canonical_status": canonical_status,
                "completed_at": completed_at,
                "updated_at": completed_at,
                "metadata": {
                    "fileName": context["fileName"],
                    "documentType": context["targetType"],
                    "textLength": len(extracted_text),
                    "confidence": extraction["confidence"],
                    "engine": engine,
                    "vehicleRelated": context["vehicleRelated"],
                    "pagesProcessed": extraction["pagesProcessed"],
                    "ocrPages": extraction["ocrPages"],
                    "textLayerPages": extraction["textLayerPages"],
                    "badgeEligible": badge_eligible,
                },
            },
        )
        facts = supabase.rpc("sync_subcontractor_document_facts", {})
        supabase.update(
            "ocr_processing_batches",
            {"id": f"eq.{batch_id}"},
            {
                "status": "completed",
                "processed_documents": 1,
                "successful_documents": 1,
                "failed_documents": 0,
                "completed_at": completed_at,
                "updated_at": completed_at,
            },
        )
        return {
            "httpStatus": 200,
            "batchId": batch_id,
            "batchStatus": "completed",
            "documentId": document_id,
            "fileName": context["fileName"],
            "status": "text_extracted",
            "canonicalStatus": canonical_status,
            "semaphore": semaphore,
            "vehicleRelated": context["vehicleRelated"],
            "badgeEligible": badge_eligible,
            "candidateCount": candidate_count,
            "matchedCount": matched_count,
            "textLength": len(extracted_text),
            "confidence": extraction["confidence"],
            "pagesProcessed": extraction["pagesProcessed"],
            "ocrPages": extraction["ocrPages"],
            "textLayerPages": extraction["textLayerPages"],
            "documentFacts": facts,
            "durationMs": int((time.monotonic() - started) * 1000),
        }
    except Exception as exc:  # noqa: BLE001
        error = exc if isinstance(exc, ApiError) else ApiError(str(exc))
        failed_at = utc_now()
        final_status = "requires_new_photo" if context["vehicleRelated"] and attempts >= 2 else (
            "failed" if not context["vehicleRelated"] and attempts >= 3 else "queued_retry"
        )
        try:
            supabase.upsert(
                "document_text_extractions",
                "document_id",
                {
                    "document_id": document_id,
                    "status": final_status,
                    "attempts": attempts,
                    "text_length": 0,
                    "error_message": str(error)[:1000],
                    "processed_at": None,
                    "updated_at": failed_at,
                },
            )
            supabase.update(
                "ocr_batch_documents",
                {"batch_id": f"eq.{batch_id}", "document_id": f"eq.{document_id}"},
                {
                    "status": final_status,
                    "semaphore": "yellow",
                    "extraction_status": final_status,
                    "canonical_status": "not_run",
                    "error_message": str(error)[:1000],
                    "completed_at": failed_at,
                    "updated_at": failed_at,
                },
            )
            supabase.update(
                "ocr_processing_batches",
                {"id": f"eq.{batch_id}"},
                {
                    "status": "failed",
                    "processed_documents": 1,
                    "successful_documents": 0,
                    "failed_documents": 1,
                    "error_message": str(error)[:1000],
                    "completed_at": failed_at,
                    "updated_at": failed_at,
                },
            )
        except Exception:
            pass
        return {
            "httpStatus": error.status,
            "batchId": batch_id,
            "documentId": document_id,
            "status": final_status,
            "vehicleRelated": context["vehicleRelated"],
            "badgeEligible": False,
            "error": str(error),
            "durationMs": int((time.monotonic() - started) * 1000),
        }
