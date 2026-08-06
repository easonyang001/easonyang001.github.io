from __future__ import annotations

import sys

from scripts import generate_news


def test_dry_run_does_not_initialize_supabase_or_openai(monkeypatch, capsys) -> None:
    papers = [
        {"arxiv_id": f"paper-{index}", "title": f"Quantum paper {index}", "abstract": "quantum"}
        for index in range(3)
    ]

    monkeypatch.setattr(sys, "argv", ["generate_news.py", "--dry-run"])
    monkeypatch.setattr(generate_news, "fetch_arxiv_papers", lambda days_back: papers)
    monkeypatch.setattr(generate_news, "fetch_news_items", lambda: [])
    monkeypatch.setattr(generate_news, "score_item", lambda item, fields: 1.0)
    monkeypatch.setattr(
        generate_news,
        "init_supabase_client",
        lambda: (_ for _ in ()).throw(AssertionError("Supabase must not initialize during dry-run")),
    )
    monkeypatch.setattr(
        generate_news,
        "generate_draft",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("OpenAI must not run during dry-run")),
    )

    assert generate_news.main() == 0
    assert "Dry run" in capsys.readouterr().out
