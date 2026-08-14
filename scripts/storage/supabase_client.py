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


def save_draft(supabase: Client, draft: dict) -> str:
    response = supabase.table("news_drafts").insert(draft).execute()
    return response.data[0]["id"]


def get_cached_paper_intelligence(supabase: Client, arxiv_id: str, prompt_hash: str) -> dict | None:
    """Return a previously-computed analysis for this exact (paper, prompt) pair, if any."""
    response = (
        supabase.table("paper_intelligence")
        .select("analysis")
        .eq("arxiv_id", arxiv_id)
        .eq("prompt_hash", prompt_hash)
        .limit(1)
        .execute()
    )
    return response.data[0]["analysis"] if response.data else None


def save_paper_intelligence(
    supabase: Client, arxiv_id: str, prompt_hash: str, analysis: dict, model: str
) -> None:
    supabase.table("paper_intelligence").upsert(
        {"arxiv_id": arxiv_id, "prompt_hash": prompt_hash, "analysis": analysis, "model": model},
        on_conflict="arxiv_id,prompt_hash",
    ).execute()


def mark_as_seen(supabase: Client, papers: list[dict], news: list[dict]) -> None:
    rows = []
    for item in [*papers, *news]:
        item_id, source = compute_item_id(item)
        rows.append({"item_id": item_id, "source": source})

    if rows:
        supabase.table("news_seen_items").upsert(rows, on_conflict="item_id").execute()
