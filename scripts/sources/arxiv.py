"""Fetch this week's quant-ph papers from the arXiv API."""

from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

import httpx
from defusedxml import ElementTree as ET

ARXIV_API_URL = "https://export.arxiv.org/api/query"
ATOM_NS = "{http://www.w3.org/2005/Atom}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"

PAGE_SIZE = 100
MAX_PAGES = 10
REQUEST_INTERVAL_SECONDS = 3
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 10
ABSTRACT_MAX_CHARS = 800


def _parse_entry(entry) -> dict | None:
    arxiv_id_full = entry.findtext(f"{ATOM_NS}id", default="")
    # e.g. http://arxiv.org/abs/2407.12345v1 -> 2407.12345
    arxiv_id = arxiv_id_full.rsplit("/", 1)[-1].rsplit("v", 1)[0]
    if not arxiv_id:
        return None

    title = " ".join(entry.findtext(f"{ATOM_NS}title", default="").split())
    abstract = " ".join(entry.findtext(f"{ATOM_NS}summary", default="").split())[:ABSTRACT_MAX_CHARS]
    submitted = entry.findtext(f"{ATOM_NS}published", default="")
    authors = [
        author.findtext(f"{ATOM_NS}name", default="").strip()
        for author in entry.findall(f"{ATOM_NS}author")
    ]
    authors = [a for a in authors if a]

    primary_category_el = entry.find(f"{ARXIV_NS}primary_category")
    primary_category = primary_category_el.get("term") if primary_category_el is not None else None
    is_cross_list = primary_category is not None and primary_category != "quant-ph"

    return {
        "arxiv_id": arxiv_id,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "submitted": submitted,
        "url": f"https://arxiv.org/abs/{arxiv_id}",
        "is_cross_list": is_cross_list,
    }


def _fetch_page(start: int, days_back: int) -> list[dict]:
    params = {
        "search_query": "cat:quant-ph",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "start": start,
        "max_results": PAGE_SIZE,
    }

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            response = httpx.get(ARXIV_API_URL, params=params, timeout=30)
            response.raise_for_status()
            break
        except (httpx.HTTPError, httpx.TimeoutException) as error:
            last_error = error
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY_SECONDS)
    else:
        raise RuntimeError(f"arXiv API request failed after {MAX_RETRIES} attempts") from last_error

    root = ET.fromstring(response.text)
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)

    page_items = []
    for entry in root.findall(f"{ATOM_NS}entry"):
        parsed = _parse_entry(entry)
        if parsed is None:
            continue
        try:
            submitted_dt = datetime.fromisoformat(parsed["submitted"].replace("Z", "+00:00"))
        except ValueError:
            continue
        if submitted_dt < cutoff:
            continue
        page_items.append(parsed)

    return page_items


def fetch_arxiv_papers(days_back: int = 7) -> list[dict]:
    """Fetch quant-ph papers submitted in the last `days_back` days, paginating as needed."""
    all_items: list[dict] = []
    start = 0

    for page in range(MAX_PAGES):
        page_items = _fetch_page(start, days_back)
        all_items.extend(page_items)

        if len(page_items) < PAGE_SIZE:
            break

        start += PAGE_SIZE
        if page < MAX_PAGES - 1:
            time.sleep(REQUEST_INTERVAL_SECONDS)

    return all_items
