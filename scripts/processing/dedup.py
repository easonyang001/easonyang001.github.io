"""Remove items already seen in previous weeks."""

from __future__ import annotations

import hashlib


def compute_item_id(item: dict) -> tuple[str, str]:
    """Return (item_id, source) for a paper or news item."""
    if "arxiv_id" in item:
        return item["arxiv_id"], "arxiv"
    return hashlib.sha256(item["url"].encode("utf-8")).hexdigest()[:16], "news"


def filter_seen(items: list[dict], supabase_client) -> list[dict]:
    """Return the subset of `items` not already present in news_seen_items.

    Looks up all item IDs in a single batched query (no N+1). Does not write
    to news_seen_items itself -- the caller marks items as seen only after
    the draft has been generated successfully.
    """
    if not items:
        return []

    ids = [compute_item_id(item)[0] for item in items]

    response = (
        supabase_client.table("news_seen_items")
        .select("item_id")
        .in_("item_id", ids)
        .execute()
    )
    seen_ids = {row["item_id"] for row in response.data}

    return [item for item, item_id in zip(items, ids) if item_id not in seen_ids]
