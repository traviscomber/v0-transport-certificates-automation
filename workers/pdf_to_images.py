#!/usr/bin/env python3
"""Rasterize a PDF into PNG pages for OCR outside the Next.js bundle.

Usage:
  python workers/pdf_to_images.py input.pdf output_dir --dpi 240 --max-pages 5

Exit codes:
  0 success
  2 invalid input or unsafe limits
  3 PDF could not be opened or rendered
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import fitz  # PyMuPDF


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert PDF pages to PNG for OCR")
    parser.add_argument("input_pdf", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--dpi", type=int, default=240)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--max-input-mb", type=int, default=20)
    return parser.parse_args()


def fail(message: str, code: int) -> None:
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False))
    raise SystemExit(code)


def main() -> None:
    args = parse_args()
    source = args.input_pdf.resolve()
    output_dir = args.output_dir.resolve()

    if args.dpi < 150 or args.dpi > 300:
        fail("dpi must be between 150 and 300", 2)
    if args.max_pages < 1 or args.max_pages > 10:
        fail("max-pages must be between 1 and 10", 2)
    if not source.is_file() or source.suffix.lower() != ".pdf":
        fail("input must be an existing PDF file", 2)
    if source.stat().st_size > args.max_input_mb * 1024 * 1024:
        fail("PDF exceeds configured size limit", 2)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        document = fitz.open(source)
    except Exception as exc:  # noqa: BLE001
        fail(f"could not open PDF: {exc}", 3)

    rendered: list[dict[str, object]] = []
    scale = args.dpi / 72.0
    matrix = fitz.Matrix(scale, scale)

    try:
        for page_index in range(min(document.page_count, args.max_pages)):
            page = document.load_page(page_index)
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            output_path = output_dir / f"page-{page_index + 1:03d}.png"
            pixmap.save(output_path)
            rendered.append(
                {
                    "page": page_index + 1,
                    "path": str(output_path),
                    "width": pixmap.width,
                    "height": pixmap.height,
                    "bytes": output_path.stat().st_size,
                }
            )
    except Exception as exc:  # noqa: BLE001
        fail(f"could not render PDF: {exc}", 3)
    finally:
        document.close()

    print(
        json.dumps(
            {
                "ok": True,
                "source": str(source),
                "pageCount": len(rendered),
                "dpi": args.dpi,
                "pages": rendered,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
