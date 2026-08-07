from scripts.generation.prompt import build_prompts


def test_prompts_are_built_per_language_and_include_source_links() -> None:
    papers = [
        {
            "arxiv_id": "2608.00001",
            "title": "Paper title",
            "authors": ["A. Author"],
            "url": "https://arxiv.org/abs/2608.00001",
            "abstract": "Paper abstract",
        }
    ]
    news = [
        {
            "source": "Publisher",
            "title": "News title",
            "url": "https://example.com/news",
            "snippet": "News summary",
        }
    ]

    prompts, prompt_hash = build_prompts(papers, news, "2026-W32")

    assert set(prompts) == {"zh-TW", "en", "fr"}
    for language, prompt in prompts.items():
        assert "weeklyNews" in prompt
        assert "selectedPapers" in prompt
        assert "literatureDeepDive" in prompt
        assert papers[0]["url"] in prompt
        assert news[0]["url"] in prompt
        # Each language's prompt asks only for that language, not all three.
        assert "translations" not in prompt

    assert prompts["fr"] != prompts["en"]
    assert len(prompt_hash) == 64
