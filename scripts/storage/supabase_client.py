"""Supabase read/write operations for the news automation pipeline."""

from __future__ import annotations

import os

from supabase import Client, create_client

from scripts.processing.dedup import compute_item_id


def init_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, service_key)


def check_existing_draft(supabase: Client, week_label: str) -> dict | None:
    response = (
        supabase.table("news_drafts").select("*").eq("week_label", week_label).limit(1).execute()
    )
    return response.data[0] if response.data else None


def save_draft(supabase: Client, draft: dict, *, force: bool = False) -> str:
    if force:
        draft = {
            **draft,
            "status": "draft",
            "reviewed_by": None,
            "reviewed_at": None,
            "published_at": None,
        }
        response = (
            supabase.table("news_drafts")
            .upsert(draft, on_conflict="week_label")
            .execute()
        )
    else:
        response = supabase.table("news_drafts").insert(draft).execute()
    return response.data[0]["id"]


def mark_as_seen(supabase: Client, papers: list[dict], news: list[dict]) -> None:
    rows = []
    for item in [*papers, *news]:
        item_id, source = compute_item_id(item)
        rows.append({"item_id": item_id, "source": source})

    if rows:
        supabase.table("news_seen_items").upsert(rows, on_conflict="item_id").execute()
