"""Fetch full-text HTML for an arXiv paper via the ar5iv mirror.

ar5iv (https://ar5iv.org) renders arXiv's LaTeX source into structured HTML
with real section headings, which is far easier to parse reliably than a PDF
or raw LaTeX source. Coverage isn't 100% (older or unusually-formatted
papers can fail to render), so any failure here just returns None -- callers
fall back to abstract-only analysis rather than treating this as fatal.
"""

from __future__ import annotations

import time

import httpx

AR5IV_URL_TEMPLATE = "https://ar5iv.org/abs/{arxiv_id}"
REQUEST_TIMEOUT_SECONDS = 30
MAX_RETRIES = 2
RETRY_DELAY_SECONDS = 5


def fetch_full_text(arxiv_id: str) -> str | None:
    """Return the raw ar5iv HTML for `arxiv_id`, or None if it can't be fetched."""
    url = AR5IV_URL_TEMPLATE.format(arxiv_id=arxiv_id)

    for attempt in range(MAX_RETRIES):
        try:
            response = httpx.get(url, timeout=REQUEST_TIMEOUT_SECONDS, follow_redirects=True)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.text
        except (httpx.HTTPError, httpx.TimeoutException):
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY_SECONDS)

    return None
