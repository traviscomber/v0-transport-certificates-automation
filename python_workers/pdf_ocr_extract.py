from __future__ import annotations

import re
from typing import Any

import fitz

from python_workers.pdf_ocr_common import (
    MAX_PAGES,
    OCR_DPI,
    PLATE_PATTERN,
    ApiError,
    is_refusal,
    openai_vision,
)


def extract_pdf(pdf_bytes: bytes, target_type: str, vehicle_related: bool) -> dict[str, Any]:
    try:
        document = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:  # noqa: BLE001
        raise ApiError(f"Could not open PDF: {exc}", 422) from exc
    if document.page_count < 1:
        document.close()
        raise ApiError("PDF has no pages", 422)

    total_pages = document.page_count
    page_limit = min(total_pages, MAX_PAGES)
    page_texts: list[str] = []
    ocr_pages = 0
    text_layer_pages = 0
    warnings: list[str] = []
    matrix = fitz.Matrix(OCR_DPI / 72.0, OCR_DPI / 72.0)

    try:
        for page_index in range(page_limit):
            page = document.load_page(page_index)
            direct_text = "\n".join(line.rstrip() for line in page.get_text("text").splitlines()).strip()
            if len(re.sub(r"\s+", "", direct_text)) >= 40:
                page_texts.append(f"--- PAGINA {page_index + 1} ---\n{direct_text}")
                text_layer_pages += 1
                continue

            png_bytes = page.get_pixmap(matrix=matrix, alpha=False).tobytes("png")
            text = openai_vision(png_bytes, target_type, vehicle_related)
            if len(text) < 4 or is_refusal(text):
                text = openai_vision(png_bytes, target_type, vehicle_related, retry=True)
            if len(text) >= 4 and not is_refusal(text):
                page_texts.append(f"--- PAGINA {page_index + 1} ---\n{text}")
                ocr_pages += 1
            else:
                warnings.append(f"page_{page_index + 1}_unreadable")
    finally:
        document.close()

    combined = "\n\n".join(page_texts).strip()
    if len(combined) < 4:
        raise ApiError("OCR_RETRYABLE: PDF did not yield valid visible document text", 422, retryable=True)
    if total_pages > page_limit:
        warnings.append(f"pdf_truncated_to_{page_limit}_pages")
    if text_layer_pages:
        warnings.append("pdf_text_layer")
    if ocr_pages:
        warnings.append("pdf_page_ocr")

    if vehicle_related and PLATE_PATTERN.search(combined):
        confidence = 0.98
    elif ocr_pages and text_layer_pages:
        confidence = 0.90
    elif ocr_pages:
        confidence = 0.82
    else:
        confidence = 0.96

    return {
        "text": combined,
        "confidence": confidence,
        "warnings": warnings,
        "pagesProcessed": page_limit,
        "ocrPages": ocr_pages,
        "textLayerPages": text_layer_pages,
    }
