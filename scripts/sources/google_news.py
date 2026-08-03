"""Fetch quantum computing news from Google News RSS."""

from __future__ import annotations
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

import httpx
from defusedxml import ElementTree as ET

RSS_URL = "https://news.google.com/rss/search"
QUERIES = ["quantum computing", "quantum annealing OR quantum optimization"]
SNIPPET_MAX_CHARS = 300
MAX_AGE_DAYS = 8

_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return " ".join(_TAG_RE.sub("", text or "").split())


def _fetch_query(query: str) -> list[dict]:
    params = {"q": query, "hl": "zh-TW", "gl": "TW", "ceid": "TW:zh-Hant"}
    try:
        response = httpx.get(RSS_URL, params=params, timeout=30)
        response.raise_for_status()
        root = ET.fromstring(response.text)
    except (httpx.HTTPError, httpx.TimeoutException, ET.ParseError):
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    items = []

    for item in root.findall("./channel/item"):
        pub_date_raw = item.findtext("pubDate", default="")
        try:
            published = parsedate_to_datetime(pub_date_raw)
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            continue
        if published < cutoff:
            continue

        source_el = item.find("source")
        items.append(
            {
                "url": item.findtext("link", default=""),
                "title": _strip_html(item.findtext("title", default="")),
                "source": source_el.text.strip() if source_el is not None and source_el.text else "",
                "published": published.isoformat(),
                "snippet": _strip_html(item.findtext("description", default=""))[:SNIPPET_MAX_CHARS],
            }
        )

    return items


def fetch_news_items(max_items: int = 20) -> list[dict]:
    """Fetch and merge news from all configured queries, deduped by URL.

    Any network/parse failure returns an empty list rather than raising --
    news is a supplementary source, not required for the pipeline to proceed.
    """
    merged: dict[str, dict] = {}
    for query in QUERIES:
        for item in _fetch_query(query):
            if item["url"] and item["url"] not in merged:
                merged[item["url"]] = item

    return list(merged.values())[:max_items]
