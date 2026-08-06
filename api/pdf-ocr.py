from __future__ import annotations

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from python_workers.pdf_ocr_pipeline import process_pdf_document


class handler(BaseHTTPRequestHandler):
    def _respond(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        secret = os.getenv("CRON_SECRET")
        if secret and self.headers.get("Authorization") != f"Bearer {secret}":
            self._respond(401, {"error": "Unauthorized"})
            return
        document_id = parse_qs(urlparse(self.path).query).get("documentId", [""])[0]
        if not document_id:
            self._respond(400, {"error": "documentId is required"})
            return
        result = process_pdf_document(document_id)
        self._respond(int(result.pop("httpStatus", 500)), result)
