"""Supabase read/write operations for the news automation pipeline."""

from __future__ import annotations

import os

from supabase import Client, create_client

from scripts.processing.dedup import compute_item_id


def init_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, service_key)


def check_existing_draft(supabase: Client, week_label: str, kind: str = "weekly") -> dict | None:
    response = (
        supabase.table("news_drafts")
        .select("*")
        .eq("week_label", week_label)
        .eq("kind", kind)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def save_draft(supabase: Client, draft: dict) -> str:
    response = supabase.table("news_drafts").insert(draft).execute()
    return response.data[0]["id"]


def delete_draft(supabase: Client, draft_id: str) -> None:
    supabase.table("news_drafts").delete().eq("id", draft_id).execute()


def mark_as_seen(supabase: Client, papers: list[dict], news: list[dict]) -> None:
    rows = []
    for item in [*papers, *news]:
        item_id, source = compute_item_id(item)
        rows.append({"item_id": item_id, "source": source})

    if rows:
        supabase.table("news_seen_items").upsert(rows, on_conflict="item_id").execute()
